import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Radio,
  RadioGroup,
  FormLabel,
  Tabs,
  Tab
} from '@mui/material'
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  ExpandMore,
  Quiz,
  QuestionAnswer,
  Visibility,
  VisibilityOff,
  Upload,
  Download
} from '@mui/icons-material'
import { useAuthV2 as useAuth } from '../../contexts/AuthContextV2'
import ContentPreview from '../../components/ContentPreview'
import axios from 'axios'
import { designSystem } from '../../theme/designSystem'

type QuestionType = 'mcq_single' | 'mcq_multiple' | 'true_false' | 'fill_blanks';
type ContentType = 'text' | 'markdown' | 'latex';

interface Quiz {
  _id: string
  title: string
  description: string
  group_id?: string
  total_points: number
  tags: string[]
  created_by: number
  is_published: boolean
  created_at: string
  updated_at: string
}

interface Question {
  _id: string
  quiz_id: string
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

interface Group {
  _id: string
  name: string
  description: string
}

const AdminQuizzes: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showQuestionDialog, setShowQuestionDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  // Form states
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    group_id: '',
    total_points: 0,
    tags: [] as string[],
    is_published: false
  })

  const [questionForm, setQuestionForm] = useState({
    text: '',
    points: 1,
    tags: [] as string[],
    question_type: 'mcq_single' as QuestionType,
    content_type: 'text' as ContentType,
    correct_answers: [] as string[],
    choices: [
      { id: '1', text: '', is_correct: false },
      { id: '2', text: '', is_correct: false },
      { id: '3', text: '', is_correct: false },
      { id: '4', text: '', is_correct: false }
    ]
  })

  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (isEditing && id) {
      fetchQuizDetails(id)
    }
  }, [isEditing, id])

  const fetchData = async () => {
    try {
      const [quizzesResponse, groupsResponse] = await Promise.all([
        axios.get('/admin/quizzes'),
        axios.get('/admin/groups')
      ])
      setQuizzes(quizzesResponse.data)
      setGroups(groupsResponse.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchQuizDetails = async (quizId: string) => {
    try {
      const [quizResponse, questionsResponse] = await Promise.all([
        axios.get(`/admin/quizzes/${quizId}`),
        axios.get(`/admin/questions/${quizId}`)
      ])
      setCurrentQuiz(quizResponse.data)
      setQuestions(questionsResponse.data.sort((a: Question, b: Question) => a.order - b.order))
      
      // Populate form
      setQuizForm({
        title: quizResponse.data.title,
        description: quizResponse.data.description,
        group_id: quizResponse.data.group_id || '',
        total_points: quizResponse.data.total_points,
        tags: quizResponse.data.tags,
        is_published: quizResponse.data.is_published
      })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load quiz details')
    }
  }

  const handleCreateQuiz = async () => {
    try {
      const response = await axios.post('/admin/quizzes', {
        ...quizForm,
        created_by: user?.id
      })
      setQuizzes(prev => [...prev, response.data])
      setShowCreateDialog(false)
      resetQuizForm()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create quiz')
    }
  }

  const handleUpdateQuiz = async () => {
    if (!currentQuiz) return
    
    try {
      const response = await axios.put(`/admin/quizzes/${currentQuiz._id}`, quizForm)
      setCurrentQuiz(response.data)
      setQuizzes(prev => prev.map(q => q._id === currentQuiz._id ? response.data : q))
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update quiz')
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This will also delete all questions.')) return
    
    try {
      await axios.delete(`/admin/quizzes/${quizId}`)
      setQuizzes(prev => prev.filter(q => q._id !== quizId))
      if (currentQuiz?._id === quizId) {
        navigate('/admin/quizzes')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete quiz')
    }
  }

  const handleCreateQuestion = async () => {
    if (!currentQuiz) return
    
    try {
      const response = await axios.post('/admin/questions', {
        ...questionForm,
        quiz_id: currentQuiz._id,
        order: questions.length + 1
      })
      setQuestions(prev => [...prev, response.data])
      setShowQuestionDialog(false)
      resetQuestionForm()
      
      // Update quiz total points
      const newTotalPoints = currentQuiz.total_points + questionForm.points
      setQuizForm(prev => ({ ...prev, total_points: newTotalPoints }))
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create question')
    }
  }

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return
    
    try {
      const response = await axios.put(`/admin/questions/${editingQuestion._id}`, questionForm)
      setQuestions(prev => prev.map(q => q._id === editingQuestion._id ? response.data : q))
      setShowQuestionDialog(false)
      setEditingQuestion(null)
      resetQuestionForm()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update question')
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return
    
    try {
      await axios.delete(`/admin/questions/${questionId}`)
      setQuestions(prev => prev.filter(q => q._id !== questionId))
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete question')
    }
  }

  const addTag = () => {
    if (newTag.trim() && !quizForm.tags.includes(newTag.trim())) {
      setQuizForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setQuizForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const resetQuizForm = () => {
    setQuizForm({
      title: '',
      description: '',
      group_id: '',
      total_points: 0,
      tags: [],
      is_published: false
    })
  }

  const resetQuestionForm = () => {
    setQuestionForm({
      text: '',
      points: 1,
      tags: [],
      question_type: 'mcq_single' as QuestionType,
      content_type: 'text' as ContentType,
      correct_answers: [],
      choices: [
        { id: '1', text: '', is_correct: false },
        { id: '2', text: '', is_correct: false },
        { id: '3', text: '', is_correct: false },
        { id: '4', text: '', is_correct: false }
      ]
    })
  }

  const openQuestionDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question)
      setQuestionForm({
        text: question.text,
        points: question.points,
        tags: question.tags,
        question_type: question.question_type || 'mcq_single',
        content_type: question.content_type || 'text',
        correct_answers: question.correct_answers || [],
        choices: question.choices
      })
    } else {
      setEditingQuestion(null)
      resetQuestionForm()
    }
    setShowQuestionDialog(true)
  }

  const downloadTemplate = () => {
    const template = [
      {
        question_type: "mcq_single",
        content_type: "text",
        question_text: "What is 2 + 2?",
        points: 1,
        tags: ["math", "basic"],
        choices: [
          { text: "3", is_correct: false },
          { text: "4", is_correct: true },
          { text: "5", is_correct: false },
          { text: "6", is_correct: false }
        ]
      },
      {
        question_type: "mcq_multiple",
        content_type: "text",
        question_text: "Select all prime numbers",
        points: 2,
        tags: ["math", "prime"],
        choices: [
          { text: "2", is_correct: true },
          { text: "3", is_correct: true },
          { text: "4", is_correct: false },
          { text: "5", is_correct: true }
        ]
      },
      {
        question_type: "true_false",
        content_type: "text",
        question_text: "The Earth is flat",
        points: 1,
        tags: ["science"],
        choices: [
          { text: "True", is_correct: false },
          { text: "False", is_correct: true }
        ]
      },
      {
        question_type: "fill_blanks",
        content_type: "text",
        question_text: "The capital of France is ____",
        points: 1,
        tags: ["geography"],
        correct_answers: ["Paris", "paris"]
      }
    ]

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'quiz_questions_template.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const validateQuestionJSON = (data: any[]): string | null => {
    if (!Array.isArray(data)) {
      return 'JSON must be an array of questions'
    }

    const validQuestionTypes = ['mcq_single', 'mcq_multiple', 'true_false', 'fill_blanks']
    const validContentTypes = ['text']

    for (let i = 0; i < data.length; i++) {
      const q = data[i]
      
      // Check required fields
      if (!q.question_type || !validQuestionTypes.includes(q.question_type)) {
        return `Question ${i + 1}: Invalid or missing question_type. Must be one of: ${validQuestionTypes.join(', ')}`
      }

      if (!q.content_type || !validContentTypes.includes(q.content_type)) {
        return `Question ${i + 1}: Invalid or missing content_type. Currently only 'text' is supported`
      }

      if (!q.question_text || typeof q.question_text !== 'string') {
        return `Question ${i + 1}: Missing or invalid question_text`
      }

      if (typeof q.points !== 'number' || q.points <= 0) {
        return `Question ${i + 1}: Points must be a positive number`
      }

      // Validate based on question type
      if (q.question_type === 'fill_blanks') {
        if (!q.correct_answers || !Array.isArray(q.correct_answers) || q.correct_answers.length === 0) {
          return `Question ${i + 1}: Fill in the blanks questions must have correct_answers array`
        }
      } else {
        // MCQ and True/False need choices
        if (!q.choices || !Array.isArray(q.choices) || q.choices.length === 0) {
          return `Question ${i + 1}: Must have choices array`
        }

        let correctCount = 0
        for (let j = 0; j < q.choices.length; j++) {
          const choice = q.choices[j]
          if (!choice.text || typeof choice.text !== 'string') {
            return `Question ${i + 1}, Choice ${j + 1}: Missing or invalid text`
          }
          if (typeof choice.is_correct !== 'boolean') {
            return `Question ${i + 1}, Choice ${j + 1}: is_correct must be a boolean`
          }
          if (choice.is_correct) correctCount++
        }

        if (q.question_type === 'mcq_single' && correctCount !== 1) {
          return `Question ${i + 1}: Single answer MCQ must have exactly one correct answer`
        }

        if (q.question_type === 'mcq_multiple' && correctCount < 1) {
          return `Question ${i + 1}: Multiple answer MCQ must have at least one correct answer`
        }

        if (q.question_type === 'true_false' && (q.choices.length !== 2 || correctCount !== 1)) {
          return `Question ${i + 1}: True/False must have exactly 2 choices with one correct`
        }
      }
    }

    return null
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadError('')

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      // Validate the JSON structure
      const validationError = validateQuestionJSON(data)
      if (validationError) {
        setUploadError(validationError)
        return
      }

      // Convert to Question format and upload to backend
      if (!currentQuiz) {
        setUploadError('No quiz selected')
        return
      }

      const uploadedQuestions: Question[] = []
      
      for (let i = 0; i < data.length; i++) {
        const q = data[i]
        const questionData = {
          quiz_id: currentQuiz._id,
          text: q.question_text,
          points: q.points,
          tags: q.tags || [],
          order: questions.length + i + 1,
          question_type: q.question_type,
          content_type: q.content_type,
          correct_answers: q.correct_answers || [],
          choices: q.question_type === 'fill_blanks' 
            ? [] 
            : q.choices.map((c: any, idx: number) => ({
                id: String(idx + 1),
                text: c.text,
                is_correct: c.is_correct
              }))
        }

        const response = await axios.post('/admin/questions', questionData)
        uploadedQuestions.push(response.data)
      }

      // Update state
      setQuestions(prev => [...prev, ...uploadedQuestions])
      
      // Update quiz total points
      const addedPoints = data.reduce((sum: number, q: any) => sum + q.points, 0)
      setQuizForm(prev => ({ ...prev, total_points: prev.total_points + addedPoints }))

      setShowUploadDialog(false)
      setError('')
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        setUploadError('Invalid JSON format')
      } else {
        setUploadError(err.response?.data?.error || err.message || 'Failed to upload questions')
      }
    }

    // Reset the file input
    event.target.value = ''
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ bgcolor: designSystem.colors.darkBg }}>
        <CircularProgress sx={{ color: designSystem.colors.brandPrimary }} />
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: designSystem.colors.darkBg, minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: designSystem.colors.darkBg, boxShadow: 'none', borderBottom: `1px solid rgba(255, 255, 255, 0.1)` }}>
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={() => navigate('/admin')}
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
            {isEditing ? `Edit Quiz: ${currentQuiz?.title}` : 'Manage Quizzes'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: designSystem.borderRadius.md,
              bgcolor: `${designSystem.colors.brandPrimary}15`,
              color: designSystem.colors.brandPrimary,
              border: `1px solid ${designSystem.colors.brandPrimary}`,
            }}
          >
            {error}
          </Alert>
        )}

        {isEditing ? (
          // Edit Quiz Form
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper 
                sx={{ 
                  p: designSystem.spacing.md,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: designSystem.borderRadius.bento,
                  boxShadow: designSystem.shadows.bento,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    color: designSystem.colors.textLight,
                    fontFamily: designSystem.typography.fontFamily.display 
                  }}
                >
                  Quiz Details
                </Typography>
                
                <TextField
                  fullWidth
                  label="Title"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      color: designSystem.colors.textLight,
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '&:hover fieldset': { borderColor: designSystem.colors.accentBlue },
                      '&.Mui-focused fieldset': { borderColor: designSystem.colors.brandPrimary },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
                  }}
                />
                
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={quizForm.description}
                  onChange={(e) => setQuizForm(prev => ({ ...prev, description: e.target.value }))}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      color: designSystem.colors.textLight,
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '&:hover fieldset': { borderColor: designSystem.colors.accentBlue },
                      '&.Mui-focused fieldset': { borderColor: designSystem.colors.brandPrimary },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
                  }}
                />
                
                <FormControl 
                  fullWidth 
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      color: designSystem.colors.textLight,
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '&:hover fieldset': { borderColor: designSystem.colors.accentBlue },
                      '&.Mui-focused fieldset': { borderColor: designSystem.colors.brandPrimary },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
                  }}
                >
                  <InputLabel>Group</InputLabel>
                  <Select
                    value={quizForm.group_id}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, group_id: e.target.value }))}
                  >
                    <MenuItem value="">No Group</MenuItem>
                    {groups.map(group => (
                      <MenuItem key={group._id} value={group._id}>
                        {group.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                    {quizForm.tags.map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => removeTag(tag)}
                        color="primary"
                        size="small"
                      />
                    ))}
                  </Box>
                  <Box display="flex" gap={1}>
                    <TextField
                      size="small"
                      placeholder="Add tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag} disabled={!newTag.trim()}>
                      Add
                    </Button>
                  </Box>
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={quizForm.is_published}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, is_published: e.target.checked }))}
                    />
                  }
                  label="Published"
                />
                
                <Box display="flex" gap={2} mt={3}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleUpdateQuiz}
                  >
                    Save Quiz
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => navigate('/admin/quizzes')}
                  >
                    Cancel
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quiz Stats
                </Typography>
                <Box mb={2}>
                  <Typography color="textSecondary">Total Points</Typography>
                  <Typography variant="h4">{quizForm.total_points}</Typography>
                </Box>
                <Box mb={2}>
                  <Typography color="textSecondary">Questions</Typography>
                  <Typography variant="h4">{questions.length}</Typography>
                </Box>
                <Box mb={2}>
                  <Typography color="textSecondary">Status</Typography>
                  <Chip
                    label={quizForm.is_published ? 'Published' : 'Draft'}
                    color={quizForm.is_published ? 'success' : 'warning'}
                  />
                </Box>
              </Paper>
            </Grid>
            
            {/* Questions Section */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Questions ({questions.length})
                  </Typography>
                  <Box display="flex" gap={2}>
                    <Button
                      variant="outlined"
                      startIcon={<Upload />}
                      onClick={() => setShowUploadDialog(true)}
                      sx={{
                        borderColor: '#FF7A00',
                        color: '#FF7A00',
                        '&:hover': {
                          borderColor: '#FF7A00',
                          backgroundColor: 'rgba(255, 122, 0, 0.1)'
                        }
                      }}
                    >
                      Upload Questions
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => openQuestionDialog()}
                    >
                      Add Question
                    </Button>
                  </Box>
                </Box>
                
                {questions.map((question, index) => (
                  <Accordion key={question._id}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box display="flex" alignItems="center" width="100%">
                        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                          Q{index + 1}: {question.text}
                        </Typography>
                        <Box display="flex" gap={1} mr={2}>
                          <Chip label={`${question.points} pts`} size="small" />
                          <Chip label={question.tags.join(', ')} size="small" variant="outlined" />
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          Choices:
                        </Typography>
                        {question.choices.map(choice => (
                          <Box key={choice.id} display="flex" alignItems="center" mb={1}>
                            <Typography variant="body2" sx={{ flexGrow: 1 }}>
                              {choice.text}
                            </Typography>
                            {choice.is_correct && (
                              <Chip label="Correct" color="success" size="small" />
                            )}
                          </Box>
                        ))}
                        <Box display="flex" gap={1} mt={2}>
                          <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => openQuestionDialog(question)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => handleDeleteQuestion(question._id)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
                
                {questions.length === 0 && (
                  <Box textAlign="center" py={4}>
                    <QuestionAnswer sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      No Questions Yet
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Add questions to make your quiz complete
                    </Typography>
                    <Box display="flex" gap={2} justifyContent="center" mt={2}>
                      <Button
                        variant="outlined"
                        startIcon={<Upload />}
                        onClick={() => setShowUploadDialog(true)}
                        sx={{
                          borderColor: '#FF7A00',
                          color: '#FF7A00',
                          '&:hover': {
                            borderColor: '#FF7A00',
                            backgroundColor: 'rgba(255, 122, 0, 0.1)'
                          }
                        }}
                      >
                        Upload from JSON
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => openQuestionDialog()}
                      >
                        Add First Question
                      </Button>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        ) : (
          // Quiz List
          <>
            {/* Filter and Create Section */}
            <Box 
              display="flex" 
              gap={2} 
              mb={3} 
              alignItems="center"
              sx={{
                p: 3,
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <FormControl sx={{ minWidth: 250 }}>
                <InputLabel>Filter by Group</InputLabel>
                <Select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  label="Filter by Group"
                >
                  <MenuItem value="">
                    <em>All Groups</em>
                  </MenuItem>
                  {groups.map(group => (
                    <MenuItem key={group._id} value={group._id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ flexGrow: 1 }} />
              
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowCreateDialog(true)}
                sx={{
                  backgroundColor: '#00B15E',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  '&:hover': {
                    backgroundColor: '#009950'
                  }
                }}
              >
                Create New Quiz
              </Button>
            </Box>

            <Paper>
              <Box p={3}>
                <Typography variant="h6" gutterBottom>
                  {selectedGroupId 
                    ? `${groups.find(g => g._id === selectedGroupId)?.name || 'Group'} Quizzes` 
                    : `All Quizzes (${quizzes.length})`
                  }
                </Typography>
              </Box>
            <List>
              {quizzes
                .filter(quiz => !selectedGroupId || quiz.group_id === selectedGroupId)
                .map(quiz => {
                  const quizGroup = quiz.group_id ? groups.find(g => g._id === quiz.group_id) : null
                  return (
                <ListItem key={quiz._id} divider>
                  <ListItemText
                    primary={quiz.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {quiz.description}
                        </Typography>
                        <Box display="flex" gap={1} mt={1}>
                          {quizGroup && (
                            <Chip
                              label={quizGroup.name}
                              size="small"
                              sx={{
                                backgroundColor: '#00B15E',
                                color: '#FFFFFF',
                                fontWeight: 600
                              }}
                            />
                          )}
                          <Chip
                            label={quiz.is_published ? 'Published' : 'Draft'}
                            color={quiz.is_published ? 'success' : 'warning'}
                            size="small"
                          />
                          <Chip
                            label={`${quiz.total_points} pts`}
                            size="small"
                            variant="outlined"
                          />
                          {quiz.tags.map(tag => (
                            <Chip key={tag} label={tag} size="small" />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/quizzes/${quiz._id}`)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              )})}
              {quizzes.filter(quiz => !selectedGroupId || quiz.group_id === selectedGroupId).length === 0 && (
                <ListItem>
                  <ListItemText
                    primary={selectedGroupId ? "No quizzes in this group" : "No quizzes yet"}
                    secondary={selectedGroupId ? "Try selecting a different group or create a new quiz" : "Create your first quiz to get started"}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
          </>
        )}

        {/* Create Quiz Dialog */}
        <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New Quiz</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              value={quizForm.title}
              onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={quizForm.description}
              onChange={(e) => setQuizForm(prev => ({ ...prev, description: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Group</InputLabel>
              <Select
                value={quizForm.group_id}
                onChange={(e) => setQuizForm(prev => ({ ...prev, group_id: e.target.value }))}
              >
                <MenuItem value="">No Group</MenuItem>
                {groups.map(group => (
                  <MenuItem key={group._id} value={group._id}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={quizForm.is_published}
                  onChange={(e) => setQuizForm(prev => ({ ...prev, is_published: e.target.checked }))}
                />
              }
              label="Published"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateQuiz} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>

        {/* Question Dialog */}
        <Dialog open={showQuestionDialog} onClose={() => setShowQuestionDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </DialogTitle>
          <DialogContent>
            {/* Question Type Selection */}
            <FormControl component="fieldset" sx={{ mb: 3, mt: 1 }}>
              <FormLabel component="legend">Question Type</FormLabel>
              <RadioGroup
                row
                value={questionForm.question_type}
                onChange={(e) => {
                  const newType = e.target.value as QuestionType;
                  setQuestionForm(prev => ({
                    ...prev,
                    question_type: newType,
                    // Reset choices based on question type
                    choices: newType === 'true_false' 
                      ? [
                          { id: '1', text: 'True', is_correct: false },
                          { id: '2', text: 'False', is_correct: false }
                        ]
                      : newType === 'fill_blanks'
                      ? []
                      : [
                          { id: '1', text: '', is_correct: false },
                          { id: '2', text: '', is_correct: false },
                          { id: '3', text: '', is_correct: false },
                          { id: '4', text: '', is_correct: false }
                        ]
                  }))
                }}
              >
                <FormControlLabel value="mcq_single" control={<Radio />} label="MCQ (Single Answer)" />
                <FormControlLabel value="mcq_multiple" control={<Radio />} label="MCQ (Multiple Answers)" />
                <FormControlLabel value="true_false" control={<Radio />} label="True/False" />
                <FormControlLabel value="fill_blanks" control={<Radio />} label="Fill in the Blanks" />
              </RadioGroup>
            </FormControl>

            {/* Content Type Selection */}
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Content Format</FormLabel>
              <RadioGroup
                row
                value={questionForm.content_type}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, content_type: e.target.value as ContentType }))}
              >
                <FormControlLabel value="text" control={<Radio />} label="Plain Text" />
                <FormControlLabel value="markdown" control={<Radio />} label="Markdown (with Code)" />
                <FormControlLabel value="latex" control={<Radio />} label="LaTeX Math" />
              </RadioGroup>
            </FormControl>

            {/* Help text for content types */}
            <Alert severity="info" sx={{ mb: 2 }}>
              {questionForm.content_type === 'markdown' && 
                "Markdown: Use ```language for code blocks, **bold**, *italic*, etc."}
              {questionForm.content_type === 'latex' && 
                "LaTeX: Use $...$ for inline math, $$...$$ for display math. Example: $x^2 + y^2 = z^2$"}
              {questionForm.content_type === 'text' && 
                "Plain text mode - enter your question directly."}
            </Alert>

            <TextField
              fullWidth
              multiline
              rows={questionForm.content_type === 'text' ? 2 : 4}
              label="Question Text"
              value={questionForm.text}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, text: e.target.value }))}
              sx={{ mb: 2 }}
              placeholder={
                questionForm.content_type === 'markdown' 
                  ? "Enter markdown text with code: ```python\nprint('Hello')\n```"
                  : questionForm.content_type === 'latex'
                  ? "Enter text with LaTeX: What is $\\frac{a}{b}$ when $a=2$ and $b=4$?"
                  : "Enter your question here"
              }
            />

            {/* Preview Section */}
            {(questionForm.content_type === 'markdown' || questionForm.content_type === 'latex') && questionForm.text && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Preview:
                </Typography>
                <ContentPreview 
                  content={questionForm.text} 
                  contentType={questionForm.content_type} 
                />
              </Box>
            )}

            <TextField
              fullWidth
              type="number"
              label="Points"
              value={questionForm.points}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
              sx={{ mb: 2 }}
            />
            
            {/* Answer Choices based on question type */}
            {questionForm.question_type === 'fill_blanks' ? (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Correct Answers (comma-separated for multiple acceptable answers)
                </Typography>
                <TextField
                  fullWidth
                  label="Correct Answer(s)"
                  value={questionForm.correct_answers.join(', ')}
                  onChange={(e) => setQuestionForm(prev => ({
                    ...prev,
                    correct_answers: e.target.value.split(',').map(a => a.trim()).filter(a => a)
                  }))}
                  placeholder="e.g., answer1, answer2"
                  helperText="Enter one or more acceptable answers separated by commas"
                />
              </Box>
            ) : (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Answer Choices
                </Typography>
                {questionForm.choices.map((choice, index) => (
                  <Box key={choice.id} display="flex" alignItems="center" gap={1} mb={1}>
                    <TextField
                      fullWidth
                      label={questionForm.question_type === 'true_false' ? choice.text : `Choice ${index + 1}`}
                      value={choice.text}
                      onChange={(e) => {
                        const newChoices = [...questionForm.choices]
                        newChoices[index].text = e.target.value
                        setQuestionForm(prev => ({ ...prev, choices: newChoices }))
                      }}
                      disabled={questionForm.question_type === 'true_false'}
                    />
                    <FormControlLabel
                      control={
                        questionForm.question_type === 'mcq_multiple' ? (
                          <Switch
                            checked={choice.is_correct}
                            onChange={(e) => {
                              const newChoices = [...questionForm.choices]
                              newChoices[index].is_correct = e.target.checked
                              setQuestionForm(prev => ({ ...prev, choices: newChoices }))
                            }}
                          />
                        ) : (
                          <Switch
                            checked={choice.is_correct}
                            onChange={(e) => {
                              const newChoices = [...questionForm.choices]
                              // For single answer, ensure only one correct answer
                              newChoices.forEach(c => c.is_correct = false)
                              newChoices[index].is_correct = e.target.checked
                              setQuestionForm(prev => ({ ...prev, choices: newChoices }))
                            }}
                          />
                        )
                      }
                      label="Correct"
                    />
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowQuestionDialog(false)}>Cancel</Button>
            <Button 
              onClick={editingQuestion ? handleUpdateQuestion : handleCreateQuestion} 
              variant="contained"
            >
              {editingQuestion ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Upload Questions Dialog */}
        <Dialog 
          open={showUploadDialog} 
          onClose={() => {
            setShowUploadDialog(false)
            setUploadError('')
          }} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>Upload Questions from JSON</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
              Upload multiple questions at once using a JSON file. Download the template to see the required format.
            </Typography>

            {uploadError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {uploadError}
              </Alert>
            )}

            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={downloadTemplate}
                fullWidth
                sx={{
                  borderColor: '#00B15E',
                  color: '#00B15E',
                  '&:hover': {
                    borderColor: '#00B15E',
                    backgroundColor: 'rgba(0, 177, 94, 0.1)'
                  }
                }}
              >
                Download JSON Template
              </Button>

              <Button
                variant="contained"
                component="label"
                startIcon={<Upload />}
                fullWidth
                sx={{
                  backgroundColor: '#FF7A00',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: '#e66d00'
                  }
                }}
              >
                Upload JSON File
                <input
                  type="file"
                  accept=".json"
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>
            </Box>

            <Box mt={3} p={2} sx={{ backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Supported Question Types:
              </Typography>
              <Typography variant="body2" component="div">
                • MCQ (Single Answer): <code>mcq_single</code>
                <br />
                • MCQ (Multiple Answers): <code>mcq_multiple</code>
                <br />
                • True/False: <code>true_false</code>
                <br />
                • Fill in the Blanks: <code>fill_blanks</code>
              </Typography>
              <Typography variant="subtitle2" gutterBottom fontWeight={600} sx={{ mt: 2 }}>
                Content Format:
              </Typography>
              <Typography variant="body2">
                • Currently only plain text (<code>text</code>) is supported
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setShowUploadDialog(false)
                setUploadError('')
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}

export default AdminQuizzes
