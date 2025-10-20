import pool from "../db.js";

const User = {
  async findByEmail(email: string) {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return rows[0];
  },

  async create(email: string, passwordHash: string, role: string = "user") {
    const { rows } = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *",
      [email, passwordHash, role]
    );
    return rows[0];
  },

  async findById(id: number) {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    return rows[0];
  },

  async updateLastLogin(id: number) {
    const { rows } = await pool.query(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );
    return rows[0];
  },
};

export default User;
