import { createClient } from "redis";
import { logger } from "./logger.js";

let redisClient: ReturnType<typeof createClient> | null = null;

// Create Redis client with connection retry logic
function createRedisClient(): ReturnType<typeof createClient> | null {
  const redisUrl = process.env.REDIS_URL;

  // Log environment variable status for debugging
  if (!redisUrl) {
    logger.warn(
      "REDIS_URL environment variable not set - Redis will be disabled"
    );
    logger.info(
      "To enable Redis, set REDIS_URL in your Render environment variables"
    );
    logger.info(
      "Example: redis://default:password@host:port or rediss://... for TLS"
    );
    // Return null to skip Redis initialization
    return null;
  }

  const isUpstash = redisUrl.startsWith("rediss://");
  // Mask password in logs for security
  const maskedUrl = redisUrl.replace(/:([^@]+)@/, ":****@");
  logger.info("Creating Redis client", { url: maskedUrl, isUpstash });

  const client = createClient({
    url: redisUrl,
    socket: {
      // Enable TLS for Upstash (rediss:// URLs)
      ...(isUpstash && {
        tls: true,
      }),
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error("Redis: Max reconnection attempts reached");
          return new Error("Max reconnection attempts reached");
        }
        // Exponential backoff: 50ms, 100ms, 200ms, etc.
        const delay = Math.min(retries * 50, 3000);
        logger.warn(
          `Redis: Reconnecting in ${delay}ms... (attempt ${retries})`
        );
        return delay;
      },
    },
  });

  // Error handling
  client.on("error", (error) => {
    logger.error("Redis client error", error);
  });

  client.on("connect", () => {
    logger.info("Redis client connected");
  });

  client.on("ready", () => {
    logger.info("Redis client ready");
  });

  client.on("reconnecting", () => {
    logger.warn("Redis client reconnecting...");
  });

  client.on("end", () => {
    logger.warn("Redis client connection closed");
  });

  return client;
}

// Connect to Redis
export async function connectRedis(): Promise<void> {
  try {
    // Check if REDIS_URL is configured
    if (!process.env.REDIS_URL) {
      logger.warn("Redis disabled - REDIS_URL environment variable not set");
      logger.info("Application will run without token blacklist feature");
      logger.info("To enable Redis:");
      logger.info("  1. Add a Redis service (e.g., Upstash free tier)");
      logger.info("  2. Set REDIS_URL in Render environment variables");
      logger.info("  3. Redeploy the service");
      return;
    }

    if (!redisClient) {
      const client = createRedisClient();
      if (!client) {
        logger.warn("Redis client creation skipped");
        return;
      }
      redisClient = client;
    }

    await redisClient.connect();
    const maskedUrl = process.env.REDIS_URL.replace(/:([^@]+)@/, ":****@");
    logger.info("Redis connection initialized", { url: maskedUrl });
  } catch (error) {
    logger.error("Failed to connect to Redis", error);
    // Continue without Redis - fallback to session-only invalidation
    logger.warn(
      "Token blacklist disabled - tokens will remain valid until expiry"
    );
  }
}

// Disconnect from Redis
export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info("Redis connection closed");
    }
  } catch (error) {
    logger.error("Error closing Redis connection", error);
  }
}

// Check if Redis is connected
export function isRedisConnected(): boolean {
  return redisClient?.isOpen ?? false;
}

// Get the Redis client instance
export function getClient() {
  return redisClient;
}

export default redisClient;
