import { createClient } from "redis";
import { Redis as UpstashRedis } from "@upstash/redis";
import { logger } from "./logger.js";

// Support both traditional Redis (TCP) and Upstash (REST)
type RedisClient = ReturnType<typeof createClient> | null;
type UpstashClient = UpstashRedis | null;

let redisClient: RedisClient = null;
let upstashClient: UpstashClient = null;
let redisType: "traditional" | "upstash" | "disabled" = "disabled";

// Create traditional Redis client with connection retry logic
function createTraditionalRedisClient(): RedisClient {
  const redisUrl = process.env.REDIS_URL!;
  const isSecure = redisUrl.startsWith("rediss://");
  const maskedUrl = redisUrl.replace(/:([^@]+)@/, ":****@");
  logger.info("Creating traditional Redis client", {
    url: maskedUrl,
    secure: isSecure,
  });

  const client = createClient({
    url: redisUrl,
    socket: {
      // Enable TLS for secure connections
      ...(isSecure && {
        tls: true,
      }),
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error("Redis: Max reconnection attempts reached");
          return new Error("Max reconnection attempts reached");
        }
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
    logger.error("Traditional Redis client error", error);
  });

  client.on("connect", () => {
    logger.info("Traditional Redis client connected");
  });

  client.on("ready", () => {
    logger.info("Traditional Redis client ready");
  });

  client.on("reconnecting", () => {
    logger.warn("Traditional Redis client reconnecting...");
  });

  client.on("end", () => {
    logger.warn("Traditional Redis client connection closed");
  });

  return client;
}

// Create Upstash Redis client (REST API)
function createUpstashRedisClient(): UpstashClient {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!upstashUrl || !upstashToken) {
    logger.error("Upstash credentials missing", {
      hasUrl: !!upstashUrl,
      hasToken: !!upstashToken,
    });
    return null;
  }

  logger.info("Creating Upstash Redis client (REST API)", {
    url: upstashUrl.substring(0, 30) + "...",
  });

  const client = new UpstashRedis({
    url: upstashUrl,
    token: upstashToken,
  });

  return client;
}

// Connect to Redis
export async function connectRedis(): Promise<void> {
  try {
    // Option 1: Check for Upstash REST API credentials (recommended for serverless)
    if (
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      logger.info("Detected Upstash REST API credentials");
      const client = createUpstashRedisClient();
      if (client) {
        // Test the connection
        await client.ping();
        upstashClient = client;
        redisType = "upstash";
        logger.info("Upstash Redis (REST) connection initialized successfully");
        return;
      }
    }

    // Option 2: Check for traditional Redis URL
    if (process.env.REDIS_URL) {
      const redisUrl = process.env.REDIS_URL;

      // Check if it's an HTTP/HTTPS URL (Upstash REST but wrong env vars)
      if (redisUrl.startsWith("http://") || redisUrl.startsWith("https://")) {
        logger.error(
          "REDIS_URL appears to be an Upstash REST URL (starts with http/https)"
        );
        logger.error("Please use these environment variables instead:");
        logger.error("  UPSTASH_REDIS_REST_URL = your Upstash REST URL");
        logger.error("  UPSTASH_REDIS_REST_TOKEN = your Upstash token");
        logger.warn("Redis disabled - incorrect configuration");
        return;
      }

      logger.info("Detected traditional Redis URL");
      const client = createTraditionalRedisClient();
      if (client) {
        await client.connect();
        redisClient = client;
        redisType = "traditional";
        const maskedUrl = redisUrl.replace(/:([^@]+)@/, ":****@");
        logger.info("Traditional Redis connection initialized", {
          url: maskedUrl,
        });
        return;
      }
    }

    // No Redis configuration found
    logger.warn("Redis disabled - no configuration found");
    logger.info("Application will run without token blacklist feature");
    logger.info("To enable Redis, choose one option:");
    logger.info("");
    logger.info("Option 1 - Upstash (Recommended for Render/Serverless):");
    logger.info("  UPSTASH_REDIS_REST_URL = https://your-db.upstash.io");
    logger.info("  UPSTASH_REDIS_REST_TOKEN = your-token");
    logger.info("");
    logger.info("Option 2 - Traditional Redis:");
    logger.info("  REDIS_URL = redis://user:password@host:port");
    redisType = "disabled";
  } catch (error) {
    logger.error("Failed to connect to Redis", error);
    logger.warn(
      "Token blacklist disabled - tokens will remain valid until expiry"
    );
    redisType = "disabled";
  }
}

// Disconnect from Redis
export async function disconnectRedis(): Promise<void> {
  try {
    if (redisType === "traditional" && redisClient) {
      await redisClient.quit();
      logger.info("Traditional Redis connection closed");
    } else if (redisType === "upstash") {
      logger.info(
        "Upstash Redis connection closed (REST API - no persistent connection)"
      );
    }
  } catch (error) {
    logger.error("Error closing Redis connection", error);
  }
}

// Check if Redis is connected
export function isRedisConnected(): boolean {
  if (redisType === "traditional") {
    return redisClient?.isOpen ?? false;
  } else if (redisType === "upstash") {
    return upstashClient !== null;
  }
  return false;
}

// Get the Redis client instance (unified interface)
export function getClient(): { type: typeof redisType; client: any } {
  return {
    type: redisType,
    client: redisType === "traditional" ? redisClient : upstashClient,
  };
}
