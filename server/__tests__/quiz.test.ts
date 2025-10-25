import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import quizRoutes from "../routes/quiz.js";
import Quiz from "../models/quiz.js";
import Question from "../models/question.js";
import Attempt from "../models/attempt.js";

const { json } = bodyParser;

// Mock the models
jest.mock("../models/quiz.js");
jest.mock("../models/question.js");
jest.mock("../models/attempt.js");

// Mock the V2 session authentication middleware
jest.mock("../middleware/sessionAuth.js", () => ({
  authenticateSession: (req: any, res: any, next: any) => {
    req.authenticatedUser = {
      id: 1,
      email: "test@example.com",
      role: "user",
      sessionId: "test-session-id",
    };
    next();
  },
}));

// Create a test app
const app = express();
app.use(json());
app.use("/quizzes", quizRoutes);

describe("Quiz Routes", () => {
  const userId = 1;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /quizzes", () => {
    it("should return all published quizzes", async () => {
      const mockQuizzes = [
        {
          _id: "1",
          title: "JavaScript Basics",
          description: "Test your JS knowledge",
          is_published: true,
        },
        {
          _id: "2",
          title: "TypeScript Advanced",
          description: "Advanced TS concepts",
          is_published: true,
        },
      ];

      (Quiz.getPublished as jest.Mock).mockResolvedValue(mockQuizzes);

      const response = await request(app).get("/quizzes");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockQuizzes);
      expect(Quiz.getPublished).toHaveBeenCalled();
    });
  });

  describe("GET /quizzes/:id", () => {
    it("should return a specific quiz", async () => {
      const mockQuiz = {
        _id: "1",
        title: "JavaScript Basics",
        description: "Test your JS knowledge",
        is_published: true,
        total_points: 100,
      };

      (Quiz.getById as jest.Mock).mockResolvedValue(mockQuiz);

      const response = await request(app).get("/quizzes/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockQuiz);
      expect(Quiz.getById).toHaveBeenCalledWith("1");
    });

    it("should return 404 if quiz not found", async () => {
      (Quiz.getById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get("/quizzes/999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Quiz not found");
    });
  });

  describe("GET /quizzes/:id/questions", () => {
    it("should return all questions for a quiz", async () => {
      const mockQuestions = [
        {
          _id: "1",
          quiz_id: "1",
          text: "What is JavaScript?",
          type: "single_choice",
          choices: [
            { text: "A programming language", isCorrect: true },
            { text: "A coffee brand", isCorrect: false },
          ],
          points: 10,
        },
        {
          _id: "2",
          quiz_id: "1",
          text: "What is TypeScript?",
          type: "single_choice",
          choices: [
            { text: "A superset of JavaScript", isCorrect: true },
            { text: "A framework", isCorrect: false },
          ],
          points: 10,
        },
      ];

      (Question.getByQuiz as jest.Mock).mockResolvedValue(mockQuestions);

      const response = await request(app).get("/quizzes/1/questions");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockQuestions);
      expect(Question.getByQuiz).toHaveBeenCalledWith("1");
    });
  });

  describe("POST /quizzes/:id/attempt", () => {
    it("should create a quiz attempt successfully", async () => {
      const mockAttempt = {
        _id: "1",
        user_id: userId,
        quiz_id: "1",
        mode: "timed",
        score: 80,
        max_points: 100,
      };

      (Attempt.create as jest.Mock).mockResolvedValue(mockAttempt);

      const attemptData = {
        mode: "timed",
        timed_duration_minutes: 30,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        score: 80,
        max_points: 100,
        per_question_results: [
          {
            question_id: "1",
            selected_choices: [0],
            is_correct: true,
            points_awarded: 10,
          },
        ],
        tags_snapshot: ["javascript", "basics"],
      };

      const response = await request(app)
        .post("/quizzes/1/attempt")
        .send(attemptData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAttempt);
      expect(Attempt.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          quiz_id: "1",
          mode: "timed",
          score: 80,
        })
      );
    });
  });
});
