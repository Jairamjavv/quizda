import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material'
import {
  ArrowBack,
  ArrowForward,
  Timer,
  CheckCircle,
  Cancel,
  Flag,
  FlagOutlined
} from '@mui/icons-material'
import { useAuthV2 as useAuth } from '../contexts/AuthContextV2'
import axios from 'axios'
import { designSystem } from '../theme/designSystem'

type QuestionType = 'mcq_single' | 'mcq_multiple' | 'true_false' | 'fill_blanks';
type ContentType = 'text' | 'markdown' | 'latex';

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
  content_type?: ContentType
  correct_answers?: string[]
}

interface QuizAttempt {
  quizId: string
  mode: 'timed' | 'zen'
  timedDurationMinutes?: number
  startedAt: Date
  completedAt?: Date
  score: number
  maxPoints: number
  perQuestionResults: Array<{
    questionId: string
    chosenChoiceId: string
    correct: boolean
    pointsAwarded: number
  }>
  tagsSnapshot: string[]
}

interface Group {
  _id: string
  name: string
  description: string
}

const QuizTaking: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const quizId = searchParams.get('quizId')
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [questionTimeSpent, setQuestionTimeSpent] = useState<Record<string, number>>({}) // questionId -> seconds
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null) // When current question was shown
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, string>>({}) // questionId -> reason
  const [showFlagDialog, setShowFlagDialog] = useState(false)
  const [flagReason, setFlagReason] = useState('')
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false)
  const [mode, setMode] = useState<'timed' | 'zen' | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModeSelection, setShowModeSelection] = useState(true)
  const [showResults, setShowResults] = useState(false)
  const [availableGroups, setAvailableGroups] = useState<Group[]>([])
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all')
  const [selectedQuizId, setSelectedQuizId] = useState<string>('')
  const [attemptResult, setAttemptResult] = useState<any>(null)

  useEffect(() => {
    // Fetch groups and quizzes on component mount
    fetchGroupsAndQuizzes()
  }, [])

  useEffect(() => {
    if (quizId) {
      setSelectedQuizId(quizId)
      fetchQuizData(quizId)
    }
  }, [quizId])

  useEffect(() => {
    // Filter quizzes by selected group
    if (selectedGroupId && selectedGroupId !== 'all') {
      const filtered = availableQuizzes.filter((q: any) => 
        q.group_id === selectedGroupId
      )
      // If current quiz is not in filtered list, clear selection
      if (selectedQuizId && !filtered.find((q: any) => q._id === selectedQuizId)) {
        setSelectedQuizId('')
        setQuiz(null)
      }
    }
  }, [selectedGroupId])

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

  const handleQuizSelection = async (id: string) => {
    setSelectedQuizId(id)
    setLoading(true)
    await fetchQuizData(id)
  }

  const fetchAvailableQuizzes = async () => {
    try {
      const response = await axios.get('/quizzes')
      if (response.data.length > 0) {
        const randomQuiz = response.data[Math.floor(Math.random() * response.data.length)]
        navigate(`/quiz/new?quizId=${randomQuiz._id}`)
      } else {
        setError('No quizzes available')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load quizzes')
    } finally {
      setLoading(false)
    }
  }

  const handleModeSelection = (selectedMode: 'timed' | 'zen', duration?: number) => {
    setMode(selectedMode)
    setShowModeSelection(false)
    setStartedAt(new Date())
    setQuestionStartTime(new Date()) // Start tracking time for first question
    if (selectedMode === 'timed' && duration) {
      setTimeLeft(duration * 60) // Convert minutes to seconds
    }
  }

  const handleAnswerChange = (questionId: string, choiceId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }))
  }

  const handleMultipleChoiceChange = (questionId: string, choiceId: string, checked: boolean) => {
    setAnswers(prev => {
      const current = (prev[questionId] as string[]) || []
      if (checked) {
        return { ...prev, [questionId]: [...current, choiceId] }
      } else {
        return { ...prev, [questionId]: current.filter(id => id !== choiceId) }
      }
    })
  }

  const handleTextAnswerChange = (questionId: string, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: text
    }))
  }

  const handleNextQuestion = () => {
    // Save time spent on current question before moving
    saveCurrentQuestionTime()
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      // Start timer for next question
      setQuestionStartTime(new Date())
    }
  }

  const handlePreviousQuestion = () => {
    // Save time spent on current question before moving
    saveCurrentQuestionTime()
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      // Start timer for previous question
      setQuestionStartTime(new Date())
    }
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

  const handleFlagQuestion = () => {
    const currentQuestionId = questions[currentQuestionIndex]._id
    if (flaggedQuestions[currentQuestionId]) {
      // Unflag if already flagged
      const updated = { ...flaggedQuestions }
      delete updated[currentQuestionId]
      setFlaggedQuestions(updated)
    } else {
      // Show dialog to add flag with reason
      setFlagReason('')
      setShowFlagDialog(true)
    }
  }

  const handleSaveFlag = () => {
    const currentQuestionId = questions[currentQuestionIndex]._id
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentQuestionId]: flagReason || 'No reason provided'
    }))
    setShowFlagDialog(false)
    setFlagReason('')
  }

  const handleSubmitClick = () => {
    // Check for unanswered questions
    const unansweredQuestions = questions.filter(q => !answers[q._id] || 
      (Array.isArray(answers[q._id]) && answers[q._id].length === 0))
    
    // Show confirmation dialog if there are unanswered or flagged questions
    if (unansweredQuestions.length > 0 || Object.keys(flaggedQuestions).length > 0) {
      setShowSubmitConfirmation(true)
    } else {
      handleSubmitQuiz()
    }
  }

  const handleConfirmedSubmit = async () => {
    setShowSubmitConfirmation(false)
    await handleSubmitQuiz()
  }

  const calculateScore = () => {
    // Save time for the last question before calculating
    saveCurrentQuestionTime()
    
    let totalScore = 0
    let maxPoints = 0
    let totalStreakBonus = 0
    let totalSpeedBonus = 0
    let totalTimeSpent = 0
    let currentStreak = 0
    const perQuestionResults: Array<{
      questionId: string
      chosenChoiceId: string
      correct: boolean
      pointsAwarded: number
      timeSpent: number
      streakBonus: number
      speedBonus: number
      difficultyLevel: string
    }> = []
    const allTags = new Set<string>()

    questions.forEach((question, index) => {
      maxPoints += question.points
      question.tags.forEach(tag => allTags.add(tag))
      
      const userAnswer = answers[question._id]
      const questionType = question.question_type || 'mcq_single'
      let correct = false
      let chosenChoiceId = ''

      if (questionType === 'fill_blanks') {
        // For fill in the blanks, compare with correct_answers
        const userText = (userAnswer as string || '').trim().toLowerCase()
        correct = question.correct_answers?.some(ans => 
          ans.trim().toLowerCase() === userText
        ) || false
        chosenChoiceId = userText
      } else if (questionType === 'mcq_multiple') {
        // For multiple choice, check if all selected are correct and all correct are selected
        const selectedIds = (userAnswer as string[]) || []
        const correctChoices = question.choices.filter(c => c.is_correct)
        const correctIds = correctChoices.map(c => c.id)
        
        correct = selectedIds.length === correctIds.length &&
                  selectedIds.every(id => correctIds.includes(id))
        chosenChoiceId = selectedIds.join(',')
      } else {
        // For single choice (mcq_single, true_false)
        chosenChoiceId = userAnswer as string
        const chosenChoice = question.choices.find(choice => choice.id === chosenChoiceId)
        correct = chosenChoice?.is_correct || false
      }

      // Update streak counter
      if (correct) {
        currentStreak++
      } else {
        currentStreak = 0
      }

      // Calculate base points
      const basePoints = correct ? question.points : 0
      
      // Calculate streak bonus (only for correct answers)
      // 3+ streak: 10% bonus, 5+ streak: 20% bonus, 7+ streak: 30% bonus
      let streakBonus = 0
      if (correct && currentStreak >= 3) {
        let streakMultiplier = 0
        if (currentStreak >= 7) streakMultiplier = 0.3
        else if (currentStreak >= 5) streakMultiplier = 0.2
        else if (currentStreak >= 3) streakMultiplier = 0.1
        
        streakBonus = Math.round(basePoints * streakMultiplier * 100) / 100
        totalStreakBonus += streakBonus
      }

      // Calculate speed bonus (only for correct answers)
      // Optimal time: 30 seconds per question
      // < 15 seconds: 30% bonus, < 20 seconds: 20% bonus, < 25 seconds: 10% bonus
      let speedBonus = 0
      const timeSpent = questionTimeSpent[question._id] || 0
      totalTimeSpent += timeSpent
      
      if (correct && timeSpent > 0) {
        let speedMultiplier = 0
        if (timeSpent < 15) speedMultiplier = 0.3
        else if (timeSpent < 20) speedMultiplier = 0.2
        else if (timeSpent < 25) speedMultiplier = 0.1
        
        if (speedMultiplier > 0) {
          speedBonus = Math.round(basePoints * speedMultiplier * 100) / 100
          totalSpeedBonus += speedBonus
        }
      }

      const pointsAwarded = basePoints + streakBonus + speedBonus
      totalScore += pointsAwarded
      
      perQuestionResults.push({
        questionId: question._id,
        chosenChoiceId: chosenChoiceId,
        correct,
        pointsAwarded,
        timeSpent,
        streakBonus,
        speedBonus,
        difficultyLevel: '' // Empty for now, to be used in future
      })
    })

    return {
      score: totalScore,
      maxPoints,
      perQuestionResults,
      tagsSnapshot: Array.from(allTags),
      streakBonus: totalStreakBonus,
      speedBonus: totalSpeedBonus,
      totalTimeSpent
    }
  }

  const handleSubmitQuiz = async () => {
    if (!quiz || !startedAt) return

    const completedAt = new Date()
    const { 
      score, 
      maxPoints, 
      perQuestionResults, 
      tagsSnapshot,
      streakBonus,
      speedBonus,
      totalTimeSpent 
    } = calculateScore()

    try {
      // Prepare flagged questions data
      const flaggedData = Object.keys(flaggedQuestions).length > 0
        ? Object.entries(flaggedQuestions).map(([questionId, reason]) => ({
            question_id: questionId,
            reason
          }))
        : undefined

      const attemptData = {
        mode,
        timed_duration_minutes: mode === 'timed' ? Math.ceil((completedAt.getTime() - startedAt.getTime()) / (1000 * 60)) : undefined,
        started_at: startedAt.toISOString(),
        completed_at: completedAt.toISOString(),
        score,
        max_points: maxPoints,
        per_question_results: perQuestionResults,
        tags_snapshot: tagsSnapshot,
        flagged_questions: flaggedData,
        streak_bonus: streakBonus,
        speed_bonus: speedBonus,
        total_time_spent: totalTimeSpent
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ bgcolor: designSystem.colors.darkBg }}>
        <CircularProgress sx={{ color: designSystem.colors.brandPrimary }} />
      </Box>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              onClick={() => navigate('/dashboard')}
              sx={{ color: designSystem.colors.textLight }}
            >
              Back to Dashboard
            </Button>
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
    )
  }

  if (showModeSelection) {
    return (
      <Box sx={{ bgcolor: designSystem.colors.darkBg, minHeight: '100vh' }}>
        <AppBar position="static" sx={{ bgcolor: designSystem.colors.darkBg, boxShadow: 'none', borderBottom: `1px solid rgba(255, 255, 255, 0.1)` }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate('/dashboard')}
              sx={{ 
                mr: 2,
                color: designSystem.colors.textLight,
                '&:hover': { bgcolor: `${designSystem.colors.brandPrimary}25` }
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                color: designSystem.colors.textLight,
                fontFamily: designSystem.typography.fontFamily.display 
              }}
            >
              Quiz Mode Selection
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper 
            sx={{ 
              p: 4,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: designSystem.borderRadius.bento,
              boxShadow: designSystem.shadows.bento,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Group and Quiz Selection */}
            <Box mb={4}>
              <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
                Select Quiz
              </Typography>
              
              {/* Group Selection */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="group-select-label">Group</InputLabel>
                <Select
                  labelId="group-select-label"
                  id="group-select"
                  value={selectedGroupId}
                  label="Group"
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                >
                  <MenuItem value="all">All Groups</MenuItem>
                  {availableGroups.map(group => (
                    <MenuItem key={group._id} value={group._id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Quiz Selection */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="quiz-select-label">Quiz</InputLabel>
                <Select
                  labelId="quiz-select-label"
                  id="quiz-select"
                  value={selectedQuizId}
                  label="Quiz"
                  onChange={(e) => handleQuizSelection(e.target.value)}
                  disabled={availableQuizzes.filter(q => 
                    selectedGroupId === 'all' || q.group_id === selectedGroupId
                  ).length === 0}
                >
                  {availableQuizzes
                    .filter(q => selectedGroupId === 'all' || q.group_id === selectedGroupId)
                    .map(quiz => (
                      <MenuItem key={quiz._id} value={quiz._id}>
                        {quiz.title}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>

            {/* Quiz Details and Mode Selection - Only show if a quiz is selected */}
            {quiz && selectedQuizId && (
              <>
                <Typography variant="h4" gutterBottom align="center">
                  Choose Quiz Mode
                </Typography>
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    {quiz.title}
                  </Typography>
                  <Typography variant="body1" color="textSecondary" gutterBottom>
                    {quiz.description}
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                    {quiz.tags.map(tag => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Box>
                </Box>
            
                <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                  <Card sx={{ minWidth: 200 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Zen Mode
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Take your time, no pressure
                      </Typography>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleModeSelection('zen')}
                      >
                        Start Zen Quiz
                      </Button>
                    </CardContent>
                  </Card>

                  <Card sx={{ minWidth: 200 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Timed Mode
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Challenge yourself with time limits
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={1} mt={2}>
                        {[10, 20, 30].map(minutes => (
                          <Button
                            key={minutes}
                            variant="outlined"
                            onClick={() => handleModeSelection('timed', minutes)}
                          >
                            {minutes} minutes
                          </Button>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </>
            )}
          </Paper>
        </Container>
      </Box>
    )
  }

  if (showResults && attemptResult) {
    return (
      <Box sx={{ bgcolor: designSystem.colors.darkBg, minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Paper 
            sx={{ 
              p: 4,
              bgcolor: designSystem.colors.lightSurface,
              borderRadius: designSystem.borderRadius.bento,
              boxShadow: designSystem.shadows.bento,
            }}
          >
            <Typography 
              variant="h4" 
              gutterBottom 
              align="center"
              sx={{ 
                color: designSystem.colors.textDark,
                fontFamily: designSystem.typography.fontFamily.display,
                fontWeight: 700 
              }}
            >
              Quiz Complete!
            </Typography>
            <Box textAlign="center" mb={3}>
              <Typography 
                variant="h2" 
                sx={{ 
                  color: Math.round((attemptResult.score / attemptResult.max_points) * 100) >= 75 
                    ? designSystem.colors.accentGreen 
                    : Math.round((attemptResult.score / attemptResult.max_points) * 100) >= 60 
                    ? designSystem.colors.accentYellow 
                    : designSystem.colors.brandPrimary,
                  fontFamily: designSystem.typography.fontFamily.mono,
                  fontWeight: 800
                }}
              >
                {Math.round((attemptResult.score / attemptResult.max_points) * 100)}%
              </Typography>
              <Typography 
                variant="h6"
                sx={{ 
                  color: designSystem.colors.textDark,
                  fontFamily: designSystem.typography.fontFamily.mono 
                }}
              >
                {attemptResult.score} / {attemptResult.max_points} points
              </Typography>
            </Box>
            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="contained"
                onClick={() => navigate('/quiz/new')}
                sx={{
                  bgcolor: designSystem.colors.brandPrimary,
                  color: designSystem.colors.textLight,
                  borderRadius: designSystem.borderRadius.sm,
                  py: 1.5,
                  px: 3,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: designSystem.shadows.subtle,
                  '&:hover': {
                    bgcolor: designSystem.colors.brandHover,
                    boxShadow: designSystem.shadows.bento,
                  },
                }}
              >
                Take Another Quiz
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
                sx={{
                  borderColor: 'rgba(26, 26, 26, 0.2)',
                  color: designSystem.colors.textDark,
                  borderRadius: designSystem.borderRadius.sm,
                  py: 1.5,
                  px: 3,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: designSystem.colors.accentBlue,
                    bgcolor: `${designSystem.colors.accentBlue}15`,
                  },
                }}
              >
                Back to Dashboard
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <Box sx={{ bgcolor: designSystem.colors.darkBg, minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: designSystem.colors.darkBg, boxShadow: 'none', borderBottom: `1px solid rgba(255, 255, 255, 0.1)` }}>
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={() => navigate('/dashboard')}
            sx={{ 
              color: designSystem.colors.textLight,
              '&:hover': { bgcolor: `${designSystem.colors.brandPrimary}25` }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: designSystem.colors.textLight,
              fontFamily: designSystem.typography.fontFamily.display 
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

      <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
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

        <Paper 
          sx={{ 
            p: 4,
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: designSystem.borderRadius.bento,
            boxShadow: designSystem.shadows.bento,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box flex={1}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  color: designSystem.colors.textLight,
                  fontWeight: 600 
                }}
              >
                {currentQuestion.text}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontFamily: designSystem.typography.fontFamily.mono 
                }}
              >
                {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <IconButton 
              onClick={handleFlagQuestion}
              color={flaggedQuestions[currentQuestion._id] ? 'error' : 'default'}
              title={flaggedQuestions[currentQuestion._id] ? 'Unflag question' : 'Flag question for review'}
              sx={{
                color: flaggedQuestions[currentQuestion._id] 
                  ? designSystem.colors.brandPrimary 
                  : 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  bgcolor: flaggedQuestions[currentQuestion._id]
                    ? `${designSystem.colors.brandPrimary}25`
                    : 'rgba(255, 255, 255, 0.05)',
                }
              }}
            >
              {flaggedQuestions[currentQuestion._id] ? <Flag /> : <FlagOutlined />}
            </IconButton>
          </Box>

          {/* Render based on question type */}
          {currentQuestion.question_type === 'fill_blanks' ? (
            // Fill in the Blanks - Text Input
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Your Answer"
                variant="outlined"
                value={(answers[currentQuestion._id] as string) || ''}
                onChange={(e) => handleTextAnswerChange(currentQuestion._id, e.target.value)}
                placeholder="Type your answer here..."
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: designSystem.colors.textLight,
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: designSystem.colors.accentBlue },
                    '&.Mui-focused fieldset': { borderColor: designSystem.colors.brandPrimary },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
                }}
              />
            </Box>
          ) : currentQuestion.question_type === 'mcq_multiple' ? (
            // Multiple Choice (Multiple Answers) - Checkboxes
            <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
              <FormLabel 
                component="legend"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': { color: designSystem.colors.accentBlue }
                }}
              >
                Select all that apply
              </FormLabel>
              <Box sx={{ mt: 1 }}>
                {currentQuestion.choices.map(choice => (
                  <FormControlLabel
                    key={choice.id}
                    control={
                      <Checkbox
                        checked={((answers[currentQuestion._id] as string[]) || []).includes(choice.id)}
                        onChange={(e) => handleMultipleChoiceChange(currentQuestion._id, choice.id, e.target.checked)}
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          '&.Mui-checked': { color: designSystem.colors.accentGreen }
                        }}
                      />
                    }
                    label={choice.text}
                    sx={{ 
                      '& .MuiFormControlLabel-label': { 
                        color: designSystem.colors.textLight 
                      } 
                    }}
                  />
                ))}
              </Box>
            </FormControl>
          ) : (
            // Single Choice (MCQ Single, True/False) - Radio Buttons
            <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
              <RadioGroup
                value={(answers[currentQuestion._id] as string) || ''}
                onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
              >
                {currentQuestion.choices.map(choice => (
                  <FormControlLabel
                    key={choice.id}
                    value={choice.id}
                    control={
                      <Radio 
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          '&.Mui-checked': { color: designSystem.colors.accentBlue }
                        }}
                      />
                    }
                    label={choice.text}
                    sx={{ 
                      '& .MuiFormControlLabel-label': { 
                        color: designSystem.colors.textLight 
                      } 
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}
        </Paper>

        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button
            variant="outlined"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            startIcon={<ArrowBack />}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: designSystem.colors.textLight,
              borderRadius: designSystem.borderRadius.sm,
              py: 1.5,
              px: 3,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                borderColor: designSystem.colors.accentBlue,
                bgcolor: `${designSystem.colors.accentBlue}15`,
              },
              '&.Mui-disabled': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)',
              }
            }}
          >
            Previous
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmitClick}
              sx={{
                bgcolor: designSystem.colors.accentGreen,
                color: designSystem.colors.textDark,
                borderRadius: designSystem.borderRadius.sm,
                py: 1.5,
                px: 3,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: designSystem.shadows.subtle,
                '&:hover': {
                  bgcolor: '#5BC96B',
                  boxShadow: designSystem.shadows.bento,
                },
              }}
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={handleNextQuestion}
              sx={{
                bgcolor: designSystem.colors.brandPrimary,
                color: designSystem.colors.textLight,
                borderRadius: designSystem.borderRadius.sm,
                py: 1.5,
                px: 3,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: designSystem.shadows.subtle,
                '&:hover': {
                  bgcolor: designSystem.colors.brandHover,
                  boxShadow: designSystem.shadows.bento,
                },
              }}
            >
              Next
            </Button>
          )}
        </Box>

        {/* Flag Dialog */}
        <Dialog open={showFlagDialog} onClose={() => setShowFlagDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Flag Question for Review</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Please provide a reason why this question should be reviewed:
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              fullWidth
              multiline
              rows={3}
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="e.g., Question is unclear, answer choices are confusing, typo in question..."
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowFlagDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveFlag} variant="contained" color="warning">
              Flag Question
            </Button>
          </DialogActions>
        </Dialog>

        {/* Submit Confirmation Dialog */}
        <Dialog open={showSubmitConfirmation} onClose={() => setShowSubmitConfirmation(false)} maxWidth="md" fullWidth>
          <DialogTitle>Confirm Quiz Submission</DialogTitle>
          <DialogContent>
            {(() => {
              const unansweredQuestions = questions.filter(q => !answers[q._id] || 
                (Array.isArray(answers[q._id]) && (answers[q._id] as string[]).length === 0))
              const flaggedQuestionsList = questions.filter(q => flaggedQuestions[q._id])
              
              return (
                <Box>
                  {unansweredQuestions.length > 0 && (
                    <Box mb={3}>
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          You have {unansweredQuestions.length} unanswered question{unansweredQuestions.length !== 1 ? 's' : ''}
                        </Typography>
                      </Alert>
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        Unanswered Questions:
                      </Typography>
                      {unansweredQuestions.map((q, idx) => (
                        <Box key={q._id} sx={{ ml: 2, mb: 1 }}>
                          <Typography variant="body2">
                            {questions.indexOf(q) + 1}. {q.text.substring(0, 60)}
                            {q.text.length > 60 ? '...' : ''}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                  {flaggedQuestionsList.length > 0 && (
                    <Box>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          You have flagged {flaggedQuestionsList.length} question{flaggedQuestionsList.length !== 1 ? 's' : ''} for review
                        </Typography>
                      </Alert>
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        Flagged Questions:
                      </Typography>
                      {flaggedQuestionsList.map((q, idx) => (
                        <Box key={q._id} sx={{ ml: 2, mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {questions.indexOf(q) + 1}. {q.text.substring(0, 60)}
                            {q.text.length > 60 ? '...' : ''}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                            Reason: {flaggedQuestions[q._id]}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  <Typography variant="body1" sx={{ mt: 3 }}>
                    Are you sure you want to submit your quiz?
                  </Typography>
                </Box>
              )
            })()}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSubmitConfirmation(false)}>Go Back</Button>
            <Button onClick={handleConfirmedSubmit} variant="contained" color="primary">
              Submit Anyway
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}

export default QuizTaking
