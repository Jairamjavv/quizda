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
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  LinearProgress,
  Stack
} from '@mui/material'
import SandglassLoader from '../../components/SandglassLoader'
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
import { designSystem } from '../../theme/designSystem'

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
      
      // Fetch attempt details
      const attemptResponse = await axios.get(`/dashboard/attempts/${attemptId}`)
      const attemptData = attemptResponse.data
      
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
      
      setAttempt(normalizedAttempt)

      // Fetch quiz questions
      const questionsResponse = await axios.get(`/quizzes/${attemptData.quiz_id}/questions`)
      setQuestions(questionsResponse.data)
    } catch (err: any) {
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching attempt details:', err)
      }
      
      // Generic user-facing error message
      setError('Failed to load attempt details. Please try again later.')
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ bgcolor: designSystem.colors.darkBg }}>
        <SandglassLoader size={80} color={designSystem.colors.brandPrimary} />
      </Box>
    )
  }

  if (error || !attempt) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: designSystem.colors.darkBg }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error" action={
            <Button color="inherit" onClick={() => navigate('/quiz/history')}>
              Back to History
            </Button>
          }>
            {error || 'Attempt not found'}
          </Alert>
        </Container>
      </Box>
    )
  }

  // Safety check for data
  if (!attempt.per_question_results || attempt.per_question_results.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: designSystem.colors.darkBg }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="warning" action={
            <Button color="inherit" onClick={() => navigate('/quiz/history')}>
              Back to History
            </Button>
          }>
            No question results found for this attempt. This might be an old attempt from before the enhanced scoring system.
          </Alert>
        </Container>
      </Box>
    )
  }

  const percentage = (attempt.score / attempt.max_points) * 100

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: designSystem.colors.darkBg }}>
      <AppBar 
        position="static"
        sx={{ 
          bgcolor: designSystem.colors.darkBg,
          color: designSystem.colors.textLight,
          boxShadow: 'none',
          borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            sx={{ mr: 2, color: designSystem.colors.textLight }}
            onClick={() => navigate('/quiz/history')}
          >
            <ArrowBack />
          </IconButton>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              color: designSystem.colors.textLight,
              fontFamily: designSystem.typography.fontFamily.display,
            }}
          >
            Attempt Review
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Summary Card */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3,
            background: 'linear-gradient(135deg, #121212 0%, #181818 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: designSystem.borderRadius.bento,
            boxShadow: designSystem.shadows.bento,
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{ 
              color: designSystem.colors.textLight,
              fontWeight: 700,
              fontFamily: designSystem.typography.fontFamily.display,
            }}
          >
            Quiz Performance Summary
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            sx={{ mt: 2 }}
            justifyContent="space-around"
          >
            <Box textAlign="center" flex={1}>
              <Typography 
                variant="h3" 
                sx={{ 
                  color: percentage >= 70 ? designSystem.colors.accentGreen : designSystem.colors.brandPrimary,
                  fontWeight: 800,
                  fontFamily: designSystem.typography.fontFamily.mono,
                }}
              >
                {attempt.score.toFixed(1)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                out of {attempt.max_points} points
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: percentage >= 70 ? designSystem.colors.accentGreen : designSystem.colors.brandPrimary,
                  fontWeight: 700,
                }}
              >
                {percentage.toFixed(1)}%
              </Typography>
            </Box>

            <Box textAlign="center" flex={1}>
              <Whatshot sx={{ fontSize: 40, color: designSystem.colors.brandPrimary, mb: 1 }} />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 800,
                  color: designSystem.colors.textLight,
                  fontFamily: designSystem.typography.fontFamily.mono,
                }}
              >
                +{attempt.streak_bonus.toFixed(1)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Streak Bonus
              </Typography>
            </Box>

            <Box textAlign="center" flex={1}>
              <Speed sx={{ fontSize: 40, color: designSystem.colors.accentBlue, mb: 1 }} />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 800,
                  color: designSystem.colors.textLight,
                  fontFamily: designSystem.typography.fontFamily.mono,
                }}
              >
                +{attempt.speed_bonus.toFixed(1)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Speed Bonus
              </Typography>
            </Box>

            <Box textAlign="center" flex={1}>
              <Timer sx={{ fontSize: 40, color: designSystem.colors.accentGreen, mb: 1 }} />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 800,
                  color: designSystem.colors.textLight,
                  fontFamily: designSystem.typography.fontFamily.mono,
                }}
              >
                {formatTime(attempt.total_time_spent)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Total Time
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
              Overall Progress
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={percentage} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: percentage >= 70 ? designSystem.colors.accentGreen : designSystem.colors.brandPrimary,
                  borderRadius: 5,
                }
              }} 
            />
          </Box>
        </Paper>

        {/* Question-by-Question Breakdown */}
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            mb: 2,
            color: designSystem.colors.textLight,
            fontWeight: 700,
            fontFamily: designSystem.typography.fontFamily.display,
          }}
        >
          Question Breakdown
        </Typography>

        {attempt.per_question_results.map((result, index) => {
          const question = questions.find(q => q._id === result.questionId)
          if (!question) return null

          return (
            <Card 
              key={result.questionId} 
              sx={{ 
                mb: 2,
                background: 'linear-gradient(135deg, #121212 0%, #181818 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: designSystem.borderRadius.bento,
                boxShadow: designSystem.shadows.bento,
                transition: designSystem.animations.transition.default,
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                }
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Typography 
                        variant="h6" 
                        component="span"
                        sx={{ 
                          color: designSystem.colors.textLight,
                          fontWeight: 700,
                        }}
                      >
                        Question {index + 1}
                      </Typography>
                      {result.correct ? (
                        <CheckCircle sx={{ color: designSystem.colors.accentGreen }} />
                      ) : (
                        <Cancel sx={{ color: designSystem.colors.brandPrimary }} />
                      )}
                      <Chip 
                        label={result.correct ? 'Correct' : 'Incorrect'} 
                        size="small"
                        sx={{
                          bgcolor: result.correct 
                            ? 'rgba(125, 214, 141, 0.15)' 
                            : 'rgba(255, 98, 88, 0.15)',
                          color: result.correct 
                            ? designSystem.colors.accentGreen 
                            : designSystem.colors.brandPrimary,
                          border: `1px solid ${result.correct 
                            ? designSystem.colors.accentGreen 
                            : designSystem.colors.brandPrimary}`,
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    <Typography 
                      variant="body1" 
                      paragraph
                      sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
                    >
                      {question.text}
                    </Typography>

                    <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                    <Stack 
                      direction={{ xs: 'column', md: 'row' }} 
                      spacing={2}
                    >
                      <Box flex={1}>
                        <Typography 
                          variant="subtitle2" 
                          gutterBottom
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.6)',
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.5px',
                          }}
                        >
                          Your Answer:
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            p: 1.5, 
                            bgcolor: result.correct 
                              ? 'rgba(125, 214, 141, 0.1)' 
                              : 'rgba(255, 98, 88, 0.1)',
                            borderRadius: designSystem.borderRadius.bento,
                            border: `1px solid ${result.correct 
                              ? designSystem.colors.accentGreen 
                              : designSystem.colors.brandPrimary}`,
                            color: designSystem.colors.textLight,
                          }}
                        >
                          {getUserAnswer(question, result)}
                        </Typography>
                      </Box>

                      {!result.correct && (
                        <Box flex={1}>
                          <Typography 
                            variant="subtitle2" 
                            gutterBottom
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.6)',
                              textTransform: 'uppercase',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              letterSpacing: '0.5px',
                            }}
                          >
                            Correct Answer:
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              p: 1.5, 
                              bgcolor: 'rgba(125, 214, 141, 0.1)',
                              borderRadius: designSystem.borderRadius.bento,
                              border: `1px solid ${designSystem.colors.accentGreen}`,
                              color: designSystem.colors.textLight,
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
                      bgcolor: 'rgba(255, 255, 255, 0.03)', 
                      p: 2, 
                      borderRadius: designSystem.borderRadius.bento,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <Box mb={2}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontWeight: 700,
                          letterSpacing: '0.5px',
                        }}
                      >
                        TIME SPENT
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 800,
                          color: designSystem.colors.textLight,
                          fontFamily: designSystem.typography.fontFamily.mono,
                        }}
                      >
                        {formatTime(result.timeSpent)}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                    <Box mb={2}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontWeight: 700,
                          letterSpacing: '0.5px',
                        }}
                      >
                        POINTS AWARDED
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 800,
                          color: designSystem.colors.accentBlue,
                          fontFamily: designSystem.typography.fontFamily.mono,
                        }}
                      >
                        {result.pointsAwarded.toFixed(1)} / {question.points}
                      </Typography>
                    </Box>

                    {result.streakBonus > 0 && (
                      <>
                        <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }} />
                        <Box mb={2}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontWeight: 700,
                              letterSpacing: '0.5px',
                            }}
                          >
                            STREAK BONUS
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 800,
                              color: designSystem.colors.brandPrimary,
                              fontFamily: designSystem.typography.fontFamily.mono,
                            }}
                          >
                            +{result.streakBonus.toFixed(1)}
                          </Typography>
                        </Box>
                      </>
                    )}

                    {result.speedBonus > 0 && (
                      <>
                        <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }} />
                        <Box mb={2}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontWeight: 700,
                              letterSpacing: '0.5px',
                            }}
                          >
                            SPEED BONUS
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 800,
                              color: designSystem.colors.accentBlue,
                              fontFamily: designSystem.typography.fontFamily.mono,
                            }}
                          >
                            +{result.speedBonus.toFixed(1)}
                          </Typography>
                        </Box>
                      </>
                    )}

                    {result.difficultyLevel && (
                      <>
                        <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }} />
                        <Box>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontWeight: 700,
                              letterSpacing: '0.5px',
                            }}
                          >
                            DIFFICULTY
                          </Typography>
                          <Chip 
                            label={result.difficultyLevel} 
                            size="small" 
                            sx={{ 
                              mt: 0.5,
                              bgcolor: 'rgba(255, 255, 255, 0.08)',
                              color: designSystem.colors.textLight,
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              fontWeight: 600,
                            }}
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

        <Box sx={{ mt: 3, pb: 4, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/quiz/history')}
            size="large"
            sx={{
              bgcolor: designSystem.colors.brandPrimary,
              color: designSystem.colors.textDark,
              fontWeight: 700,
              px: 4,
              py: 1.5,
              borderRadius: designSystem.borderRadius.bento,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: designSystem.shadows.bento,
              transition: designSystem.animations.transition.default,
              '&:hover': {
                bgcolor: designSystem.colors.brandHover,
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(255, 98, 88, 0.3)',
              }
            }}
          >
            Back to Quiz History
          </Button>
        </Box>
      </Container>
    </Box>
  )
}

export default AttemptReview
