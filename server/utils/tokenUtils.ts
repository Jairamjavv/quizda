import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import { logger } from "../logger.js";

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
  sessionId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Generate device fingerprint from request
 */
export function generateDeviceFingerprint(
  userAgent: string,
  ip: string
): string {
  const hash = crypto.createHash("sha256");
  hash.update(`${userAgent}${ip}`);
  return hash.digest("hex");
}

/**
 * Generate access token (short-lived, 15 minutes)
 */
export function generateAccessToken(payload: TokenPayload): string {
  if (!process.env.JWT_SECRET) {
    logger.error("JWT_SECRET not configured");
    throw new Error("JWT configuration error");
  }

  const expiresIn: string = process.env.JWT_ACCESS_EXPIRY || "15m";
  const options: SignOptions = { expiresIn: expiresIn as any };
  const token = jwt.sign(payload, process.env.JWT_SECRET, options);

  logger.debug("Access token generated", {
    userId: payload.id,
    expiresIn,
  });

  return token;
}

/**
 * Generate refresh token (long-lived, 7 days)
 */
export function generateRefreshToken(): string {
  return generateSecureToken(64);
}

/**
 * Verify and decode access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT configuration error");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.debug("Access token expired");
      throw new Error("Token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn("Invalid access token");
      throw new Error("Invalid token");
    }
    throw error;
  }
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: TokenPayload): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(),
  };
}

/**
 * Calculate token expiry date
 */
export function getTokenExpiry(days: number = 7): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}

/**
 * Calculate session expiry (shorter for normal, longer for "remember me")
 */
export function getSessionExpiry(rememberMe: boolean = false): Date {
  const expiry = new Date();
  if (rememberMe) {
    expiry.setDate(expiry.getDate() + 30); // 30 days
  } else {
    expiry.setHours(expiry.getHours() + 12); // 12 hours
  }
  return expiry;
}

/**
 * Hash a token for storage (one-way hash using SHA-256)
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Compare token with hash using constant-time comparison
 * Prevents timing attacks by ensuring equal-length buffers
 */
export function compareTokenHash(token: string, hash: string): boolean {
  const tokenHash = hashToken(token);

  // Ensure both strings are same length before comparison
  // This prevents timing attacks and errors from timingSafeEqual
  if (tokenHash.length !== hash.length) {
    // Perform a dummy comparison to maintain constant time
    crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(tokenHash));
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(tokenHash, "hex"),
      Buffer.from(hash, "hex")
    );
  } catch (error) {
    logger.error("Token comparison error", error);
    return false;
  }
}

/**
 * Extract user agent from request
 */
export function getUserAgent(req: any): string {
  return req.headers["user-agent"] || "unknown";
}

/**
 * Extract IP address from request with trusted proxy validation
 * Prevents IP spoofing by validating X-Forwarded-For header
 */
export function getIpAddress(req: any): string {
  // List of trusted proxy IP ranges (configure for your infrastructure)
  const trustedProxies = process.env.TRUSTED_PROXIES?.split(",") || [];

  // Get the direct connection IP
  const directIp = req.connection?.remoteAddress || req.socket?.remoteAddress;

  // Only trust X-Forwarded-For if request comes from trusted proxy
  if (trustedProxies.length > 0 && directIp) {
    const isTrustedProxy = trustedProxies.some((proxy) =>
      directIp.includes(proxy.trim())
    );

    if (isTrustedProxy && req.headers["x-forwarded-for"]) {
      // Take the leftmost (client) IP from X-Forwarded-For
      const forwardedIps = req.headers["x-forwarded-for"].split(",");
      return forwardedIps[0].trim();
    }
  }

  // Fallback to direct connection IP or X-Real-IP for simple reverse proxies
  return directIp || req.headers["x-real-ip"] || "unknown";
}

/**
 * Get device info string
 */
export function getDeviceInfo(req: any): string {
  const userAgent = getUserAgent(req);

  // Parse basic device info
  const isBot = /bot|crawler|spider/i.test(userAgent);
  const isMobile = /mobile|android|iphone|ipad|tablet/i.test(userAgent);
  const browser =
    userAgent.match(/(chrome|firefox|safari|edge|opera)/i)?.[0] || "unknown";

  return JSON.stringify({
    browser,
    isMobile,
    isBot,
    platform: req.headers["sec-ch-ua-platform"] || "unknown",
  });
}
