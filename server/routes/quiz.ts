import express from "express";
import Quiz from "../models/quiz.js";
import Question from "../models/question.js";
import Attempt from "../models/attempt.js";
import Group from "../models/group.js";
import FlaggedQuestion from "../models/flaggedQuestion.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

/**
 * @openapi
 * /quizzes:
 *   get:
 *     summary: Get all published quizzes
 *     tags:
 *       - Quiz
 *     responses:
 *       200:
 *         description: List of published quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/", async (req, res) => {
  res.json(await Quiz.getPublished());
});

/**
 * @openapi
 * /quizzes/groups:
 *   get:
 *     summary: Get all groups (for quiz selection)
 *     description: Returns all available groups. Users can view all groups and take quizzes from any group.
 *     tags:
 *       - Quiz
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Server error
 */
router.get("/groups", async (req, res) => {
  try {
    const groups = await Group.getAll();
    res.json(groups);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch groups",
      details:
        process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
});

/**
 * @openapi
 * /quizzes/{id}:
 *   get:
 *     summary: Get a specific quiz
 *     tags:
 *       - Quiz
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/:id", async (req, res) => {
  const quiz = await Quiz.getById(req.params.id);
  if (!quiz) {
    return res.status(404).json({ error: "Quiz not found" });
  }
  res.json(quiz);
});

/**
 * @openapi
 * /quizzes/{id}/questions:
 *   get:
 *     summary: Get questions for a quiz
 *     tags:
 *       - Quiz
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: List of questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/:id/questions", async (req, res) => {
  res.json(await Question.getByQuiz(req.params.id));
});

/**
 * @openapi
 * /quizzes/{id}/attempt:
 *   post:
 *     summary: Attempt a quiz
 *     tags:
 *       - Quiz
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mode
 *               - duration
 *               - results
 *             properties:
 *               mode:
 *                 type: string
 *               duration:
 *                 type: integer
 *               results:
 *                 type: object
 *     responses:
 *       200:
 *         description: Attempt created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 */
router.post("/:id/attempt", async (req, res) => {
  if (!req.user || typeof req.user !== "object" || !("id" in req.user)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user_id =
    typeof req.user.id === "string" ? parseInt(req.user.id, 10) : req.user.id;
  const quiz_id = req.params.id;
  const {
    mode,
    timed_duration_minutes,
    started_at,
    completed_at,
    score,
    max_points,
    per_question_results,
    tags_snapshot,
  } = req.body;
  const attempt = await Attempt.create({
    user_id,
    quiz_id,
    mode,
    timed_duration_minutes,
    started_at: new Date(started_at),
    completed_at: new Date(completed_at),
    score,
    max_points,
    per_question_results,
    tags_snapshot,
  });
  res.json(attempt);
});

/**
 * @openapi
 * /quizzes/{id}/flagged-questions:
 *   post:
 *     summary: Submit flagged questions for a quiz attempt
 *     tags:
 *       - Quiz
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attempt_id
 *               - flagged_questions
 *             properties:
 *               attempt_id:
 *                 type: integer
 *                 description: The attempt ID this flagging is associated with
 *               flagged_questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question_id:
 *                       type: string
 *                     reason:
 *                       type: string
 *     responses:
 *       200:
 *         description: Flagged questions saved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/:id/flagged-questions", async (req, res) => {
  if (!req.user || typeof req.user !== "object" || !("id" in req.user)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user_id =
    typeof req.user.id === "string" ? parseInt(req.user.id, 10) : req.user.id;
  const quiz_id = req.params.id;
  const { attempt_id, flagged_questions } = req.body;

  if (!attempt_id || !flagged_questions || !Array.isArray(flagged_questions)) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  try {
    const flaggedData = flagged_questions.map((fq: any) => ({
      user_id,
      attempt_id,
      quiz_id,
      question_id: fq.question_id,
      reason: fq.reason || "No reason provided",
    }));

    const result = await FlaggedQuestion.bulkCreate(flaggedData);
    res.json({
      message: "Flagged questions saved successfully",
      count: result.length,
      flagged: result,
    });
  } catch (error: any) {
    console.error("Error saving flagged questions:", error);
    res.status(500).json({
      error: "Failed to save flagged questions",
      details:
        process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
});

export default router;
