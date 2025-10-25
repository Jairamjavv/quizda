import { createClient } from "redis";
import { logger } from "./logger.js";

let redisClient: ReturnType<typeof createClient> | null = null;

// Create Redis client with connection retry logic
function createRedisClient() {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const isUpstash = redisUrl.startsWith("rediss://");

  logger.info("Creating Redis client", { url: redisUrl, isUpstash });

  const client = createClient({
    url: redisUrl,
    socket: {
      // Enable TLS for Upstash (rediss:// URLs)
      ...(isUpstash && {
        tls: true,
        rejectUnauthorized: false, // Upstash certificates are valid but sometimes Node needs this
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
    if (!redisClient) {
      redisClient = createRedisClient();
    }
    await redisClient.connect();
    logger.info("Redis connection initialized", {
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });
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
