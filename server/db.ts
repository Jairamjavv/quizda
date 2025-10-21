// Neon Postgres connection
import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;
import { logger } from "./logger.js";
dotenv.config();

logger.info("Initializing PostgreSQL connection pool", {
  hasConnectionString: !!process.env.NEON_DATABASE_URL,
});

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Test connection
pool.on("connect", () => {
  logger.info("✅ PostgreSQL client connected");
});

pool.on("error", (err) => {
  logger.error("PostgreSQL pool error", err);
});

export default pool;
