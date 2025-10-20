import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
  Grid
} from '@mui/material'
import {
  ArrowBack,
  Quiz,
  Timer,
  Schedule
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

interface Attempt {
  id: number
  quiz_id: string
  mode: 'timed' | 'zen'
  timed_duration_minutes?: number
  started_at: string
  completed_at?: string
  score: number
  max_points: number
  per_question_results: Array<{
    questionId: string
    chosenChoiceId: string
    correct: boolean
    pointsAwarded: number
  }>
  tags_snapshot: string[]
}

const QuizHistory: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAttempts()
  }, [])

  const fetchAttempts = async () => {
    try {
      const response = await axios.get('/dashboard/attempts')
      setAttempts(response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load quiz history')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (startedAt: string, completedAt?: string) => {
    if (!completedAt) return 'Incomplete'
    const start = new Date(startedAt)
    const end = new Date(completedAt)
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000)
    return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score: number, maxPoints: number) => {
    const percentage = (score / maxPoints) * 100
    if (percentage >= 80) return 'success'
    if (percentage >= 60) return 'warning'
    return 'error'
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
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Quiz History
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {attempts.length === 0 ? (
          <Paper sx={{ p: 4 }}>
            <Box textAlign="center">
              <Quiz sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No Quiz Attempts Yet
              </Typography>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                Start taking quizzes to see your history and track your progress.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/quiz/new')}
                sx={{ mt: 2 }}
              >
                Take Your First Quiz
              </Button>
            </Box>
          </Paper>
        ) : (
          <>
            {/* Summary Cards */}
            <Grid container spacing={3} mb={4}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Quiz color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Total Attempts
                        </Typography>
                        <Typography variant="h4">
                          {attempts.length}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Timer color="secondary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Completed
                        </Typography>
                        <Typography variant="h4">
                          {attempts.filter(a => a.completed_at).length}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Schedule color="success" sx={{ mr: 2 }} />
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Avg Score
                        </Typography>
                        <Typography variant="h4">
                          {attempts.length > 0 
                            ? Math.round(
                                attempts.reduce((sum, a) => sum + (a.score / a.max_points) * 100, 0) / attempts.length
                              )
                            : 0}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Quiz color="info" sx={{ mr: 2 }} />
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Best Score
                        </Typography>
                        <Typography variant="h4">
                          {attempts.length > 0 
                            ? Math.round(Math.max(...attempts.map(a => (a.score / a.max_points) * 100)))
                            : 0}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Attempts Table */}
            <Paper>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Quiz</TableCell>
                      <TableCell>Mode</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Tags</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell>
                          <Typography variant="body2">
                            Quiz #{attempt.quiz_id.slice(-6)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={attempt.mode}
                            color={attempt.mode === 'timed' ? 'primary' : 'secondary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(attempt.started_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDuration(attempt.started_at, attempt.completed_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color={`${getScoreColor(attempt.score, attempt.max_points)}.main`}
                            fontWeight="bold"
                          >
                            {Math.round((attempt.score / attempt.max_points) * 100)}%
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {attempt.score}/{attempt.max_points} pts
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            {attempt.tags_snapshot.slice(0, 3).map(tag => (
                              <Chip key={tag} label={tag} size="small" variant="outlined" />
                            ))}
                            {attempt.tags_snapshot.length > 3 && (
                              <Chip label={`+${attempt.tags_snapshot.length - 3}`} size="small" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={attempt.completed_at ? 'Completed' : 'Incomplete'}
                            color={attempt.completed_at ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Container>
    </Box>
  )
}

export default QuizHistory
