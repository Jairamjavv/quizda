import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Container,
  Box,
  LinearProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
} from '@mui/material'
import { ArrowBack, Timer } from '@mui/icons-material'
import { useAuthV2 as useAuth } from '../../contexts/AuthContextV2'
import axios from 'axios'
import { designSystem } from '../../theme/designSystem'
import SandglassLoader from '../../components/SandglassLoader'
import QuizModeSelection from './components/QuizModeSelection'
import QuizQuestion from './components/QuizQuestion'
import QuizResults from './components/QuizResults'
import QuizNavigation from './components/QuizNavigation'
import FlagQuestionDialog from './components/FlagQuestionDialog'
import SubmitConfirmationDialog from './components/SubmitConfirmationDialog'
import { calculateQuizScore } from './utils/quizScoring'

type QuestionType = 'mcq_single' | 'mcq_multiple' | 'true_false' | 'fill_blanks'

interface Quiz {
  _id: string
  title: string
  description: string
  total_points: number
  tags: string[]
  group_id?: string
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
  tags: string[]
  order: number
  question_type?: QuestionType
  correct_answers?: string[]
}

interface Group {
  _id: string
  name: string
  description: string
}

const QuizTakingNew: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const quizId = searchParams.get('quizId')
  
  // Core state
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [questionTimeSpent, setQuestionTimeSpent] = useState<Record<string, number>>({})
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null)
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, string>>({})
  
  // UI state
  const [showFlagDialog, setShowFlagDialog] = useState(false)
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false)
  const [showModeSelection, setShowModeSelection] = useState(true)
  const [showResults, setShowResults] = useState(false)
  
  // Mode and timing
  const [mode, setMode] = useState<'timed' | 'zen' | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  
  // Data loading
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [availableGroups, setAvailableGroups] = useState<Group[]>([])
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all')
  const [selectedQuizId, setSelectedQuizId] = useState<string>('')
  const [attemptResult, setAttemptResult] = useState<any>(null)

  // Fetch groups and quizzes on mount
  useEffect(() => {
    fetchGroupsAndQuizzes()
  }, [])

  // Load quiz if quizId in URL
  useEffect(() => {
    if (quizId) {
      setSelectedQuizId(quizId)
      fetchQuizData(quizId)
    }
  }, [quizId])

  // Timer for timed mode
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (mode === 'timed' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [mode, timeLeft])

  const fetchGroupsAndQuizzes = async () => {
    try {
      const [groupsResponse, quizzesResponse] = await Promise.all([
        axios.get('/quizzes/groups'),
        axios.get('/quizzes')
      ])
      setAvailableGroups(groupsResponse.data)
      setAvailableQuizzes(quizzesResponse.data)
      setLoading(false)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load groups and quizzes')
      setLoading(false)
    }
  }

  const fetchQuizData = async (id: string) => {
    try {
      const [quizResponse, questionsResponse] = await Promise.all([
        axios.get(`/quizzes/${id}`),
        axios.get(`/quizzes/${id}/questions`)
      ])
      setQuiz(quizResponse.data)
      setQuestions(questionsResponse.data.sort((a: Question, b: Question) => a.order - b.order))
      setLoading(false)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load quiz')
      setLoading(false)
    }
  }

  const handleModeSelection = (selectedMode: 'timed' | 'zen', duration?: number) => {
    setMode(selectedMode)
    setShowModeSelection(false)
    setStartedAt(new Date())
    setQuestionStartTime(new Date())
    if (selectedMode === 'timed' && duration) {
      setTimeLeft(duration * 60)
    }
  }

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const saveCurrentQuestionTime = () => {
    if (questionStartTime && questions[currentQuestionIndex]) {
      const currentQuestionId = questions[currentQuestionIndex]._id
      const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000)
      
      setQuestionTimeSpent(prev => ({
        ...prev,
        [currentQuestionId]: (prev[currentQuestionId] || 0) + timeSpent
      }))
    }
  }

  const handleNextQuestion = () => {
    saveCurrentQuestionTime()
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setQuestionStartTime(new Date())
    }
  }

  const handlePreviousQuestion = () => {
    saveCurrentQuestionTime()
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setQuestionStartTime(new Date())
    }
  }

  const handleFlagToggle = (questionId: string) => {
    if (flaggedQuestions[questionId]) {
      const updated = { ...flaggedQuestions }
      delete updated[questionId]
      setFlaggedQuestions(updated)
    } else {
      setShowFlagDialog(true)
    }
  }

  const handleSaveFlag = (reason: string) => {
    const currentQuestionId = questions[currentQuestionIndex]._id
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentQuestionId]: reason || 'No reason provided'
    }))
    setShowFlagDialog(false)
  }

  const handleSubmitClick = () => {
    const unansweredCount = questions.filter(q => 
      !answers[q._id] || (Array.isArray(answers[q._id]) && answers[q._id].length === 0)
    ).length
    
    if (unansweredCount > 0 || Object.keys(flaggedQuestions).length > 0) {
      setShowSubmitConfirmation(true)
    } else {
      handleSubmitQuiz()
    }
  }

  const handleSubmitQuiz = async () => {
    if (!quiz || !startedAt) return

    saveCurrentQuestionTime()
    const completedAt = new Date()
    
    const scoreData = calculateQuizScore(questions, answers, questionTimeSpent)

    try {
      const flaggedData = Object.keys(flaggedQuestions).length > 0
        ? Object.entries(flaggedQuestions).map(([question_id, reason]) => ({
            question_id,
            reason
          }))
        : undefined

      const attemptData = {
        mode,
        timed_duration_minutes: mode === 'timed' 
          ? Math.ceil((completedAt.getTime() - startedAt.getTime()) / (1000 * 60)) 
          : undefined,
        started_at: startedAt.toISOString(),
        completed_at: completedAt.toISOString(),
        ...scoreData,
        flagged_questions: flaggedData,
      }

      const response = await axios.post(`/quizzes/${quiz._id}/attempt`, attemptData)
      setAttemptResult(response.data)
      setShowResults(true)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit quiz')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const resetQuizState = () => {
    setQuiz(null)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setAnswers({})
    setQuestionTimeSpent({})
    setQuestionStartTime(null)
    setFlaggedQuestions({})
    setShowFlagDialog(false)
    setShowSubmitConfirmation(false)
    setMode(null)
    setTimeLeft(0)
    setStartedAt(null)
    setShowModeSelection(true)
    setShowResults(false)
    setSelectedGroupId('all')
    setSelectedQuizId('')
    setAttemptResult(null)
  }

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ bgcolor: designSystem.colors.darkBg }}>
        <SandglassLoader size={80} color={designSystem.colors.brandPrimary} />
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: designSystem.colors.darkBg }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert 
            severity="error" 
            action={
              <IconButton color="inherit" onClick={() => navigate('/dashboard')}>
                <ArrowBack />
              </IconButton>
            }
            sx={{
              borderRadius: designSystem.borderRadius.md,
              bgcolor: `${designSystem.colors.brandPrimary}15`,
              color: designSystem.colors.brandPrimary,
              border: `1px solid ${designSystem.colors.brandPrimary}`,
            }}
          >
            {error}
          </Alert>
        </Container>
      </Box>
    )
  }

  // Mode selection
  if (showModeSelection) {
    return (
      <QuizModeSelection
        availableGroups={availableGroups}
        availableQuizzes={availableQuizzes}
        selectedGroupId={selectedGroupId}
        selectedQuizId={selectedQuizId}
        onGroupChange={setSelectedGroupId}
        onQuizChange={fetchQuizData}
        onModeSelect={handleModeSelection}
        onBack={() => navigate('/dashboard')}
      />
    )
  }

  // Results view
  if (showResults && attemptResult) {
    return (
      <QuizResults
        score={attemptResult.score}
        maxPoints={attemptResult.max_points}
        onRetakeQuiz={() => {
          resetQuizState()
          navigate('/quiz/new')
        }}
        onViewHistory={() => navigate(`/quiz/history/${attemptResult.id}`)}
      />
    )
  }

  // Quiz taking view
  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).filter(key => 
    answers[key] && (!Array.isArray(answers[key]) || answers[key].length > 0)
  ).length

  return (
    <Box sx={{ bgcolor: designSystem.colors.darkBg, minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: designSystem.colors.darkBg, boxShadow: 'none', borderBottom: `1px solid rgba(255, 255, 255, 0.1)` }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            sx={{ 
              flexGrow: 1,
              color: designSystem.colors.textLight,
              fontFamily: designSystem.typography.fontFamily.display,
              fontWeight: 700,
            }}
          >
            {quiz?.title}
          </Typography>
          {mode === 'timed' && (
            <Box display="flex" alignItems="center" gap={1}>
              <Timer sx={{ color: designSystem.colors.accentYellow }} />
              <Typography 
                variant="h6"
                sx={{ 
                  color: timeLeft <= 60 ? designSystem.colors.brandPrimary : designSystem.colors.textLight,
                  fontFamily: designSystem.typography.fontFamily.mono 
                }}
              >
                {formatTime(timeLeft)}
              </Typography>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box mb={3}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              mb: 2,
              height: 8,
              borderRadius: designSystem.borderRadius.sm,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                bgcolor: designSystem.colors.accentGreen,
                borderRadius: designSystem.borderRadius.sm,
              }
            }} 
          />
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.6)',
              fontFamily: designSystem.typography.fontFamily.mono 
            }}
          >
            Question {currentQuestionIndex + 1} of {questions.length}
          </Typography>
        </Box>

        <QuizQuestion
          question={currentQuestion}
          answer={answers[currentQuestion._id]}
          isFlagged={!!flaggedQuestions[currentQuestion._id]}
          onAnswerChange={handleAnswerChange}
          onFlagToggle={handleFlagToggle}
        />

        <Box mt={3}>
          <QuizNavigation
            currentIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            onPrevious={handlePreviousQuestion}
            onNext={handleNextQuestion}
            onSubmit={handleSubmitClick}
          />
        </Box>
      </Container>

      <FlagQuestionDialog
        open={showFlagDialog}
        onClose={() => setShowFlagDialog(false)}
        onSave={handleSaveFlag}
      />

      <SubmitConfirmationDialog
        open={showSubmitConfirmation}
        answeredCount={answeredCount}
        totalCount={questions.length}
        onConfirm={() => {
          setShowSubmitConfirmation(false)
          handleSubmitQuiz()
        }}
        onCancel={() => setShowSubmitConfirmation(false)}
      />
    </Box>
  )
}

export default QuizTakingNew
