import express from "express";
import Quiz from "../models/quiz.js";
import Question from "../models/question.js";
import Group from "../models/group.js";
import authenticateToken from "../middleware/auth.js";
import requireRole from "../middleware/role.js";

const router = express.Router();

router.use(authenticateToken, requireRole("admin"));

// Quizzes CRUD
/**
 * @openapi
 * /admin/quizzes:
 *   get:
 *     summary: Get all quizzes (admin)
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: List of quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/quizzes", async (req, res) => {
  try {
    res.json(await Quiz.getAll());
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

/**
 * @openapi
 * /admin/quizzes/{id}:
 *   get:
 *     summary: Get a specific quiz (admin)
 *     tags:
 *       - Admin
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
router.get("/quizzes/:id", async (req, res) => {
  try {
    const quiz = await Quiz.getById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
});

/**
 * @openapi
 * /admin/quizzes:
 *   post:
 *     summary: Create a new quiz (admin)
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               group_id:
 *                 type: string
 *               total_points:
 *                 type: number
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               is_published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Quiz created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 */
router.post("/quizzes", async (req, res) => {
  try {
    if (!req.user || typeof req.user !== "object" || !("id" in req.user)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const created_by =
      typeof req.user.id === "string" ? parseInt(req.user.id, 10) : req.user.id;
    res.json(await Quiz.create({ ...req.body, created_by }));
  } catch (error) {
    res.status(500).json({ error: "Failed to create quiz" });
  }
});

/**
 * @openapi
 * /admin/quizzes/{id}:
 *   put:
 *     summary: Update a quiz (admin)
 *     tags:
 *       - Admin
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
 *     responses:
 *       200:
 *         description: Quiz updated
 *       404:
 *         description: Quiz not found
 */
router.put("/quizzes/:id", async (req, res) => {
  try {
    const result = await Quiz.update(req.params.id, req.body);
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    // Fetch and return the updated quiz
    const updatedQuiz = await Quiz.getById(req.params.id);
    res.json(updatedQuiz);
  } catch (error) {
    res.status(500).json({ error: "Failed to update quiz" });
  }
});

/**
 * @openapi
 * /admin/quizzes/{id}:
 *   delete:
 *     summary: Delete a quiz (admin)
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Quiz ID
 *     responses:
 *       204:
 *         description: Quiz deleted
 */
router.delete("/quizzes/:id", async (req, res) => {
  try {
    await Question.deleteByQuiz(req.params.id);
    await Quiz.delete(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete quiz" });
  }
});

// Questions CRUD
/**
 * @openapi
 * /admin/questions/{quiz_id}:
 *   get:
 *     summary: Get questions for a quiz (admin)
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: quiz_id
 *         schema:
 *           type: string
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
router.get("/questions/:quiz_id", async (req, res) => {
  try {
    res.json(await Question.getByQuiz(req.params.quiz_id));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

/**
 * @openapi
 * /admin/questions/{id}:
 *   get:
 *     summary: Get a specific question (admin)
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/questions/:id", async (req, res) => {
  try {
    const question = await Question.getById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch question" });
  }
});

/**
 * @openapi
 * /admin/questions:
 *   post:
 *     summary: Create a question (admin)
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quiz_id:
 *                 type: string
 *               text:
 *                 type: string
 *               choices:
 *                 type: array
 *                 items:
 *                   type: object
 *               points:
 *                 type: number
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               order:
 *                 type: number
 *     responses:
 *       200:
 *         description: Question created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post("/questions", async (req, res) => {
  try {
    res.json(await Question.create(req.body));
  } catch (error) {
    res.status(500).json({ error: "Failed to create question" });
  }
});

/**
 * @openapi
 * /admin/questions/{id}:
 *   put:
 *     summary: Update a question (admin)
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Question updated
 *       404:
 *         description: Question not found
 */
router.put("/questions/:id", async (req, res) => {
  try {
    const result = await Question.update(req.params.id, req.body);
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.json({ message: "Question updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update question" });
  }
});

/**
 * @openapi
 * /admin/questions/{id}:
 *   delete:
 *     summary: Delete a question (admin)
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Question ID
 *     responses:
 *       204:
 *         description: Question deleted
 */
router.delete("/questions/:id", async (req, res) => {
  try {
    await Question.delete(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete question" });
  }
});

// Groups CRUD
/**
 * @openapi
 * /admin/groups:
 *   get:
 *     summary: Get all groups (admin)
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: List of groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/groups", async (req, res) => {
  try {
    res.json(await Group.getAll());
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

/**
 * @openapi
 * /admin/groups/{id}:
 *   get:
 *     summary: Get a specific group (admin)
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/groups/:id", async (req, res) => {
  try {
    const group = await Group.getById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch group" });
  }
});

/**
 * @openapi
 * /admin/groups:
 *   post:
 *     summary: Create a new group (admin)
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Group created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 */
router.post("/groups", async (req, res) => {
  try {
    if (!req.user || typeof req.user !== "object" || !("id" in req.user)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const created_by =
      typeof req.user.id === "string" ? parseInt(req.user.id, 10) : req.user.id;
    res.json(await Group.create({ ...req.body, created_by }));
  } catch (error) {
    res.status(500).json({ error: "Failed to create group" });
  }
});

/**
 * @openapi
 * /admin/groups/{id}:
 *   put:
 *     summary: Update a group (admin)
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Group updated
 *       404:
 *         description: Group not found
 */
router.put("/groups/:id", async (req, res) => {
  try {
    const result = await Group.update(req.params.id, req.body);
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Group not found" });
    }
    // Fetch and return the updated group
    const updatedGroup = await Group.getById(req.params.id);
    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ error: "Failed to update group" });
  }
});

/**
 * @openapi
 * /admin/groups/{id}:
 *   delete:
 *     summary: Delete a group (admin)
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Group ID
 *     responses:
 *       204:
 *         description: Group deleted
 */
router.delete("/groups/:id", async (req, res) => {
  try {
    await Group.delete(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete group" });
  }
});

export default router;
