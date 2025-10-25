import pool from "../db.js";
import { logger } from "../logger.js";

export interface RefreshToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
  device_info?: string;
  ip_address?: string;
  revoked: boolean;
}

class RefreshTokenModel {
  /**
   * Create a new refresh token
   */
  static async create(
    userId: number,
    token: string,
    expiresAt: Date,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<RefreshToken> {
    try {
      const result = await pool.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at, device_info, ip_address)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, token, expiresAt, deviceInfo, ipAddress]
      );

      logger.info("Refresh token created", {
        userId,
        tokenId: result.rows[0].id,
        expiresAt,
      });

      return result.rows[0];
    } catch (error) {
      logger.error("Failed to create refresh token", error, { userId });
      throw error;
    }
  }

  /**
   * Find a refresh token by token string
   */
  static async findByToken(token: string): Promise<RefreshToken | null> {
    try {
      const result = await pool.query(
        `SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = false`,
        [token]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find refresh token", error);
      throw error;
    }
  }

  /**
   * Revoke a specific refresh token
   */
  static async revoke(token: string): Promise<boolean> {
    try {
      const result = await pool.query(
        `UPDATE refresh_tokens SET revoked = true WHERE token = $1`,
        [token]
      );

      logger.info("Refresh token revoked", { revokedCount: result.rowCount });

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      logger.error("Failed to revoke refresh token", error);
      throw error;
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  static async revokeAllForUser(userId: number): Promise<number> {
    try {
      const result = await pool.query(
        `UPDATE refresh_tokens SET revoked = true 
         WHERE user_id = $1 AND revoked = false`,
        [userId]
      );

      const revokedCount = result.rowCount ?? 0;
      logger.info("All refresh tokens revoked for user", {
        userId,
        revokedCount,
      });

      return revokedCount;
    } catch (error) {
      logger.error("Failed to revoke all refresh tokens", error, { userId });
      throw error;
    }
  }

  /**
   * Delete expired tokens (cleanup)
   */
  static async deleteExpired(): Promise<number> {
    try {
      const result = await pool.query(
        `DELETE FROM refresh_tokens WHERE expires_at < NOW()`
      );

      const deletedCount = result.rowCount ?? 0;
      if (deletedCount > 0) {
        logger.info("Expired refresh tokens cleaned up", { deletedCount });
      }

      return deletedCount;
    } catch (error) {
      logger.error("Failed to delete expired tokens", error);
      throw error;
    }
  }

  /**
   * Get all active sessions for a user
   */
  static async getActiveSessions(userId: number): Promise<RefreshToken[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM refresh_tokens 
         WHERE user_id = $1 AND revoked = false AND expires_at > NOW()
         ORDER BY created_at DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      logger.error("Failed to get active sessions", error, { userId });
      throw error;
    }
  }

  /**
   * Revoke all sessions except the current one
   */
  static async revokeOtherSessions(
    userId: number,
    currentToken: string
  ): Promise<number> {
    try {
      const result = await pool.query(
        `UPDATE refresh_tokens SET revoked = true 
         WHERE user_id = $1 AND token != $2 AND revoked = false`,
        [userId, currentToken]
      );

      const revokedCount = result.rowCount ?? 0;
      logger.info("Other sessions revoked", { userId, revokedCount });

      return revokedCount;
    } catch (error) {
      logger.error("Failed to revoke other sessions", error, { userId });
      throw error;
    }
  }
}

export default RefreshTokenModel;
