/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Email exists
 *       500:
 *         description: JWT secret not configured
 */
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import dotenv from "dotenv";
import { logger } from "../logger.js";
dotenv.config();

const router = express.Router();

router.post("/register", async (req, res) => {
  /**
   * @openapi
   * /auth/login:
   *   post:
   *     summary: Login a user
   *     tags:
   *       - Auth
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: User logged in successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *       400:
   *         description: Invalid credentials
   *       500:
   *         description: JWT secret not configured
   */
  const { email, password, role } = req.body;

  logger.info("Registration attempt", { email, role: role || "user" });

  try {
    const existing = await User.findByEmail(email);
    if (existing) {
      logger.warn("Registration failed: email already exists", { email });
      return res.status(400).json({ error: "Email exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create(email, hash, role || "user");

    logger.info("User created successfully", {
      userId: user.id,
      email,
      role: user.role,
    });

    if (!process.env.JWT_SECRET) {
      logger.error("JWT_SECRET not configured");
      return res.status(500).json({ error: "JWT secret not configured" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET
    );

    logger.info("User registered and token generated", {
      userId: user.id,
      email,
    });
    res.json({ token, email: user.email, role: user.role });
  } catch (error) {
    logger.error("Registration error", error, { email });
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  logger.info("Login attempt", { email });

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      logger.warn("Login failed: user not found", { email });
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      logger.warn("Login failed: invalid password", { email, userId: user.id });
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Update last login
    await User.updateLastLogin(user.id);
    logger.debug("Last login updated", { userId: user.id });

    if (!process.env.JWT_SECRET) {
      logger.error("JWT_SECRET not configured");
      return res.status(500).json({ error: "JWT secret not configured" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET
    );

    logger.info("User logged in successfully", {
      userId: user.id,
      email,
      role: user.role,
    });
    res.json({ token, email: user.email, role: user.role });
  } catch (error) {
    logger.error("Login error", error, { email });
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
