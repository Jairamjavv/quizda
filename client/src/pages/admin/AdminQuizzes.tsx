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
  VisibilityOff
} from '@mui/icons-material'
import { useAuthV2 as useAuth } from '../../contexts/AuthContextV2'
import ContentPreview from '../../components/ContentPreview'
import axios from 'axios'

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
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showQuestionDialog, setShowQuestionDialog] = useState(false)
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/admin')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {isEditing ? `Edit Quiz: ${currentQuiz?.title}` : 'Manage Quizzes'}
          </Typography>
          {!isEditing && (
            <Button
              color="inherit"
              startIcon={<Add />}
              onClick={() => setShowCreateDialog(true)}
            >
              New Quiz
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {isEditing ? (
          // Edit Quiz Form
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quiz Details
                </Typography>
                
                <TextField
                  fullWidth
                  label="Title"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                  sx={{ mb: 2 }}
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
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => openQuestionDialog()}
                  >
                    Add Question
                  </Button>
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
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => openQuestionDialog()}
                      sx={{ mt: 2 }}
                    >
                      Add First Question
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        ) : (
          // Quiz List
          <Paper>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                All Quizzes ({quizzes.length})
              </Typography>
            </Box>
            <List>
              {quizzes.map(quiz => (
                <ListItem key={quiz._id} divider>
                  <ListItemText
                    primary={quiz.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {quiz.description}
                        </Typography>
                        <Box display="flex" gap={1} mt={1}>
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
              ))}
              {quizzes.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No quizzes yet"
                    secondary="Create your first quiz to get started"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
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
      </Container>
    </Box>
  )
}

export default AdminQuizzes
