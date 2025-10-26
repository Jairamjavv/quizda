import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import RefreshTokenModel from "../models/refreshToken.js";
import SessionModel from "../models/session.js";
import TokenBlacklist from "../models/tokenBlacklist.js";
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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
    // Only accept refresh token from HTTP-only cookie to prevent token exfiltration
    const refreshToken = req.cookies.refreshToken;

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

    // Find active session for this user (if any)
    const activeSessions = await SessionModel.getActiveSessions(user.id);
    const activeSession = activeSessions.find((s: any) => s.is_active);

    // IDLE TIMEOUT VALIDATION: Check if session has been idle for >30 minutes
    if (activeSession) {
      const now = new Date();
      const lastActivity = new Date(activeSession.last_activity);
      const idleTimeMs = now.getTime() - lastActivity.getTime();
      const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

      if (idleTimeMs > IDLE_TIMEOUT_MS) {
        logger.warn("Session idle timeout exceeded", {
          userId: user.id,
          sessionId: activeSession.id,
          idleTimeMinutes: Math.floor(idleTimeMs / 60000),
        });

        // Invalidate the idle session
        await SessionModel.invalidate(activeSession.session_token);
        await RefreshTokenModel.revoke(refreshToken);

        return res.status(401).json({
          error: "Session expired due to inactivity",
          code: "IDLE_TIMEOUT",
          message:
            "Your session has expired after 30 minutes of inactivity. Please log in again.",
        });
      }

      // Update session activity timestamp
      await SessionModel.updateActivity(activeSession.session_token);
      logger.debug("Session activity updated", {
        userId: user.id,
        sessionId: activeSession.id,
      });
    }

    // Generate new CSRF token for the session
    const newCsrfToken = activeSession ? generateCsrfToken() : undefined;

    // Generate new tokens with sessionId if there's an active session
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      sessionId: activeSession?.session_token,
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

    // Set new refresh token cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logger.info("Token refreshed successfully", {
      userId: user.id,
      hasSession: !!activeSession,
    });

    // Return new access token and CSRF token (if session exists)
    if (newCsrfToken) {
      res.json({
        accessToken,
        csrfToken: newCsrfToken,
      });
    } else {
      res.json({
        accessToken,
      });
    }
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

    // Extract and blacklist the current access token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const accessToken = authHeader.substring(7);
      await TokenBlacklist.add(accessToken);
      logger.debug("Access token blacklisted", { userId });
    }

    if (refreshToken) {
      // Revoke refresh token
      await RefreshTokenModel.revoke(refreshToken);

      // Invalidate session
      await SessionModel.invalidate(refreshToken);

      logger.info("User logged out", { userId });
    }

    // Clear cookie (must match the options used when setting)
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
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

    // Blacklist current access token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const accessToken = authHeader.substring(7);
      await TokenBlacklist.add(accessToken);
      logger.debug("Access token blacklisted", { userId });
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

    // Clear cookie (must match the options used when setting)
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
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
