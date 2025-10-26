-- Migration: Add Enhanced Scoring Features
-- Date: 2025-10-26
-- Description: Adds streak bonus, speed bonus tracking, and detailed attempt analytics

-- Add columns to attempts table for aggregate bonuses
ALTER TABLE attempts 
ADD COLUMN IF NOT EXISTS streak_bonus DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS speed_bonus DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_time_spent INTEGER DEFAULT 0; -- in seconds

-- Note: per_question_results is already JSONB, so we can add new fields to it without schema change
-- The JSONB structure will now include:
-- {
--   "questionId": "string",
--   "chosenChoiceId": "string", 
--   "correct": boolean,
--   "pointsAwarded": number,
--   "timeSpent": number (seconds),
--   "streakBonus": number,
--   "speedBonus": number,
--   "difficultyLevel": string (easy/medium/hard) - to be used in future
-- }

-- Create index for faster queries on attempts
CREATE INDEX IF NOT EXISTS idx_attempts_user_completed ON attempts(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_quiz ON attempts(quiz_id);

-- Add comment to document the enhanced structure
COMMENT ON COLUMN attempts.per_question_results IS 
'JSONB array containing detailed per-question results including: questionId, chosenChoiceId, correct, pointsAwarded, timeSpent (seconds), streakBonus, speedBonus, difficultyLevel';

COMMENT ON COLUMN attempts.streak_bonus IS 
'Total bonus points awarded for consecutive correct answers during the quiz attempt';

COMMENT ON COLUMN attempts.speed_bonus IS 
'Total bonus points awarded for fast correct answers during the quiz attempt';

COMMENT ON COLUMN attempts.total_time_spent IS 
'Total time spent on the quiz in seconds';
