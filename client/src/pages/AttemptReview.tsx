import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  LinearProgress,
  Stack
} from '@mui/material'
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Timer,
  Speed,
  Whatshot,
  TrendingUp
} from '@mui/icons-material'
import axios from 'axios'

interface AttemptDetail {
  id: number
  quiz_id: string
  mode: string
  started_at: string
  completed_at: string
  score: number
  max_points: number
  streak_bonus: number
  speed_bonus: number
  total_time_spent: number
  per_question_results: Array<{
    questionId: string
    chosenChoiceId: string
    correct: boolean
    pointsAwarded: number
    timeSpent: number
    streakBonus: number
    speedBonus: number
    difficultyLevel: string
  }>
}

interface Question {
  _id: string
  text: string
  choices: Array<{
    id: string
    text: string
    is_correct: boolean
  }>
  points: number
  question_type?: string
  correct_answers?: string[]
}

const AttemptReview: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>()
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAttemptDetails()
  }, [attemptId])

  const fetchAttemptDetails = async () => {
    try {
      setLoading(true)
      console.log('Fetching attempt details for ID:', attemptId)
      
      // Fetch attempt details
      const attemptResponse = await axios.get(`/dashboard/attempts/${attemptId}`)
      const attemptData = attemptResponse.data
      console.log('Received attempt data:', attemptData)
      
      // Add default values for backward compatibility with old attempts
      // Ensure all numeric fields are properly converted to numbers
      const normalizedAttempt = {
        ...attemptData,
        score: Number(attemptData.score) || 0,
        max_points: Number(attemptData.max_points) || 0,
        streak_bonus: Number(attemptData.streak_bonus) || 0,
        speed_bonus: Number(attemptData.speed_bonus) || 0,
        total_time_spent: Number(attemptData.total_time_spent) || 0,
        per_question_results: (attemptData.per_question_results || []).map((result: any) => ({
          questionId: result.questionId || result.question_id,
          chosenChoiceId: result.chosenChoiceId || result.chosen_choice_id || '',
          correct: result.correct || false,
          pointsAwarded: Number(result.pointsAwarded || result.points_awarded) || 0,
          timeSpent: Number(result.timeSpent || result.time_spent) || 0,
          streakBonus: Number(result.streakBonus || result.streak_bonus) || 0,
          speedBonus: Number(result.speedBonus || result.speed_bonus) || 0,
          difficultyLevel: result.difficultyLevel || result.difficulty_level || ''
        }))
      }
      
      console.log('Normalized attempt:', normalizedAttempt)
      setAttempt(normalizedAttempt)

      // Fetch quiz questions
      console.log('Fetching questions for quiz:', attemptData.quiz_id)
      const questionsResponse = await axios.get(`/quizzes/${attemptData.quiz_id}/questions`)
      console.log('Received questions:', questionsResponse.data)
      setQuestions(questionsResponse.data)
    } catch (err: any) {
      console.error('Error fetching attempt details:', err)
      setError(err.response?.data?.error || 'Failed to load attempt details')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getCorrectAnswers = (question: Question): string => {
    if (question.question_type === 'fill_blanks') {
      return question.correct_answers?.join(' or ') || 'N/A'
    }
    const correctChoices = question.choices.filter(c => c.is_correct)
    return correctChoices.map(c => c.text).join(', ')
  }

  const getUserAnswer = (question: Question, result: AttemptDetail['per_question_results'][0]): string => {
    if (question.question_type === 'fill_blanks') {
      return result.chosenChoiceId || 'Not answered'
    }
    if (question.question_type === 'mcq_multiple') {
      const chosenIds = result.chosenChoiceId.split(',').filter(id => id)
      if (chosenIds.length === 0) return 'Not answered'
      return question.choices
        .filter(c => chosenIds.includes(c.id))
        .map(c => c.text)
        .join(', ')
    }
    const chosen = question.choices.find(c => c.id === result.chosenChoiceId)
    return chosen?.text || 'Not answered'
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error || !attempt) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" onClick={() => navigate('/quiz/history')}>
            Back to History
          </Button>
        }>
          {error || 'Attempt not found'}
        </Alert>
      </Container>
    )
  }

  // Safety check for data
  if (!attempt.per_question_results || attempt.per_question_results.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning" action={
          <Button color="inherit" onClick={() => navigate('/quiz/history')}>
            Back to History
          </Button>
        }>
          No question results found for this attempt. This might be an old attempt from before the enhanced scoring system.
        </Alert>
      </Container>
    )
  }

  const percentage = (attempt.score / attempt.max_points) * 100

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/quiz/history')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Attempt Review
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Summary Card */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Quiz Performance Summary
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            sx={{ mt: 2 }}
            justifyContent="space-around"
          >
            <Box textAlign="center" flex={1}>
              <Typography variant="h3" color="primary" fontWeight="bold">
                {attempt.score.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                out of {attempt.max_points} points
              </Typography>
              <Typography variant="h6" color={percentage >= 70 ? 'success.main' : 'error.main'}>
                {percentage.toFixed(1)}%
              </Typography>
            </Box>

            <Box textAlign="center" flex={1}>
              <Whatshot sx={{ fontSize: 40, color: '#FF6B6B', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                +{attempt.streak_bonus.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Streak Bonus
              </Typography>
            </Box>

            <Box textAlign="center" flex={1}>
              <Speed sx={{ fontSize: 40, color: '#4ECDC4', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                +{attempt.speed_bonus.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Speed Bonus
              </Typography>
            </Box>

            <Box textAlign="center" flex={1}>
              <Timer sx={{ fontSize: 40, color: '#95E1D3', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {formatTime(attempt.total_time_spent)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Time
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Overall Progress
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={percentage} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                bgcolor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: percentage >= 70 ? '#4caf50' : '#f44336'
                }
              }} 
            />
          </Box>
        </Paper>

        {/* Question-by-Question Breakdown */}
        <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
          Question Breakdown
        </Typography>

        {attempt.per_question_results.map((result, index) => {
          const question = questions.find(q => q._id === result.questionId)
          if (!question) return null

          return (
            <Card key={result.questionId} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Typography variant="h6" component="span">
                        Question {index + 1}
                      </Typography>
                      {result.correct ? (
                        <CheckCircle sx={{ color: '#4caf50' }} />
                      ) : (
                        <Cancel sx={{ color: '#f44336' }} />
                      )}
                      <Chip 
                        label={result.correct ? 'Correct' : 'Incorrect'} 
                        color={result.correct ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body1" paragraph>
                      {question.text}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Stack 
                      direction={{ xs: 'column', md: 'row' }} 
                      spacing={2}
                    >
                      <Box flex={1}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Your Answer:
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            p: 1.5, 
                            bgcolor: result.correct ? '#e8f5e9' : '#ffebee',
                            borderRadius: 1,
                            border: `1px solid ${result.correct ? '#4caf50' : '#f44336'}`
                          }}
                        >
                          {getUserAnswer(question, result)}
                        </Typography>
                      </Box>

                      {!result.correct && (
                        <Box flex={1}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Correct Answer:
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              p: 1.5, 
                              bgcolor: '#e8f5e9',
                              borderRadius: 1,
                              border: '1px solid #4caf50'
                            }}
                          >
                            {getCorrectAnswers(question)}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>

                  {/* Stats sidebar */}
                  <Box 
                    sx={{ 
                      ml: 3, 
                      minWidth: 180, 
                      bgcolor: '#f5f5f5', 
                      p: 2, 
                      borderRadius: 2 
                    }}
                  >
                    <Box mb={2}>
                      <Typography variant="caption" color="text.secondary">
                        TIME SPENT
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatTime(result.timeSpent)}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box mb={2}>
                      <Typography variant="caption" color="text.secondary">
                        POINTS AWARDED
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {result.pointsAwarded.toFixed(1)} / {question.points}
                      </Typography>
                    </Box>

                    {result.streakBonus > 0 && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Box mb={2}>
                          <Typography variant="caption" color="text.secondary">
                            STREAK BONUS
                          </Typography>
                          <Typography variant="body1" fontWeight="bold" color="#FF6B6B">
                            +{result.streakBonus.toFixed(1)}
                          </Typography>
                        </Box>
                      </>
                    )}

                    {result.speedBonus > 0 && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Box mb={2}>
                          <Typography variant="caption" color="text.secondary">
                            SPEED BONUS
                          </Typography>
                          <Typography variant="body1" fontWeight="bold" color="#4ECDC4">
                            +{result.speedBonus.toFixed(1)}
                          </Typography>
                        </Box>
                      </>
                    )}

                    {result.difficultyLevel && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            DIFFICULTY
                          </Typography>
                          <Chip 
                            label={result.difficultyLevel} 
                            size="small" 
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )
        })}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/quiz/history')}
            size="large"
          >
            Back to Quiz History
          </Button>
        </Box>
      </Container>
    </>
  )
}

export default AttemptReview
