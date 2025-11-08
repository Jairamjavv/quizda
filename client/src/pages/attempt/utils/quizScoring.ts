type QuestionType =
  | "mcq_single"
  | "mcq_multiple"
  | "true_false"
  | "fill_blanks";

interface Question {
  _id: string;
  text: string;
  choices: Array<{
    id: string;
    text: string;
    is_correct: boolean;
  }>;
  points: number;
  tags: string[];
  order: number;
  question_type?: QuestionType;
  correct_answers?: string[];
}

interface PerQuestionResult {
  questionId: string;
  chosenChoiceId: string;
  correct: boolean;
  pointsAwarded: number;
  timeSpent: number;
  streakBonus: number;
  speedBonus: number;
  difficultyLevel: string;
}

export const calculateQuizScore = (
  questions: Question[],
  answers: Record<string, string | string[]>,
  questionTimeSpent: Record<string, number>
) => {
  let totalScore = 0;
  let maxPoints = 0;
  let totalStreakBonus = 0;
  let totalSpeedBonus = 0;
  let totalTimeSpent = 0;
  let currentStreak = 0;
  const perQuestionResults: PerQuestionResult[] = [];
  const allTags = new Set<string>();

  questions.forEach((question) => {
    maxPoints += question.points;
    question.tags.forEach((tag) => allTags.add(tag));

    const userAnswer = answers[question._id];
    const questionType = question.question_type || "mcq_single";
    let correct = false;
    let chosenChoiceId = "";

    // Determine if answer is correct based on question type
    if (questionType === "fill_blanks") {
      const userText = ((userAnswer as string) || "").trim().toLowerCase();
      correct =
        question.correct_answers?.some(
          (ans) => ans.trim().toLowerCase() === userText
        ) || false;
      chosenChoiceId = userText;
    } else if (questionType === "mcq_multiple") {
      const selectedIds = (userAnswer as string[]) || [];
      const correctChoices = question.choices.filter((c) => c.is_correct);
      const correctIds = correctChoices.map((c) => c.id);

      correct =
        selectedIds.length === correctIds.length &&
        selectedIds.every((id) => correctIds.includes(id));
      chosenChoiceId = selectedIds.join(",");
    } else {
      chosenChoiceId = userAnswer as string;
      const chosenChoice = question.choices.find(
        (choice) => choice.id === chosenChoiceId
      );
      correct = chosenChoice?.is_correct || false;
    }

    // Update streak counter
    if (correct) {
      currentStreak++;
    } else {
      currentStreak = 0;
    }

    // Calculate base points
    const basePoints = correct ? question.points : 0;

    // Calculate streak bonus (only for correct answers)
    // 3+ streak: 10% bonus, 5+ streak: 20% bonus, 7+ streak: 30% bonus
    let streakBonus = 0;
    if (correct && currentStreak >= 3) {
      let streakMultiplier = 0;
      if (currentStreak >= 7) streakMultiplier = 0.3;
      else if (currentStreak >= 5) streakMultiplier = 0.2;
      else if (currentStreak >= 3) streakMultiplier = 0.1;

      streakBonus = Math.round(basePoints * streakMultiplier * 100) / 100;
      totalStreakBonus += streakBonus;
    }

    // Calculate speed bonus (only for correct answers)
    // < 15 seconds: 30% bonus, < 20 seconds: 20% bonus, < 25 seconds: 10% bonus
    let speedBonus = 0;
    const timeSpent = questionTimeSpent[question._id] || 0;
    totalTimeSpent += timeSpent;

    if (correct && timeSpent > 0) {
      let speedMultiplier = 0;
      if (timeSpent < 15) speedMultiplier = 0.3;
      else if (timeSpent < 20) speedMultiplier = 0.2;
      else if (timeSpent < 25) speedMultiplier = 0.1;

      if (speedMultiplier > 0) {
        speedBonus = Math.round(basePoints * speedMultiplier * 100) / 100;
        totalSpeedBonus += speedBonus;
      }
    }

    const pointsAwarded = basePoints + streakBonus + speedBonus;
    totalScore += pointsAwarded;

    perQuestionResults.push({
      questionId: question._id,
      chosenChoiceId: chosenChoiceId,
      correct,
      pointsAwarded,
      timeSpent,
      streakBonus,
      speedBonus,
      difficultyLevel: "",
    });
  });

  return {
    score: totalScore,
    max_points: maxPoints,
    per_question_results: perQuestionResults,
    tags_snapshot: Array.from(allTags),
    streak_bonus: totalStreakBonus,
    speed_bonus: totalSpeedBonus,
    total_time_spent: totalTimeSpent,
  };
};
