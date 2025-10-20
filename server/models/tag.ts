import pool from "../db.js";

const Tag = {
  async getAll() {
    const { rows } = await pool.query("SELECT * FROM tags");
    return rows;
  },
  async create(name: string) {
    const { rows } = await pool.query(
      "INSERT INTO tags (name) VALUES ($1) RETURNING *",
      [name]
    );
    return rows[0];
  },
  async delete(id: number) {
    await pool.query("DELETE FROM tags WHERE id = $1", [id]);
  },
};

export default Tag;
