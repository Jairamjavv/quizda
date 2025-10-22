import pool from "../db.js";

const FlaggedQuestion = {
  async create({
    user_id,
    attempt_id,
    quiz_id,
    question_id,
    reason,
  }: {
    user_id: number;
    attempt_id: number;
    quiz_id: string;
    question_id: string;
    reason: string;
  }) {
    const result = await pool.query(
      `INSERT INTO flagged_questions 
        (user_id, attempt_id, quiz_id, question_id, reason) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [user_id, attempt_id, quiz_id, question_id, reason]
    );
    return result.rows[0];
  },

  async bulkCreate(
    flaggedQuestions: Array<{
      user_id: number;
      attempt_id: number;
      quiz_id: string;
      question_id: string;
      reason: string;
    }>
  ) {
    if (flaggedQuestions.length === 0) return [];

    const values: any[] = [];
    const placeholders: string[] = [];

    flaggedQuestions.forEach((fq, index) => {
      const offset = index * 5;
      placeholders.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${
          offset + 5
        })`
      );
      values.push(
        fq.user_id,
        fq.attempt_id,
        fq.quiz_id,
        fq.question_id,
        fq.reason
      );
    });

    const query = `
      INSERT INTO flagged_questions 
        (user_id, attempt_id, quiz_id, question_id, reason) 
      VALUES ${placeholders.join(", ")} 
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows;
  },

  async getAll() {
    const result = await pool.query(
      `SELECT fq.*, u.email as user_email 
       FROM flagged_questions fq 
       LEFT JOIN users u ON fq.user_id = u.id 
       WHERE fq.resolved = FALSE 
       ORDER BY fq.created_at DESC`
    );
    return result.rows;
  },

  async getByQuiz(quiz_id: string) {
    const result = await pool.query(
      `SELECT fq.*, u.email as user_email 
       FROM flagged_questions fq 
       LEFT JOIN users u ON fq.user_id = u.id 
       WHERE fq.quiz_id = $1 AND fq.resolved = FALSE 
       ORDER BY fq.created_at DESC`,
      [quiz_id]
    );
    return result.rows;
  },

  async getByQuestion(question_id: string) {
    const result = await pool.query(
      `SELECT fq.*, u.email as user_email 
       FROM flagged_questions fq 
       LEFT JOIN users u ON fq.user_id = u.id 
       WHERE fq.question_id = $1 AND fq.resolved = FALSE 
       ORDER BY fq.created_at DESC`,
      [question_id]
    );
    return result.rows;
  },

  async getStats() {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_flagged,
        COUNT(CASE WHEN resolved = FALSE THEN 1 END) as unresolved,
        COUNT(CASE WHEN resolved = TRUE THEN 1 END) as resolved,
        COUNT(DISTINCT quiz_id) as quizzes_with_flags,
        COUNT(DISTINCT question_id) as questions_flagged
       FROM flagged_questions`
    );
    return result.rows[0];
  },

  async getGroupedByQuestion() {
    const result = await pool.query(
      `SELECT 
        question_id,
        quiz_id,
        COUNT(*) as flag_count,
        array_agg(DISTINCT reason) as reasons,
        MAX(created_at) as last_flagged_at
       FROM flagged_questions 
       WHERE resolved = FALSE
       GROUP BY question_id, quiz_id
       ORDER BY flag_count DESC, last_flagged_at DESC`
    );
    return result.rows;
  },

  async resolve({
    id,
    resolved_by,
    resolution_notes,
  }: {
    id: number;
    resolved_by: number;
    resolution_notes?: string;
  }) {
    const result = await pool.query(
      `UPDATE flagged_questions 
       SET resolved = TRUE, 
           resolved_at = CURRENT_TIMESTAMP, 
           resolved_by = $2,
           resolution_notes = $3
       WHERE id = $1 
       RETURNING *`,
      [id, resolved_by, resolution_notes]
    );
    return result.rows[0];
  },

  async resolveAllForQuestion({
    question_id,
    resolved_by,
    resolution_notes,
  }: {
    question_id: string;
    resolved_by: number;
    resolution_notes?: string;
  }) {
    const result = await pool.query(
      `UPDATE flagged_questions 
       SET resolved = TRUE, 
           resolved_at = CURRENT_TIMESTAMP, 
           resolved_by = $2,
           resolution_notes = $3
       WHERE question_id = $1 AND resolved = FALSE
       RETURNING *`,
      [question_id, resolved_by, resolution_notes]
    );
    return result.rows;
  },
};

export default FlaggedQuestion;
