// Neon Postgres connection
import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default pool;