import pool from "../db.js";

interface PerQuestionResult {
  question_id: string;
  chosen_choice_id: string;
  correct: boolean;
  points_awarded: number;
  time_spent?: number; // in seconds
  streak_bonus?: number;
  speed_bonus?: number;
  difficulty_level?: string; // 'easy' | 'medium' | 'hard'
}

interface FlaggedQuestion {
  question_id: string;
  reason: string;
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
    flagged_questions,
    streak_bonus = 0,
    speed_bonus = 0,
    total_time_spent = 0,
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
    flagged_questions?: FlaggedQuestion[];
    streak_bonus?: number;
    speed_bonus?: number;
    total_time_spent?: number;
  }) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Create the attempt
      const { rows } = await client.query(
        `INSERT INTO attempts (
          user_id, quiz_id, mode, timed_duration_minutes, 
          started_at, completed_at, score, max_points, 
          per_question_results, tags_snapshot, streak_bonus, 
          speed_bonus, total_time_spent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
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
          streak_bonus,
          speed_bonus,
          total_time_spent,
        ]
      );

      const attempt = rows[0];

      // Insert flagged questions if any
      // Note: This will fail silently if the flagged_questions table doesn't exist
      if (flagged_questions && flagged_questions.length > 0) {
        try {
          const values: any[] = [];
          const placeholders: string[] = [];

          flagged_questions.forEach((fq, index) => {
            const offset = index * 5;
            placeholders.push(
              `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${
                offset + 4
              }, $${offset + 5})`
            );
            values.push(
              user_id,
              attempt.id,
              quiz_id,
              fq.question_id,
              fq.reason || "No reason provided"
            );
          });

          await client.query(
            `INSERT INTO flagged_questions 
             (user_id, attempt_id, quiz_id, question_id, reason) 
             VALUES ${placeholders.join(", ")}`,
            values
          );
        } catch (flagError: any) {
          // Log but don't fail the attempt if flagged_questions table doesn't exist
          console.warn(
            "Failed to insert flagged questions (table may not exist):",
            flagError.message
          );
          // Continue with the attempt creation
        }
      }

      await client.query("COMMIT");
      return attempt;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
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
