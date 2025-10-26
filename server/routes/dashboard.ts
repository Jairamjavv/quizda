import express from "express";
import Attempt from "../models/attempt.js";
import { authenticateSession } from "../middleware/sessionAuth.js";
import { logger } from "../logger.js";
import Group from "../models/group.js";
import Quiz from "../models/quiz.js";

const router = express.Router();

router.use(authenticateSession);

// Type conversion utilities for PostgreSQL NUMERIC fields
const TypeConverters = {
  /**
   * Safely converts PostgreSQL NUMERIC values (which come as strings) to numbers
   * @param value - The value to convert (can be number, string, or unknown)
   * @returns Parsed number or 0 if conversion fails
   */
  toNumber(value: unknown): number {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  },

  /**
   * Converts user ID from request (can be string or number) to number
   * @param id - The user ID to convert
   * @returns Parsed integer or the original number
   */
  toUserId(id: string | number): number {
    return typeof id === "string" ? Number.parseInt(id, 10) : id;
  },
};

// Helper function to extract and validate user ID from request
function getUserId(req: express.Request): number | null {
  // Use authenticatedUser from session auth middleware
  if (req.authenticatedUser && req.authenticatedUser.id) {
    return req.authenticatedUser.id;
  }
  return null;
}

/**
 * @openapi
 * /dashboard:
 *   get:
 *     summary: Get dashboard metrics for the authenticated user
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalQuizzesTaken:
 *                   type: integer
 *                 streakDays:
 *                   type: integer
 *                 averageScore:
 *                   type: number
 *                 tagStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tagName:
 *                         type: string
 *                       totalAttempts:
 *                         type: integer
 *                       correctAttempts:
 *                         type: integer
 *                       accuracyPercent:
 *                         type: number
 *                 swot:
 *                   type: object
 *                   properties:
 *                     strengths:
 *                       type: array
 *                       items:
 *                         type: string
 *                     weaknesses:
 *                       type: array
 *                       items:
 *                         type: string
 *                     opportunities:
 *                       type: array
 *                       items:
 *                         type: string
 *                     threats:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/", async (req, res) => {
  const userId = getUserId(req);
  if (userId === null) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const groupId = req.query.groupId as string | undefined;

  try {
    // Get user attempts (optionally filtered by group)
    const attempts = await Attempt.getByUser(userId);
    let completedAttempts = attempts.filter((a) => a.completed_at);

    // Filter by group if specified
    if (groupId && groupId !== "all") {
      const groupQuizzes = await Quiz.getAll();
      const groupQuizIds = groupQuizzes
        .filter((q: any) => q.group_id && q.group_id.toString() === groupId)
        .map((q: any) => q._id.toString());

      completedAttempts = completedAttempts.filter((a) =>
        groupQuizIds.includes(a.quiz_id)
      );
    }

    // Calculate total quizzes taken
    const totalQuizzesTaken = completedAttempts.length;

    // Calculate streak
    const streakData = await Attempt.getStreakData(userId);
    let streakDays = 0;
    if (streakData.length > 0) {
      const today = new Date().toISOString().slice(0, 10);
      const dates = streakData
        .map((row) => row.attempt_date)
        .sort()
        .reverse();

      let currentStreak = 0;
      let currentDate = new Date(today);

      for (const dateStr of dates) {
        const attemptDate = new Date(dateStr);
        const diffTime = currentDate.getTime() - attemptDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (
          diffDays === currentStreak ||
          (currentStreak === 0 && diffDays <= 1)
        ) {
          currentStreak++;
          currentDate = attemptDate;
        } else {
          break;
        }
      }

      streakDays = currentStreak;
    }

    // Calculate average score
    const totalScore = completedAttempts.reduce(
      (sum, attempt) => sum + TypeConverters.toNumber(attempt.score),
      0
    );
    const totalMaxPoints = completedAttempts.reduce(
      (sum, attempt) => sum + TypeConverters.toNumber(attempt.max_points),
      0
    );
    const averageScore =
      totalMaxPoints > 0 ? (totalScore / totalMaxPoints) * 100 : 0;

    // Get tag statistics
    const tagStatsData = await Attempt.getTagStats(userId);
    const tagStats = tagStatsData.map((row) => ({
      tagName: row.tag_name,
      totalAttempts: parseInt(row.total_attempts),
      correctAttempts: parseInt(row.correct_attempts),
      accuracyPercent: parseFloat(row.avg_accuracy) * 100 || 0,
    }));

    // Calculate SWOT analysis
    const swot = {
      strengths: tagStats
        .filter((tag) => tag.accuracyPercent >= 75 && tag.totalAttempts >= 3)
        .map((tag) => tag.tagName),
      weaknesses: tagStats
        .filter((tag) => tag.accuracyPercent <= 50 && tag.totalAttempts >= 2)
        .map((tag) => tag.tagName),
      opportunities: tagStats
        .filter((tag) => tag.totalAttempts < 3 && tag.accuracyPercent > 50)
        .map((tag) => tag.tagName),
      threats: tagStats
        .filter((tag) => tag.accuracyPercent < 50 && tag.totalAttempts >= 2)
        .map((tag) => tag.tagName),
    };

    res.json({
      totalQuizzesTaken,
      streakDays,
      averageScore,
      tagStats,
      swot,
      recentAttempts: completedAttempts
        .sort(
          (a, b) =>
            new Date(b.completed_at!).getTime() -
            new Date(a.completed_at!).getTime()
        )
        .slice(0, 5)
        .map((attempt) => ({
          id: attempt.id,
          quiz_id: attempt.quiz_id,
          mode: attempt.mode,
          started_at: attempt.started_at,
          completed_at: attempt.completed_at,
          score: attempt.score,
          max_points: attempt.max_points,
          tags_snapshot: attempt.tags_snapshot,
        })),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

/**
 * @openapi
 * /dashboard/attempts:
 *   get:
 *     summary: Get user's quiz attempts
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's quiz attempts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   quiz_id:
 *                     type: string
 *                   mode:
 *                     type: string
 *                   started_at:
 *                     type: string
 *                   completed_at:
 *                     type: string
 *                   score:
 *                     type: number
 *                   max_points:
 *                     type: number
 *                   tags_snapshot:
 *                     type: array
 *                     items:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/attempts", async (req, res) => {
  if (!req.authenticatedUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.authenticatedUser.id;

  try {
    const attempts = await Attempt.getByUser(userId);
    res.json(attempts);
  } catch (error) {
    console.error("Attempts error:", error);
    res.status(500).json({ error: "Failed to load attempts" });
  }
});

/**
 * @openapi
 * /dashboard/groups:
 *   get:
 *     summary: Get available groups with user's attempt statistics
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available groups
 */
router.get("/groups", async (req, res) => {
  const userId = getUserId(req);
  if (userId === null) {
    logger.warn("Unauthorized access attempt to /dashboard/groups");
    return res.status(401).json({ error: "Unauthorized" });
  }

  logger.info("Fetching groups for user", { userId });

  try {
    logger.debug("Loading groups and quizzes from MongoDB");
    const attempts = await Attempt.getByUser(userId);
    const completedAttempts = attempts.filter((a) => a.completed_at);

    const groups = await Group.getAll();
    const quizzes = await Quiz.getAll();

    logger.info("Data loaded successfully", {
      groupsCount: groups.length,
      quizzesCount: quizzes.length,
      attemptsCount: completedAttempts.length,
    });

    // Calculate stats for each group
    const groupStats = groups.map((group: any) => {
      const groupQuizIds = quizzes
        .filter(
          (q: any) =>
            q.group_id && q.group_id.toString() === group._id.toString()
        )
        .map((q: any) => q._id.toString());

      const groupAttempts = completedAttempts.filter((a) =>
        groupQuizIds.includes(a.quiz_id)
      );

      const totalScore = groupAttempts.reduce(
        (sum, a) => sum + TypeConverters.toNumber(a.score),
        0
      );
      const totalMaxPoints = groupAttempts.reduce(
        (sum, a) => sum + TypeConverters.toNumber(a.max_points),
        0
      );
      const averageScore =
        totalMaxPoints > 0 ? (totalScore / totalMaxPoints) * 100 : 0;

      return {
        id: group._id,
        name: group.name,
        attemptCount: groupAttempts.length,
        averageScore: averageScore,
      };
    });

    logger.info("Groups stats calculated successfully", {
      statsCount: groupStats.length,
    });
    res.json(groupStats);
  } catch (error: any) {
    logger.error("Failed to load groups", error, { userId });
    res.status(500).json({
      error: "Failed to load groups",
      details:
        process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
});

/**
 * @openapi
 * /dashboard/attempts/{attemptId}:
 *   get:
 *     summary: Get detailed information about a specific attempt
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The attempt ID
 *     responses:
 *       200:
 *         description: Detailed attempt information including per-question results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attempt not found
 */
router.get("/attempts/:attemptId", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    logger.warn("Attempt to access attempt details without authentication");
    return res.status(401).json({ error: "User not authenticated" });
  }

  const attemptId = Number.parseInt(req.params.attemptId, 10);
  if (isNaN(attemptId)) {
    return res.status(400).json({ error: "Invalid attempt ID" });
  }

  try {
    const attempt = await Attempt.getById(attemptId);

    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found" });
    }

    // Verify the attempt belongs to the authenticated user
    if (attempt.user_id !== userId) {
      logger.warn(
        `User ${userId} attempted to access attempt ${attemptId} belonging to user ${attempt.user_id}`
      );
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(attempt);
  } catch (error: any) {
    logger.error("Error fetching attempt details:", {
      error: error.message,
      stack: error.stack,
      attemptId,
      userId,
    });
    res.status(500).json({
      error: "Failed to fetch attempt details",
      details:
        process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
});

export default router;
