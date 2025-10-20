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
  const existing = await User.findByEmail(email);
  if (existing) return res.status(400).json({ error: "Email exists" });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create(email, hash, role || "user");
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: "JWT secret not configured" });
  }
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET
  );
  res.json({ token, email: user.email, role: user.role });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);
  if (!user) return res.status(400).json({ error: "Invalid credentials" });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  // Update last login
  await User.updateLastLogin(user.id);

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: "JWT secret not configured" });
  }
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET
  );
  res.json({ token, email: user.email, role: user.role });
});

export default router;
