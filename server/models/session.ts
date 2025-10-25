import pool from "../db.js";
import { logger } from "../logger.js";

export interface Session {
  id: number;
  user_id: number;
  session_token: string;
  csrf_token: string;
  expires_at: Date;
  created_at: Date;
  last_activity: Date;
  ip_address?: string;
  user_agent?: string;
  device_fingerprint?: string;
  is_active: boolean;
}

class SessionModel {
  /**
   * Create a new session
   */
  static async create(
    userId: number,
    sessionToken: string,
    csrfToken: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string,
    deviceFingerprint?: string
  ): Promise<Session> {
    try {
      const result = await pool.query(
        `INSERT INTO sessions 
         (user_id, session_token, csrf_token, expires_at, ip_address, user_agent, device_fingerprint)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          userId,
          sessionToken,
          csrfToken,
          expiresAt,
          ipAddress,
          userAgent,
          deviceFingerprint,
        ]
      );

      logger.info("Session created", {
        userId,
        sessionId: result.rows[0].id,
        expiresAt,
      });

      return result.rows[0];
    } catch (error) {
      logger.error("Failed to create session", error, { userId });
      throw error;
    }
  }

  /**
   * Find session by token
   */
  static async findByToken(sessionToken: string): Promise<Session | null> {
    try {
      const result = await pool.query(
        `SELECT * FROM sessions 
         WHERE session_token = $1 AND is_active = true AND expires_at > NOW()`,
        [sessionToken]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find session", error);
      throw error;
    }
  }

  /**
   * Update session activity timestamp
   */
  static async updateActivity(sessionToken: string): Promise<void> {
    try {
      await pool.query(
        `UPDATE sessions SET last_activity = NOW() WHERE session_token = $1`,
        [sessionToken]
      );
    } catch (error) {
      logger.error("Failed to update session activity", error);
      throw error;
    }
  }

  /**
   * Invalidate a session
   */
  static async invalidate(sessionToken: string): Promise<boolean> {
    try {
      const result = await pool.query(
        `UPDATE sessions SET is_active = false WHERE session_token = $1`,
        [sessionToken]
      );

      logger.info("Session invalidated", { sessionToken });

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      logger.error("Failed to invalidate session", error);
      throw error;
    }
  }

  /**
   * Invalidate all sessions for a user
   */
  static async invalidateAllForUser(userId: number): Promise<number> {
    try {
      const result = await pool.query(
        `UPDATE sessions SET is_active = false 
         WHERE user_id = $1 AND is_active = true`,
        [userId]
      );

      const count = result.rowCount ?? 0;
      logger.info("All sessions invalidated for user", { userId, count });

      return count;
    } catch (error) {
      logger.error("Failed to invalidate all sessions", error, { userId });
      throw error;
    }
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpired(): Promise<number> {
    try {
      const result = await pool.query(
        `DELETE FROM sessions WHERE expires_at < NOW() OR 
         (is_active = true AND last_activity < NOW() - INTERVAL '24 hours')`
      );

      const deletedCount = result.rowCount ?? 0;
      if (deletedCount > 0) {
        logger.info("Expired sessions cleaned up", { deletedCount });
      }

      return deletedCount;
    } catch (error) {
      logger.error("Failed to clean up expired sessions", error);
      throw error;
    }
  }

  /**
   * Get all active sessions for a user
   */
  static async getActiveSessions(userId: number): Promise<Session[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM sessions 
         WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
         ORDER BY last_activity DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      logger.error("Failed to get active sessions", error, { userId });
      throw error;
    }
  }

  /**
   * Verify CSRF token
   */
  static async verifyCsrfToken(
    sessionToken: string,
    csrfToken: string
  ): Promise<boolean> {
    try {
      const result = await pool.query(
        `SELECT csrf_token FROM sessions 
         WHERE session_token = $1 AND is_active = true`,
        [sessionToken]
      );

      if (!result.rows[0]) return false;

      return result.rows[0].csrf_token === csrfToken;
    } catch (error) {
      logger.error("Failed to verify CSRF token", error);
      throw error;
    }
  }

  /**
   * Detect suspicious session activity
   */
  static async detectSuspiciousActivity(
    sessionToken: string,
    currentIp: string,
    currentUserAgent: string
  ): Promise<boolean> {
    try {
      const session = await this.findByToken(sessionToken);

      if (!session) return true; // Suspicious if session not found

      // Check if IP or User Agent changed
      const ipChanged = session.ip_address && session.ip_address !== currentIp;
      const uaChanged =
        session.user_agent && session.user_agent !== currentUserAgent;

      if (ipChanged || uaChanged) {
        logger.warn("Suspicious session activity detected", {
          sessionId: session.id,
          ipChanged,
          uaChanged,
        });
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Failed to detect suspicious activity", error);
      return true; // Treat errors as suspicious
    }
  }
}

export default SessionModel;
