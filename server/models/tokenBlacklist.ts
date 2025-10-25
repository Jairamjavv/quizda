import { isRedisConnected, getClient } from "../redis.js";
import { logger } from "../logger.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

/**
 * Token Blacklist Model
 * Manages blacklisted access tokens in Redis for immediate invalidation
 */
export class TokenBlacklist {
  private static readonly PREFIX = "blacklist:token:";

  /**
   * Hash a token using SHA-256 to prevent plaintext exposure in Redis
   * @param token - JWT token to hash
   * @returns SHA-256 hash of the token
   */
  private static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Add a token to the blacklist
   * @param token - JWT access token to blacklist
   * @returns true if successfully blacklisted, false if Redis unavailable
   */
  static async add(token: string): Promise<boolean> {
    if (!isRedisConnected()) {
      logger.warn("Redis unavailable - cannot blacklist token");
      return false;
    }

    try {
      const redisClient = getClient();
      if (!redisClient) {
        logger.warn("Redis client not initialized");
        return false;
      }

      // Decode token to get expiration time (without verification)
      const decoded = jwt.decode(token) as { exp?: number } | null;

      if (!decoded || !decoded.exp) {
        logger.warn("Token has no expiration - cannot blacklist");
        return false;
      }

      // Calculate TTL (time to live) in seconds
      const now = Math.floor(Date.now() / 1000);
      const ttl = decoded.exp - now;

      if (ttl <= 0) {
        logger.debug("Token already expired - no need to blacklist");
        return true;
      }

      // Hash token to prevent plaintext exposure in Redis
      const tokenHash = this.hashToken(token);
      const key = `${this.PREFIX}${tokenHash}`;
      await redisClient.setEx(key, ttl, "1");

      logger.debug("Token blacklisted", { ttl });
      return true;
    } catch (error) {
      logger.error("Failed to blacklist token", error);
      return false;
    }
  }

  /**
   * Check if a token is blacklisted
   * @param token - JWT access token to check
   * @returns true if blacklisted, false otherwise
   */
  static async isBlacklisted(token: string): Promise<boolean> {
    if (!isRedisConnected()) {
      // If Redis is down, fail closed for security (reject all tokens)
      // Can be configured via environment variable if needed
      const failClosed = process.env.REDIS_FAIL_CLOSED !== "false";
      if (failClosed) {
        logger.warn("Redis unavailable - failing closed (rejecting token)");
        return true; // Treat as blacklisted when Redis is down
      }
      return false; // Fail open if explicitly configured
    }

    try {
      const redisClient = getClient();
      if (!redisClient) {
        // No client available - fail closed by default
        return process.env.REDIS_FAIL_CLOSED !== "false";
      }

      // Hash token before checking Redis
      const tokenHash = this.hashToken(token);
      const key = `${this.PREFIX}${tokenHash}`;
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error("Failed to check token blacklist", error);
      // Fail closed on error for security
      const failClosed = process.env.REDIS_FAIL_CLOSED !== "false";
      return failClosed;
    }
  }

  /**
   * Remove a token from the blacklist (manual cleanup)
   * @param token - JWT access token to remove
   * @returns true if successfully removed
   */
  static async remove(token: string): Promise<boolean> {
    if (!isRedisConnected()) {
      return false;
    }

    try {
      const redisClient = getClient();
      if (!redisClient) return false;

      // Hash token before removing from Redis
      const tokenHash = this.hashToken(token);
      const key = `${this.PREFIX}${tokenHash}`;
      const result = await redisClient.del(key);
      return result === 1;
    } catch (error) {
      logger.error("Failed to remove token from blacklist", error);
      return false;
    }
  }

  /**
   * Get total count of blacklisted tokens (for monitoring)
   * @returns count of blacklisted tokens
   */
  static async count(): Promise<number> {
    if (!isRedisConnected()) {
      return 0;
    }

    try {
      const redisClient = getClient();
      if (!redisClient) return 0;

      const keys = await redisClient.keys(`${this.PREFIX}*`);
      return keys.length;
    } catch (error) {
      logger.error("Failed to count blacklisted tokens", error);
      return 0;
    }
  }

  /**
   * Clear all blacklisted tokens (admin function)
   * @returns count of tokens cleared
   */
  static async clear(): Promise<number> {
    if (!isRedisConnected()) {
      return 0;
    }

    try {
      const redisClient = getClient();
      if (!redisClient) return 0;

      const keys = await redisClient.keys(`${this.PREFIX}*`);
      if (keys.length === 0) return 0;

      const result = await redisClient.del(keys);
      logger.info("Cleared token blacklist", { count: result });
      return result;
    } catch (error) {
      logger.error("Failed to clear token blacklist", error);
      return 0;
    }
  }
}

export default TokenBlacklist;
