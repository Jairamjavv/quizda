import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/tokenUtils.js";
import SessionModel from "../models/session.js";
import RefreshTokenModel from "../models/refreshToken.js";
import TokenBlacklist from "../models/tokenBlacklist.js";
import { logger } from "../logger.js";
import { getIpAddress, getUserAgent } from "../utils/tokenUtils.js";

// Extend Express Request to include user and session
export interface AuthenticatedUser {
  id: number;
  email: string;
  role: string;
  sessionId?: string;
}

declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: AuthenticatedUser;
      sessionToken?: string;
    }
  }
}

/**
 * Middleware to authenticate requests using access tokens
 * with automatic session validation
 */
export async function authenticateSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Extract access token from Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      logger.warn("Authentication failed: no token provided", {
        path: req.path,
        method: req.method,
      });
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify access token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error: any) {
      // Log detailed error internally but return standardized response
      logger.warn("Authentication failed: token verification error", {
        path: req.path,
        method: req.method,
        errorType: error.message,
      });

      // Use consistent status code (401) but allow TOKEN_EXPIRED for refresh flow
      // This is acceptable as it's needed for automatic refresh UX
      // Still prevents detailed enumeration of other token states
      if (error.message === "Token expired") {
        return res.status(401).json({
          error: "Authentication failed",
          code: "TOKEN_EXPIRED",
        });
      }

      return res.status(401).json({
        error: "Authentication failed",
        code: "INVALID_TOKEN",
      });
    }

    // Check if token is blacklisted (logged out)
    const isBlacklisted = await TokenBlacklist.isBlacklisted(token);
    if (isBlacklisted) {
      logger.warn("Authentication failed: token is blacklisted", {
        path: req.path,
        method: req.method,
      });
      return res.status(401).json({
        error: "Authentication failed",
        code: "TOKEN_INVALIDATED",
      });
    }

    // Attach user to request immediately after token verification
    req.authenticatedUser = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      sessionId: decoded.sessionId,
    };

    logger.debug("Token verified successfully", {
      userId: decoded.id,
      role: decoded.role,
    });

    // Validate session if sessionId is present
    if (decoded.sessionId) {
      const session = await SessionModel.findByToken(decoded.sessionId);

      if (!session) {
        logger.warn("Session not found or expired", {
          sessionId: decoded.sessionId,
          userId: decoded.id,
        });
        return res
          .status(401)
          .json({ error: "Session expired", code: "SESSION_EXPIRED" });
      }

      // Check for suspicious activity
      const currentIp = getIpAddress(req);
      const currentUserAgent = getUserAgent(req);
      const isSuspicious = await SessionModel.detectSuspiciousActivity(
        decoded.sessionId,
        currentIp,
        currentUserAgent
      );

      if (isSuspicious) {
        logger.warn("Suspicious session activity detected", {
          sessionId: decoded.sessionId,
          userId: decoded.id,
          currentIp,
        });
        await SessionModel.invalidate(decoded.sessionId);
        return res.status(401).json({
          error: "Suspicious activity detected. Please login again.",
          code: "SUSPICIOUS_ACTIVITY",
        });
      }

      // Update last activity
      await SessionModel.updateActivity(decoded.sessionId);
      req.sessionToken = decoded.sessionId;
    }

    logger.debug("Authentication successful", {
      userId: decoded.id,
      role: decoded.role,
      path: req.path,
    });

    next();
  } catch (error) {
    logger.error("Authentication error", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

/**
 * Middleware to verify CSRF token for state-changing operations
 */
export async function verifyCsrf(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  try {
    const csrfToken = req.headers["x-csrf-token"] as string;
    const sessionToken = req.sessionToken;

    if (!csrfToken || !sessionToken) {
      logger.warn("CSRF validation failed: missing tokens", {
        path: req.path,
        method: req.method,
        hasCsrf: !!csrfToken,
        hasSession: !!sessionToken,
      });
      return res.status(403).json({ error: "CSRF token required" });
    }

    const isValid = await SessionModel.verifyCsrfToken(sessionToken, csrfToken);

    if (!isValid) {
      logger.warn("CSRF validation failed: invalid token", {
        path: req.path,
        method: req.method,
        userId: req.authenticatedUser?.id,
      });
      return res.status(403).json({ error: "Invalid CSRF token" });
    }

    logger.debug("CSRF validation successful", {
      userId: req.authenticatedUser?.id,
      path: req.path,
    });

    next();
  } catch (error) {
    logger.error("CSRF verification error", error);
    res.status(500).json({ error: "CSRF verification failed" });
  }
}

/**
 * Rate limiting middleware for login attempts
 */
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function rateLimitLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const identifier = `${req.body.email || "unknown"}_${getIpAddress(req)}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const attempts = loginAttempts.get(identifier);

  if (attempts) {
    if (now > attempts.resetAt) {
      // Window expired, reset
      loginAttempts.set(identifier, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (attempts.count >= maxAttempts) {
      logger.warn("Rate limit exceeded for login", {
        identifier,
        attempts: attempts.count,
      });
      return res.status(429).json({
        error: "Too many login attempts. Please try again later.",
        retryAfter: Math.ceil((attempts.resetAt - now) / 1000),
      });
    }

    attempts.count++;
  } else {
    loginAttempts.set(identifier, { count: 1, resetAt: now + windowMs });
  }

  next();
}

/**
 * Clean up expired rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of loginAttempts.entries()) {
    if (now > value.resetAt) {
      loginAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes
