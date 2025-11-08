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
    mode VARCHAR(50) DEFAULT 'attempt',
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
    tags_snapshot JSONB NOT NULL,
    streak_bonus DECIMAL(10,2) DEFAULT 0,
    speed_bonus DECIMAL(10,2) DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0
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
  // Session Management Tables
  `CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_info TEXT,
    ip_address VARCHAR(45),
    revoked BOOLEAN DEFAULT FALSE
  );`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    csrf_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_fingerprint TEXT,
    is_active BOOLEAN DEFAULT TRUE
  );`,
  `CREATE TABLE IF NOT EXISTS login_attempts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    successful BOOLEAN DEFAULT FALSE
  );`,
];

const indexes = [
  // Refresh tokens indexes
  `CREATE INDEX IF NOT EXISTS idx_refresh_token_hash ON refresh_tokens(token_hash);`,
  `CREATE INDEX IF NOT EXISTS idx_refresh_token_user_id ON refresh_tokens(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_refresh_token_expires_at ON refresh_tokens(expires_at);`,
  // Sessions indexes
  `CREATE INDEX IF NOT EXISTS idx_session_token ON sessions(session_token);`,
  `CREATE INDEX IF NOT EXISTS idx_session_user_id ON sessions(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_session_expires_at ON sessions(expires_at);`,
  `CREATE INDEX IF NOT EXISTS idx_session_last_activity ON sessions(last_activity);`,
  // Login attempts indexes
  `CREATE INDEX IF NOT EXISTS idx_login_attempts_email_ip ON login_attempts(email, ip_address);`,
  `CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at);`,
];

const functions = [
  `CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
  RETURNS void AS $$
  BEGIN
    DELETE FROM refresh_tokens WHERE expires_at < NOW();
    DELETE FROM sessions WHERE expires_at < NOW() OR 
      (is_active = true AND last_activity < NOW() - INTERVAL '24 hours');
    DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '1 hour';
  END;
  $$ LANGUAGE plpgsql;`,
];

async function main() {
  await client.connect();
  console.log("Creating PostgreSQL tables if they don't exist...\n");

  // Create tables
  for (const createTableQuery of tables) {
    await client.query(createTableQuery);
  }

  console.log("Creating indexes...\n");

  // Create indexes
  for (const createIndexQuery of indexes) {
    await client.query(createIndexQuery);
  }

  console.log("Creating functions...\n");

  // Create functions
  for (const createFunctionQuery of functions) {
    await client.query(createFunctionQuery);
  }

  await client.end();
  console.log("\n✅ All PostgreSQL tables, indexes, and functions are ready.");
  console.log("✅ Session management tables created successfully.");
  console.log("✅ Security: Refresh tokens are stored as SHA-256 hashes.");
}

main().catch((err) => {
  console.error("❌ Error creating PostgreSQL tables:", err);
  client.end();
  process.exit(1);
});
