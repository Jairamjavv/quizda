import express from "express";
import Quiz from "../models/quiz.js";
import Question from "../models/question.js";
import Attempt from "../models/attempt.js";
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

export default router;
