import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  connectionString: process.env.NEON_DATABASE_URL,
});

const tables = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    quiz_id VARCHAR(255) NOT NULL,
    mode VARCHAR(50) NOT NULL,
    timed_duration_minutes INTEGER,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    score DECIMAL(10,2) NOT NULL,
    max_points DECIMAL(10,2) NOT NULL,
    per_question_results JSONB NOT NULL,
    tags_snapshot JSONB NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS flagged_questions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    attempt_id INTEGER REFERENCES attempts(id),
    quiz_id VARCHAR(255) NOT NULL,
    question_id VARCHAR(255) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolved_by INTEGER REFERENCES users(id),
    resolution_notes TEXT
  );`,
];

async function main() {
  await client.connect();
  console.log("Creating PostgreSQL tables if they don't exist...\n");

  for (const createTableQuery of tables) {
    await client.query(createTableQuery);
  }

  await client.end();
  console.log("\n✅ All PostgreSQL tables are ready.");
}

main().catch((err) => {
  console.error("❌ Error creating PostgreSQL tables:", err);
  client.end();
  process.exit(1);
});
