import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import dashboardRoutes from "../routes/dashboard.js";
import Attempt from "../models/attempt.js";

const { json } = bodyParser;

// Create a test app
const app = express();
app.use(json());
app.use("/dashboard", dashboardRoutes);

// Mock the models
jest.mock("../models/attempt.js");
jest.mock("../models/quiz.js");

describe("Dashboard Routes", () => {
  let authToken: string;
  const userId = 1;

  beforeAll(() => {
    // Generate a valid JWT token for testing
    authToken = jwt.sign({ id: userId, role: "user" }, process.env.JWT_SECRET!);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /dashboard", () => {
    it("should return dashboard metrics for authenticated user", async () => {
      const mockAttempts = [
        {
          _id: "1",
          user_id: userId,
          quiz_id: "1",
          completed_at: new Date("2025-10-15"),
          score: 80,
          max_points: 100,
          per_question_results: [
            {
              question_id: "1",
              is_correct: true,
              points_awarded: 10,
              tags: ["javascript", "basics"],
            },
          ],
        },
        {
          _id: "2",
          user_id: userId,
          quiz_id: "2",
          completed_at: new Date("2025-10-18"),
          score: 90,
          max_points: 100,
          per_question_results: [
            {
              question_id: "2",
              is_correct: true,
              points_awarded: 15,
              tags: ["typescript", "advanced"],
            },
          ],
        },
      ];

      const mockStreakData = [
        { attempt_date: "2025-10-15" },
        { attempt_date: "2025-10-16" },
        { attempt_date: "2025-10-17" },
        { attempt_date: "2025-10-18" },
      ];

      const mockTagStats = [
        {
          tag_name: "javascript",
          total_attempts: "5",
          correct_attempts: "4",
          avg_accuracy: "0.8",
        },
        {
          tag_name: "typescript",
          total_attempts: "3",
          correct_attempts: "2",
          avg_accuracy: "0.67",
        },
      ];

      (Attempt.getByUser as jest.Mock).mockResolvedValue(mockAttempts);
      (Attempt.getStreakData as jest.Mock).mockResolvedValue(mockStreakData);
      (Attempt.getTagStats as jest.Mock).mockResolvedValue(mockTagStats);

      const response = await request(app)
        .get("/dashboard")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("totalQuizzesTaken");
      expect(response.body).toHaveProperty("streakDays");
      expect(response.body).toHaveProperty("averageScore");
      expect(response.body).toHaveProperty("tagStats");
      expect(response.body).toHaveProperty("swot");
    });

    it("should filter by group when groupId is provided", async () => {
      const mockAttempts = [
        {
          _id: "1",
          user_id: userId,
          quiz_id: "1",
          completed_at: new Date("2025-10-15"),
          score: 80,
          max_points: 100,
          per_question_results: [],
        },
      ];

      const mockStreakData = [{ attempt_date: "2025-10-15" }];

      const mockTagStats: any[] = [];

      (Attempt.getByUser as jest.Mock).mockResolvedValue(mockAttempts);
      (Attempt.getStreakData as jest.Mock).mockResolvedValue(mockStreakData);
      (Attempt.getTagStats as jest.Mock).mockResolvedValue(mockTagStats);

      // Mock Quiz.getAll for group filtering
      const Quiz = (await import("../models/quiz.js")).default;
      (Quiz.getAll as jest.Mock).mockResolvedValue([
        { _id: "1", group_id: "group1", title: "Quiz 1" },
        { _id: "2", group_id: "group2", title: "Quiz 2" },
      ]);

      const response = await request(app)
        .get("/dashboard?groupId=group1")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("totalQuizzesTaken");
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app).get("/dashboard");

      expect(response.status).toBe(401);
    });

    it("should handle empty attempts gracefully", async () => {
      (Attempt.getByUser as jest.Mock).mockResolvedValue([]);
      (Attempt.getStreakData as jest.Mock).mockResolvedValue([]);
      (Attempt.getTagStats as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get("/dashboard")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.totalQuizzesTaken).toBe(0);
      expect(response.body.streakDays).toBe(0);
      expect(response.body.averageScore).toBe(0);
    });

    it("should calculate streak correctly", async () => {
      const mockAttempts = [
        {
          _id: "1",
          user_id: userId,
          quiz_id: "1",
          completed_at: new Date(),
          score: 80,
          max_points: 100,
          per_question_results: [],
        },
      ];

      // Mock a 5-day streak
      const today = new Date();
      const mockStreakData = Array.from({ length: 5 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        return { attempt_date: date.toISOString().split("T")[0] };
      }).reverse();

      (Attempt.getByUser as jest.Mock).mockResolvedValue(mockAttempts);
      (Attempt.getStreakData as jest.Mock).mockResolvedValue(mockStreakData);
      (Attempt.getTagStats as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get("/dashboard")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.streakDays).toBeGreaterThan(0);
    });

    it("should provide SWOT analysis", async () => {
      const mockAttempts = [
        {
          _id: "1",
          user_id: userId,
          quiz_id: "1",
          completed_at: new Date(),
          score: 90,
          max_points: 100,
          per_question_results: [
            {
              question_id: "1",
              is_correct: true,
              points_awarded: 10,
              tags: ["javascript"],
            },
            {
              question_id: "2",
              is_correct: false,
              points_awarded: 0,
              tags: ["typescript"],
            },
          ],
        },
      ];

      const mockTagStats = [
        {
          tag_name: "javascript",
          total_attempts: "5",
          correct_attempts: "5",
          avg_accuracy: "1.0",
        },
        {
          tag_name: "typescript",
          total_attempts: "3",
          correct_attempts: "1",
          avg_accuracy: "0.33",
        },
      ];

      (Attempt.getByUser as jest.Mock).mockResolvedValue(mockAttempts);
      (Attempt.getStreakData as jest.Mock).mockResolvedValue([]);
      (Attempt.getTagStats as jest.Mock).mockResolvedValue(mockTagStats);

      const response = await request(app)
        .get("/dashboard")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.swot).toHaveProperty("strengths");
      expect(response.body.swot).toHaveProperty("weaknesses");
      expect(response.body.swot).toHaveProperty("opportunities");
      expect(response.body.swot).toHaveProperty("threats");
      expect(Array.isArray(response.body.swot.strengths)).toBe(true);
      expect(Array.isArray(response.body.swot.weaknesses)).toBe(true);
    });

    it("should calculate streak correctly", async () => {
      const mockAttempts = [
        {
          _id: "1",
          user_id: userId,
          quiz_id: "1",
          completed_at: new Date(),
          score: 80,
          max_points: 100,
          per_question_results: [],
        },
      ];

      // Mock a 5-day streak
      const today = new Date();
      const mockStreakData = Array.from({ length: 5 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        return { attempt_date: date.toISOString().split("T")[0] };
      }).reverse();

      (Attempt.getByUser as jest.Mock).mockResolvedValue(mockAttempts);
      (Attempt.getStreakData as jest.Mock).mockResolvedValue(mockStreakData);

      const response = await request(app)
        .get("/dashboard")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.streakDays).toBeGreaterThan(0);
    });

    it("should provide SWOT analysis", async () => {
      const mockAttempts = [
        {
          _id: "1",
          user_id: userId,
          quiz_id: "1",
          completed_at: new Date(),
          score: 90,
          max_points: 100,
          per_question_results: [
            {
              question_id: "1",
              is_correct: true,
              points_awarded: 10,
              tags: ["javascript"],
            },
            {
              question_id: "2",
              is_correct: false,
              points_awarded: 0,
              tags: ["typescript"],
            },
          ],
        },
      ];

      (Attempt.getByUser as jest.Mock).mockResolvedValue(mockAttempts);
      (Attempt.getStreakData as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get("/dashboard")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.swot).toHaveProperty("strengths");
      expect(response.body.swot).toHaveProperty("weaknesses");
      expect(response.body.swot).toHaveProperty("opportunities");
      expect(response.body.swot).toHaveProperty("threats");
      expect(Array.isArray(response.body.swot.strengths)).toBe(true);
      expect(Array.isArray(response.body.swot.weaknesses)).toBe(true);
    });
  });
});
