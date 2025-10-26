# Enhanced Scoring System - Implementation Guide

## Overview
The quiz platform now features an advanced scoring system that rewards both accuracy and performance with streak bonuses and speed-based bonuses.

## New Features

### 1. Streak Bonuses 🔥
Consecutive correct answers are rewarded with bonus points:

| Streak Length | Bonus Multiplier | Example (10 point question) |
|--------------|------------------|----------------------------|
| 3+ correct   | +10%            | 1.0 bonus points          |
| 5+ correct   | +20%            | 2.0 bonus points          |
| 7+ correct   | +30%            | 3.0 bonus points          |

**How it works:**
- Each correct answer increments the streak counter
- Bonus is applied to the base points of each question
- Incorrect answers reset the streak to 0
- Only applies to correct answers

### 2. Speed-Based Scoring ⚡
Fast correct answers earn additional bonus points:

| Answer Time  | Bonus Multiplier | Example (10 point question) |
|-------------|------------------|----------------------------|
| < 15 seconds | +30%            | 3.0 bonus points          |
| < 20 seconds | +20%            | 2.0 bonus points          |
| < 25 seconds | +10%            | 1.0 bonus points          |
| ≥ 25 seconds | 0%              | No bonus                   |

**How it works:**
- Timer starts when question is displayed
- Only correct answers receive speed bonuses
- Time pauses during navigation (going back/forward)
- No penalty for slow answers, just no bonus

### 3. Time Tracking ⏱️
Every question now tracks:
- Time spent on each individual question
- Total quiz completion time
- Per-question time displayed in review

### 4. Detailed Attempt Review Page
New page accessible from Quiz History showing:

**Summary Section:**
- Total score with percentage
- Streak bonus earned
- Speed bonus earned
- Total time spent

**Per-Question Breakdown:**
- Question text and number
- ✅ Correct or ❌ Incorrect indicator
- Your answer (highlighted in green/red)
- Correct answer (if wrong)
- Time spent on question
- Points awarded breakdown:
  - Base points
  - Streak bonus (if any)
  - Speed bonus (if any)
- Difficulty level (placeholder for future)

**Visual Indicators:**
- 🔥 Whatshot icon for streak bonuses
- ⚡ Speed icon for speed bonuses
- ⏱️ Timer icon for time tracking
- Progress bars and color coding

## Database Schema Changes

### New Columns in `attempts` table:
```sql
streak_bonus DECIMAL(10,2) DEFAULT 0      -- Total streak bonus for attempt
speed_bonus DECIMAL(10,2) DEFAULT 0       -- Total speed bonus for attempt
total_time_spent INTEGER DEFAULT 0        -- Total time in seconds
```

### Enhanced `per_question_results` JSONB structure:
```json
{
  "questionId": "string",
  "chosenChoiceId": "string",
  "correct": boolean,
  "pointsAwarded": number,
  "timeSpent": number,           // NEW: seconds spent on question
  "streakBonus": number,          // NEW: bonus from streak
  "speedBonus": number,           // NEW: bonus from speed
  "difficultyLevel": "string"     // NEW: "easy"|"medium"|"hard" (future use)
}
```

## Installation Instructions

### Step 1: Run Database Migration

**For existing production database:**

```bash
# Connect to your PostgreSQL database
psql -U your_username -d your_database

# Run the migration script
\i server/migrations/add_enhanced_scoring.sql
```

**Or using the migration file directly:**

```bash
psql -U your_username -d your_database < server/migrations/add_enhanced_scoring.sql
```

**For new installations:**
The `server/init_db.ts` file has been updated to include these columns automatically.

### Step 2: Deploy Code

```bash
# Pull latest changes
git pull origin development

# Install dependencies (if any new ones)
cd client && npm install
cd ../server && npm install

# Build client
cd ../client && npm run build

# Restart server
cd ../server && npm run build
pm2 restart quizda-server  # or your process manager command
```

### Step 3: Verify Migration

```sql
-- Check if new columns exist
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'attempts' 
AND column_name IN ('streak_bonus', 'speed_bonus', 'total_time_spent');

-- Should return 3 rows
```

## API Changes

### POST `/quizzes/:id/attempt`
**New request body fields:**
```json
{
  "mode": "timed" | "zen",
  "score": 85.5,
  "max_points": 100,
  "per_question_results": [...],
  
  // NEW FIELDS:
  "streak_bonus": 12.5,
  "speed_bonus": 8.0,
  "total_time_spent": 450  // seconds
}
```

**Each per_question_result now includes:**
```json
{
  "questionId": "abc123",
  "chosenChoiceId": "choice_1",
  "correct": true,
  "pointsAwarded": 15.5,
  
  // NEW FIELDS:
  "timeSpent": 18,         // seconds
  "streakBonus": 2.0,
  "speedBonus": 3.0,
  "difficultyLevel": ""    // empty for now
}
```

### GET `/dashboard/attempts/:attemptId`
**New endpoint** - Returns detailed attempt information:
```json
{
  "id": 123,
  "quiz_id": "quiz_abc",
  "score": 85.5,
  "max_points": 100,
  "streak_bonus": 12.5,     // NEW
  "speed_bonus": 8.0,       // NEW
  "total_time_spent": 450,  // NEW
  "per_question_results": [...]
}
```

## Frontend Routes

### New Route
- `/quiz/attempt/:attemptId` - Detailed attempt review page

### Updated Routes
- `/quiz/history` - Now includes "View Details" button for completed attempts

## User Experience Flow

1. **Taking Quiz:**
   - Timer starts when question loads
   - Time pauses when navigating back/forward
   - Time accumulates if user revisits questions

2. **Submitting Quiz:**
   - System calculates streak bonuses based on consecutive correct answers
   - System calculates speed bonuses for fast correct responses
   - All data saved to database

3. **Viewing History:**
   - Quiz History shows all attempts with scores
   - "View Details" button on completed attempts

4. **Reviewing Attempt:**
   - Summary shows total bonuses earned
   - Each question shows detailed breakdown
   - Visual indicators for bonuses
   - Color-coded correct/incorrect answers

## Performance Considerations

### Scoring Calculation
- All calculations happen client-side before submission
- No additional API calls during quiz taking
- Single submission saves all data atomically

### Time Tracking
- Uses JavaScript Date objects for precision
- Tracks cumulative time per question
- Minimal performance overhead

### Database
- JSONB indexes already exist on `per_question_results`
- New columns have default values (backward compatible)
- No performance impact on existing queries

## Backward Compatibility

✅ **Fully backward compatible:**
- Old attempts without bonuses still display correctly
- Missing fields default to 0
- No breaking changes to existing APIs
- Frontend gracefully handles missing data

## Testing Checklist

- [ ] Run database migration successfully
- [ ] Take a new quiz and verify time tracking
- [ ] Complete quiz and check streak bonuses calculated correctly
- [ ] Verify speed bonuses for fast answers
- [ ] View attempt details page
- [ ] Check quiz history displays correctly
- [ ] Verify old attempts still viewable
- [ ] Test with different question types (MCQ, True/False, Fill Blanks)
- [ ] Test navigation between questions preserves time
- [ ] Verify mobile responsiveness of review page

## Configuration

### Adjusting Bonus Thresholds

**Streak bonuses** (in `client/src/pages/QuizTaking.tsx`):
```typescript
// Current thresholds
if (currentStreak >= 7) streakMultiplier = 0.3  // 30%
else if (currentStreak >= 5) streakMultiplier = 0.2  // 20%
else if (currentStreak >= 3) streakMultiplier = 0.1  // 10%
```

**Speed bonuses** (in `client/src/pages/QuizTaking.tsx`):
```typescript
// Current thresholds (in seconds)
if (timeSpent < 15) speedMultiplier = 0.3  // 30%
else if (timeSpent < 20) speedMultiplier = 0.2  // 20%
else if (timeSpent < 25) speedMultiplier = 0.1  // 10%
```

## Future Enhancements

### Planned Features:
1. **Difficulty-Based Scoring**
   - Easy questions: 1x multiplier
   - Medium questions: 1.5x multiplier
   - Hard questions: 2x multiplier

2. **Leaderboards**
   - Display top scorers by bonus points
   - Weekly/monthly leaderboards

3. **Achievement Badges**
   - "Speed Demon" - 90%+ speed bonuses
   - "Consistent" - Long streaks
   - "Perfect Score" - 100% with all bonuses

4. **Analytics Dashboard**
   - Average speed per tag
   - Streak patterns over time
   - Improvement metrics

## Troubleshooting

### Issue: Migration fails with "column already exists"
**Solution:** The columns may have been added manually. Run:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'attempts' 
AND column_name IN ('streak_bonus', 'speed_bonus', 'total_time_spent');
```
If all 3 columns exist, skip the migration.

### Issue: Old attempts show "undefined" bonuses
**Solution:** This is expected. The frontend handles this gracefully by defaulting to 0.

### Issue: Time tracking not working
**Checklist:**
1. Clear browser cache
2. Verify `questionStartTime` state initializes on quiz start
3. Check browser console for errors
4. Ensure `saveCurrentQuestionTime()` called before navigation

### Issue: Bonuses not calculated
**Checklist:**
1. Verify answer is correct (bonuses only for correct answers)
2. Check streak count increments properly
3. Verify time spent is recorded
4. Check console for calculation errors

## Support

For issues or questions:
1. Check this documentation
2. Review commit `de8b5b0` for implementation details
3. Check server logs for API errors
4. Open issue on GitHub repository

---

**Version:** 1.0.0  
**Date:** October 26, 2025  
**Commit:** de8b5b0
