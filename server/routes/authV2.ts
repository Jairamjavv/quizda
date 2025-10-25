import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import RefreshTokenModel from "../models/refreshToken.js";
import SessionModel from "../models/session.js";
import {
  generateTokenPair,
  getTokenExpiry,
  getSessionExpiry,
  generateCsrfToken,
  getIpAddress,
  getUserAgent,
  getDeviceInfo,
  generateDeviceFingerprint,
  verifyAccessToken,
} from "../utils/tokenUtils.js";
import {
  authenticateSession,
  rateLimitLogin,
} from "../middleware/sessionAuth.js";
import { logger } from "../logger.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

/**
 * Register a new user with session creation
 */
router.post("/register", rateLimitLogin, async (req, res) => {
  const { email, password, role, rememberMe } = req.body;

  logger.info("Registration attempt", { email, role: role || "user" });

  try {
    const existing = await User.findByEmail(email);
    if (existing) {
      logger.warn("Registration failed: email already exists", { email });
      return res.status(400).json({ error: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create(email, hash, role || "user");

    logger.info("User created successfully", {
      userId: user.id,
      email,
      role: user.role,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Create refresh token record
    const refreshTokenExpiry = getTokenExpiry(rememberMe ? 30 : 7);
    await RefreshTokenModel.create(
      user.id,
      refreshToken,
      refreshTokenExpiry,
      getDeviceInfo(req),
      getIpAddress(req)
    );

    // Create session
    const csrfToken = generateCsrfToken();
    const sessionExpiry = getSessionExpiry(rememberMe);
    const session = await SessionModel.create(
      user.id,
      refreshToken, // Use refresh token as session identifier
      csrfToken,
      sessionExpiry,
      getIpAddress(req),
      getUserAgent(req),
      generateDeviceFingerprint(getUserAgent(req), getIpAddress(req))
    );

    // Set secure HTTP-only cookie for refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    });

    logger.info("User registered with session", {
      userId: user.id,
      sessionId: session.id,
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      csrfToken,
    });
  } catch (error) {
    logger.error("Registration error", error, { email });
    res.status(500).json({ error: "Registration failed" });
  }
});

/**
 * Login with session management
 */
router.post("/login", rateLimitLogin, async (req, res) => {
  const { email, password, rememberMe } = req.body;

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

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Create refresh token record
    const refreshTokenExpiry = getTokenExpiry(rememberMe ? 30 : 7);
    await RefreshTokenModel.create(
      user.id,
      refreshToken,
      refreshTokenExpiry,
      getDeviceInfo(req),
      getIpAddress(req)
    );

    // Create session
    const csrfToken = generateCsrfToken();
    const sessionExpiry = getSessionExpiry(rememberMe);
    const session = await SessionModel.create(
      user.id,
      refreshToken, // Use refresh token as session identifier
      csrfToken,
      sessionExpiry,
      getIpAddress(req),
      getUserAgent(req),
      generateDeviceFingerprint(getUserAgent(req), getIpAddress(req))
    );

    // Set secure HTTP-only cookie for refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    });

    logger.info("User logged in successfully", {
      userId: user.id,
      email,
      role: user.role,
      sessionId: session.id,
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      csrfToken,
    });
  } catch (error) {
    logger.error("Login error", error, { email });
    res.status(500).json({ error: "Login failed" });
  }
});

/**
 * Refresh access token using refresh token
 */
router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      logger.warn("Refresh failed: no refresh token provided");
      return res.status(401).json({ error: "No refresh token provided" });
    }

    // Verify refresh token exists and is valid
    const tokenRecord = await RefreshTokenModel.findByToken(refreshToken);

    if (!tokenRecord || tokenRecord.revoked) {
      logger.warn("Refresh failed: invalid or revoked token");
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      logger.warn("Refresh failed: token expired", {
        userId: tokenRecord.user_id,
      });
      return res.status(403).json({ error: "Refresh token expired" });
    }

    // Get user details
    const user = await User.findById(tokenRecord.user_id);
    if (!user) {
      logger.error("User not found for refresh token", {
        userId: tokenRecord.user_id,
      });
      return res.status(404).json({ error: "User not found" });
    }

    // Get session for CSRF token
    const session = await SessionModel.findByToken(refreshToken);

    // Generate new access token
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Token rotation: revoke old refresh token and create new one
    await RefreshTokenModel.revoke(refreshToken);
    const refreshTokenExpiry = getTokenExpiry(7);
    await RefreshTokenModel.create(
      user.id,
      newRefreshToken,
      refreshTokenExpiry,
      getDeviceInfo(req),
      getIpAddress(req)
    );

    // Update session with new refresh token
    if (session) {
      await SessionModel.invalidate(refreshToken);
      const csrfToken = generateCsrfToken();
      const sessionExpiry = getSessionExpiry(false);
      await SessionModel.create(
        user.id,
        newRefreshToken,
        csrfToken,
        sessionExpiry,
        getIpAddress(req),
        getUserAgent(req),
        generateDeviceFingerprint(getUserAgent(req), getIpAddress(req))
      );
    }

    // Set new refresh token cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logger.info("Token refreshed successfully", {
      userId: user.id,
    });

    res.json({
      accessToken,
      csrfToken: session?.csrf_token || generateCsrfToken(),
    });
  } catch (error) {
    logger.error("Token refresh error", error);
    res.status(500).json({ error: "Token refresh failed" });
  }
});

/**
 * Logout and invalidate session
 */
router.post("/logout", authenticateSession, async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const userId = req.authenticatedUser?.id;

    if (refreshToken) {
      // Revoke refresh token
      await RefreshTokenModel.revoke(refreshToken);

      // Invalidate session
      await SessionModel.invalidate(refreshToken);

      logger.info("User logged out", { userId });
    }

    // Clear cookie
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    logger.error("Logout error", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

/**
 * Logout from all devices
 */
router.post("/logout-all", authenticateSession, async (req, res) => {
  try {
    const userId = req.authenticatedUser?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Revoke all refresh tokens
    const revokedTokens = await RefreshTokenModel.revokeAllForUser(userId);

    // Invalidate all sessions
    const invalidatedSessions = await SessionModel.invalidateAllForUser(userId);

    logger.info("User logged out from all devices", {
      userId,
      revokedTokens,
      invalidatedSessions,
    });

    // Clear cookie
    res.clearCookie("refreshToken");
    res.json({
      message: "Logged out from all devices",
      revokedSessions: invalidatedSessions,
    });
  } catch (error) {
    logger.error("Logout all error", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

/**
 * Get all active sessions
 */
router.get("/sessions", authenticateSession, async (req, res) => {
  try {
    const userId = req.authenticatedUser?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const sessions = await SessionModel.getActiveSessions(userId);

    res.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        createdAt: s.created_at,
        lastActivity: s.last_activity,
        ipAddress: s.ip_address,
        userAgent: s.user_agent,
        isCurrent: s.session_token === req.sessionToken,
      })),
    });
  } catch (error) {
    logger.error("Get sessions error", error);
    res.status(500).json({ error: "Failed to get sessions" });
  }
});

/**
 * Revoke a specific session
 */
router.delete("/sessions/:sessionId", authenticateSession, async (req, res) => {
  try {
    const userId = req.authenticatedUser?.id;
    const sessionId = parseInt(req.params.sessionId);

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get the session to verify ownership
    const sessions = await SessionModel.getActiveSessions(userId);
    const session = sessions.find((s) => s.id === sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Invalidate session and revoke refresh token
    await SessionModel.invalidate(session.session_token);
    await RefreshTokenModel.revoke(session.session_token);

    logger.info("Session revoked", { userId, sessionId });

    res.json({ message: "Session revoked successfully" });
  } catch (error) {
    logger.error("Revoke session error", error);
    res.status(500).json({ error: "Failed to revoke session" });
  }
});

export default router;
