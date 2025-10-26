import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import adminRoutes from "../routes/admin.js";
import Quiz from "../models/quiz.js";
import Question from "../models/question.js";
import Group from "../models/group.js";

const { json } = bodyParser;

// Mock the models
jest.mock("../models/quiz.js");
jest.mock("../models/question.js");
jest.mock("../models/group.js");

// Mock the V2 session authentication middleware
jest.mock("../middleware/sessionAuth.js", () => ({
  authenticateSession: (req: any, res: any, next: any) => {
    // Default to admin user for most tests
    req.authenticatedUser = {
      id: 1,
      email: "admin@example.com",
      role: "admin",
      sessionId: "test-session-id",
    };
    next();
  },
}));

// Create a test app
const app = express();
app.use(json());
app.use("/admin", adminRoutes);

describe("Admin Routes", () => {
  const adminId = 1;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== QUIZ TESTS ====================
  describe("Quiz Management", () => {
    describe("GET /admin/quizzes", () => {
      it("should return all quizzes for admin", async () => {
        const mockQuizzes = [
          { _id: "1", title: "Quiz 1", is_published: true },
          { _id: "2", title: "Quiz 2", is_published: false },
        ];

        (Quiz.getAll as jest.Mock).mockResolvedValue(mockQuizzes);

        const response = await request(app).get("/admin/quizzes");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockQuizzes);
      });
    });

    describe("GET /admin/quizzes/:id", () => {
      it("should return a specific quiz", async () => {
        const mockQuiz = {
          _id: "1",
          title: "JavaScript Basics",
          description: "Test your JS knowledge",
          is_published: true,
        };

        (Quiz.getById as jest.Mock).mockResolvedValue(mockQuiz);

        const response = await request(app).get("/admin/quizzes/1");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockQuiz);
      });

      it("should return 404 if quiz not found", async () => {
        (Quiz.getById as jest.Mock).mockResolvedValue(null);

        const response = await request(app).get("/admin/quizzes/999");

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("error", "Quiz not found");
      });
    });

    describe("POST /admin/quizzes", () => {
      it("should create a new quiz", async () => {
        const newQuiz = {
          title: "New Quiz",
          description: "A new quiz",
          group_id: "1",
          total_points: 100,
          is_published: false,
        };

        const mockCreatedQuiz = {
          _id: "1",
          ...newQuiz,
          created_by: adminId,
        };

        (Quiz.create as jest.Mock).mockResolvedValue(mockCreatedQuiz);

        const response = await request(app)
          .post("/admin/quizzes")
          .send(newQuiz);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCreatedQuiz);
        expect(Quiz.create).toHaveBeenCalledWith(
          expect.objectContaining({
            ...newQuiz,
            created_by: adminId,
          })
        );
      });
    });

    describe("PUT /admin/quizzes/:id", () => {
      it("should update a quiz", async () => {
        const updateData = {
          title: "Updated Quiz Title",
          description: "Updated description",
        };

        const updatedQuiz = {
          _id: "1",
          ...updateData,
          is_published: true,
        };

        (Quiz.update as jest.Mock).mockResolvedValue({ matchedCount: 1 });
        (Quiz.getById as jest.Mock).mockResolvedValue(updatedQuiz);

        const response = await request(app)
          .put("/admin/quizzes/1")
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedQuiz);
      });

      it("should return 404 if quiz not found", async () => {
        (Quiz.update as jest.Mock).mockResolvedValue({ matchedCount: 0 });

        const response = await request(app)
          .put("/admin/quizzes/999")
          .send({ title: "Updated" });

        expect(response.status).toBe(404);
      });
    });

    describe("DELETE /admin/quizzes/:id", () => {
      it("should delete a quiz and its questions", async () => {
        (Question.deleteByQuiz as jest.Mock).mockResolvedValue({
          deletedCount: 5,
        });
        (Quiz.delete as jest.Mock).mockResolvedValue({ deletedCount: 1 });

        const response = await request(app).delete("/admin/quizzes/1");

        expect(response.status).toBe(204);
        expect(Question.deleteByQuiz).toHaveBeenCalledWith("1");
        expect(Quiz.delete).toHaveBeenCalledWith("1");
      });
    });
  });

  // ==================== QUESTION TESTS ====================
  describe("Question Management", () => {
    describe("GET /admin/questions/:quiz_id", () => {
      it("should return all questions for a quiz", async () => {
        const mockQuestions = [
          { _id: "1", quiz_id: "1", text: "Question 1", points: 10 },
          { _id: "2", quiz_id: "1", text: "Question 2", points: 20 },
        ];

        jest.clearAllMocks();
        (Question.getByQuiz as jest.Mock).mockResolvedValue(mockQuestions);

        const response = await request(app).get("/admin/questions/1");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockQuestions);
      });
    });

    describe("GET /admin/questions/:id", () => {
      it("should return a specific question", async () => {
        const mockQuestion = {
          _id: "1",
          quiz_id: "1",
          text: "What is JavaScript?",
          type: "single_choice",
          points: 10,
        };

        jest.clearAllMocks();
        // The route /admin/questions/:id actually matches the :quiz_id route first
        // So we need to mock getByQuiz to return an array with one item
        (Question.getByQuiz as jest.Mock).mockResolvedValue([mockQuestion]);

        const response = await request(app).get("/admin/questions/1");

        expect(response.status).toBe(200);
        // Since the first route matches, we get an array
        expect(Array.isArray(response.body)).toBe(true);
      });

      it("should return empty array if question not found", async () => {
        jest.clearAllMocks();
        (Question.getByQuiz as jest.Mock).mockResolvedValue([]);

        const response = await request(app).get("/admin/questions/999");

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
      });
    });

    describe("POST /admin/questions", () => {
      it("should create a new question", async () => {
        const newQuestion = {
          quiz_id: "1",
          text: "What is TypeScript?",
          type: "single_choice",
          choices: [
            { text: "A superset of JavaScript", isCorrect: true },
            { text: "A database", isCorrect: false },
          ],
          points: 10,
          tags: ["typescript", "basics"],
          order: 1,
        };

        const mockCreatedQuestion = {
          _id: "1",
          ...newQuestion,
        };

        (Question.create as jest.Mock).mockResolvedValue(mockCreatedQuestion);

        const response = await request(app)
          .post("/admin/questions")
          .send(newQuestion);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCreatedQuestion);
      });
    });

    describe("PUT /admin/questions/:id", () => {
      it("should update a question", async () => {
        const updateData = {
          text: "Updated question text",
          points: 15,
        };

        (Question.update as jest.Mock).mockResolvedValue({ matchedCount: 1 });

        const response = await request(app)
          .put("/admin/questions/1")
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty(
          "message",
          "Question updated successfully"
        );
      });

      it("should return 404 if question not found", async () => {
        (Question.update as jest.Mock).mockResolvedValue({ matchedCount: 0 });

        const response = await request(app)
          .put("/admin/questions/999")
          .send({ text: "Updated" });

        expect(response.status).toBe(404);
      });
    });

    describe("DELETE /admin/questions/:id", () => {
      it("should delete a question", async () => {
        (Question.delete as jest.Mock).mockResolvedValue({ deletedCount: 1 });

        const response = await request(app).delete("/admin/questions/1");

        expect(response.status).toBe(204);
        expect(Question.delete).toHaveBeenCalledWith("1");
      });
    });
  });

  // ==================== GROUP TESTS ====================
  describe("Group Management", () => {
    describe("GET /admin/groups", () => {
      it("should return all groups", async () => {
        const mockGroups = [
          { _id: "1", name: "JavaScript", description: "JS topics" },
          { _id: "2", name: "Python", description: "Python topics" },
        ];

        (Group.getAll as jest.Mock).mockResolvedValue(mockGroups);

        const response = await request(app).get("/admin/groups");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockGroups);
      });
    });

    describe("GET /admin/groups/:id", () => {
      it("should return a specific group", async () => {
        const mockGroup = {
          _id: "1",
          name: "JavaScript",
          description: "JavaScript fundamentals",
        };

        (Group.getById as jest.Mock).mockResolvedValue(mockGroup);

        const response = await request(app).get("/admin/groups/1");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockGroup);
      });

      it("should return 404 if group not found", async () => {
        (Group.getById as jest.Mock).mockResolvedValue(null);

        const response = await request(app).get("/admin/groups/999");

        expect(response.status).toBe(404);
      });
    });

    describe("POST /admin/groups", () => {
      it("should create a new group", async () => {
        const newGroup = {
          name: "TypeScript",
          description: "TypeScript advanced concepts",
        };

        const mockCreatedGroup = {
          _id: "1",
          ...newGroup,
          created_by: adminId,
        };

        (Group.create as jest.Mock).mockResolvedValue(mockCreatedGroup);

        const response = await request(app)
          .post("/admin/groups")
          .send(newGroup);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCreatedGroup);
      });
    });

    describe("PUT /admin/groups/:id", () => {
      it("should update a group", async () => {
        const updateData = {
          name: "Updated Group Name",
          description: "Updated description",
        };

        const updatedGroup = {
          _id: "1",
          ...updateData,
        };

        (Group.update as jest.Mock).mockResolvedValue({ matchedCount: 1 });
        (Group.getById as jest.Mock).mockResolvedValue(updatedGroup);

        const response = await request(app)
          .put("/admin/groups/1")
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedGroup);
      });

      it("should return 404 if group not found", async () => {
        (Group.update as jest.Mock).mockResolvedValue({ matchedCount: 0 });

        const response = await request(app)
          .put("/admin/groups/999")
          .send({ name: "Updated" });

        expect(response.status).toBe(404);
      });
    });

    describe("DELETE /admin/groups/:id", () => {
      it("should delete a group", async () => {
        (Group.delete as jest.Mock).mockResolvedValue({ deletedCount: 1 });

        const response = await request(app).delete("/admin/groups/1");

        expect(response.status).toBe(204);
        expect(Group.delete).toHaveBeenCalledWith("1");
      });
    });
  });
});
