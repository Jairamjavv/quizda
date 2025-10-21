import express from "express";
import Attempt from "../models/attempt.js";
import authenticateToken from "../middleware/auth.js";
import { logger } from "../logger.js";

const router = express.Router();

router.use(authenticateToken);

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
  if (!req.user || typeof req.user !== "object" || !("id" in req.user)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId =
    typeof req.user.id === "string" ? parseInt(req.user.id, 10) : req.user.id;
  const groupId = req.query.groupId as string | undefined;

  try {
    // Get user attempts (optionally filtered by group)
    const attempts = await Attempt.getByUser(userId);
    let completedAttempts = attempts.filter((a) => a.completed_at);

    // Filter by group if specified
    if (groupId && groupId !== "all") {
      const Quiz = (await import("../models/quiz.js")).default;
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
      (sum, attempt) => sum + (parseFloat(attempt.score as any) || 0),
      0
    );
    const totalMaxPoints = completedAttempts.reduce(
      (sum, attempt) => sum + (parseFloat(attempt.max_points as any) || 0),
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
  if (!req.user || typeof req.user !== "object" || !("id" in req.user)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId =
    typeof req.user.id === "string" ? parseInt(req.user.id, 10) : req.user.id;

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
  if (!req.user || typeof req.user !== "object" || !("id" in req.user)) {
    logger.warn("Unauthorized access attempt to /dashboard/groups");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId =
    typeof req.user.id === "string" ? parseInt(req.user.id, 10) : req.user.id;

  logger.info("Fetching groups for user", { userId });

  try {
    const Group = (await import("../models/group.js")).default;
    const Quiz = (await import("../models/quiz.js")).default;

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
        (sum, a) => sum + (parseFloat(a.score as any) || 0),
        0
      );
      const totalMaxPoints = groupAttempts.reduce(
        (sum, a) => sum + (parseFloat(a.max_points as any) || 0),
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

export default router;
