import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import authRoutes from "../routes/authV2.js";
import User from "../models/user.js";
import RefreshTokenModel from "../models/refreshToken.js";
import SessionModel from "../models/session.js";
import bcrypt from "bcrypt";

const { json } = bodyParser;

// Create a test app
const app = express();
app.use(json());
app.use("/auth", authRoutes);

// Mock all database models
jest.mock("../models/user.js");
jest.mock("../models/refreshToken.js");
jest.mock("../models/session.js");
jest.mock("../models/tokenBlacklist.js");

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        role: "user",
      };

      (User.findByEmail as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (RefreshTokenModel.create as jest.Mock).mockResolvedValue({});
      (SessionModel.create as jest.Mock).mockResolvedValue({});

      const response = await request(app).post("/auth/register").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("email", "test@example.com");
      expect(response.body.user).toHaveProperty("role", "user");
    });

    it("should return 400 if email already exists", async () => {
      (User.findByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        email: "existing@example.com",
      });

      const response = await request(app).post("/auth/register").send({
        email: "existing@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Email already exists");
    });

    it("should register user with admin role if specified", async () => {
      const mockUser = {
        id: 1,
        email: "admin@example.com",
        role: "admin",
      };

      (User.findByEmail as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (RefreshTokenModel.create as jest.Mock).mockResolvedValue({});
      (SessionModel.create as jest.Mock).mockResolvedValue({});

      const response = await request(app).post("/auth/register").send({
        email: "admin@example.com",
        password: "password123",
        role: "admin",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("role", "admin");
    });
  });

  describe("POST /auth/login", () => {
    it("should login user successfully", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password_hash: hashedPassword,
        role: "user",
      };

      (User.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (User.updateLastLogin as jest.Mock).mockResolvedValue(undefined);
      (RefreshTokenModel.create as jest.Mock).mockResolvedValue({});
      (SessionModel.create as jest.Mock).mockResolvedValue({});
      (SessionModel.getActiveSessions as jest.Mock).mockResolvedValue([]);

      const response = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("email", "test@example.com");
      expect(response.body.user).toHaveProperty("role", "user");
      expect(User.updateLastLogin).toHaveBeenCalledWith(1);
    });

    it("should return 400 if email does not exist", async () => {
      (User.findByEmail as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post("/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Invalid credentials");
    });

    it("should return 400 if password is incorrect", async () => {
      const hashedPassword = await bcrypt.hash("correctpassword", 10);
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password_hash: hashedPassword,
        role: "user",
      };

      (User.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Invalid credentials");
    });
  });
});
