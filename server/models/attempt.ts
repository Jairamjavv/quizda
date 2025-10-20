import pool from "../db.js";

interface PerQuestionResult {
  question_id: string;
  chosen_choice_id: string;
  correct: boolean;
  points_awarded: number;
}

const Attempt = {
  async create({
    user_id,
    quiz_id,
    mode,
    timed_duration_minutes,
    started_at,
    completed_at,
    score,
    max_points,
    per_question_results,
    tags_snapshot,
  }: {
    user_id: number;
    quiz_id: string;
    mode: "timed" | "zen";
    timed_duration_minutes?: number;
    started_at: Date;
    completed_at: Date;
    score: number;
    max_points: number;
    per_question_results: PerQuestionResult[];
    tags_snapshot: string[];
  }) {
    const { rows } = await pool.query(
      `INSERT INTO attempts (
        user_id, quiz_id, mode, timed_duration_minutes, 
        started_at, completed_at, score, max_points, 
        per_question_results, tags_snapshot
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        user_id,
        quiz_id,
        mode,
        timed_duration_minutes,
        started_at,
        completed_at,
        score,
        max_points,
        JSON.stringify(per_question_results),
        JSON.stringify(tags_snapshot),
      ]
    );
    return rows[0];
  },

  async getByUser(user_id: number) {
    const { rows } = await pool.query(
      "SELECT * FROM attempts WHERE user_id = $1 ORDER BY started_at DESC",
      [user_id]
    );
    return rows;
  },

  async getById(id: number) {
    const { rows } = await pool.query("SELECT * FROM attempts WHERE id = $1", [
      id,
    ]);
    return rows[0];
  },

  async getStreakData(user_id: number) {
    const { rows } = await pool.query(
      `SELECT DISTINCT DATE(started_at) as attempt_date 
       FROM attempts 
       WHERE user_id = $1 AND completed_at IS NOT NULL 
       ORDER BY attempt_date DESC`,
      [user_id]
    );
    return rows;
  },

  async getTagStats(user_id: number) {
    const { rows } = await pool.query(
      `SELECT 
         jsonb_array_elements_text(tags_snapshot) as tag_name,
         COUNT(*) as total_attempts,
         SUM(CASE WHEN score > 0 THEN 1 ELSE 0 END) as correct_attempts,
         AVG(score::float / NULLIF(max_points, 0)) as avg_accuracy
       FROM attempts 
       WHERE user_id = $1 AND completed_at IS NOT NULL
       GROUP BY tag_name`,
      [user_id]
    );
    return rows;
  },
};

export default Attempt;
