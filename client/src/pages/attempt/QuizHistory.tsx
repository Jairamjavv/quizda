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
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
  Grid,
  Tooltip
} from '@mui/material'
import SandglassLoader from '../../components/SandglassLoader'
import {
  ArrowBack,
  Quiz,
  Timer,
  Schedule,
  Visibility
} from '@mui/icons-material'
import { useAuthV2 as useAuth } from '../../contexts/AuthContextV2'
import axios from 'axios'
import { designSystem } from '../../theme/designSystem'

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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ bgcolor: designSystem.colors.darkBg }}>
        <SandglassLoader size={80} color={designSystem.colors.brandPrimary} />
      </Box>
    )
  }

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
            sx={{ color: designSystem.colors.textLight }}
            onClick={() => navigate('/dashboard')}
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
            Quiz History
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {attempts.length === 0 ? (
          <Paper 
            sx={{ 
              p: 4,
              bgcolor: designSystem.colors.lightSurface,
              borderRadius: designSystem.borderRadius.bento,
              boxShadow: designSystem.shadows.bento,
            }}
          >
            <Box textAlign="center">
              <Quiz sx={{ fontSize: 64, color: designSystem.colors.textMuted, mb: 2 }} />
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ 
                  color: designSystem.colors.textDark,
                  fontWeight: 700,
                }}
              >
                No Quiz Attempts Yet
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ color: designSystem.colors.textMuted }}
                gutterBottom
              >
                Start taking quizzes to see your history and track your progress.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/quiz/new')}
                sx={{ 
                  mt: 2,
                  bgcolor: designSystem.colors.brandPrimary,
                  '&:hover': {
                    bgcolor: designSystem.colors.brandHover,
                  },
                }}
              >
                Take Your First Quiz
              </Button>
            </Box>
          </Paper>
        ) : (
          <>
            {/* Info Alert */}
            <Alert 
              severity="info" 
              sx={{ 
                mb: 3,
                bgcolor: 'rgba(75, 194, 245, 0.15)',
                border: `1px solid ${designSystem.colors.accentBlue}`,
                borderRadius: designSystem.borderRadius.sm,
                '& .MuiAlert-icon': {
                  color: designSystem.colors.accentBlue,
                },
              }}
            >
              <Typography 
                variant="body2"
                sx={{ color: designSystem.colors.textLight, fontWeight: 500 }}
              >
                💡 Click on any completed quiz row or use the "View Details" button to see:
              </Typography>
              <Typography 
                variant="caption" 
                component="div" 
                sx={{ mt: 1, ml: 2, color: 'rgba(255, 255, 255, 0.7)' }}
              >
                • Your answers vs. correct answers<br/>
                • Time spent on each question<br/>
                • Points breakdown with streak & speed bonuses<br/>
                • Overall performance summary
              </Typography>
            </Alert>

            {/* Summary Cards */}
            <Grid container spacing={3} mb={4}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    bgcolor: designSystem.colors.accentYellow,
                    color: designSystem.colors.textDark,
                    borderRadius: designSystem.borderRadius.bento,
                    boxShadow: designSystem.shadows.bento,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.02)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    },
                  }}
                >
                  <CardContent sx={{ p: designSystem.spacing.md }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: designSystem.borderRadius.sm,
                          bgcolor: 'rgba(26, 26, 26, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Quiz sx={{ fontSize: 28, color: designSystem.colors.textDark }} />
                      </Box>
                      <Box>
                        <Typography 
                          variant="body2" 
                          sx={{ opacity: 0.8, fontWeight: 500, mb: 0.5 }}
                        >
                          Total Attempts
                        </Typography>
                        <Typography 
                          variant="h3"
                          sx={{ 
                            fontWeight: 800,
                            fontFamily: designSystem.typography.fontFamily.mono,
                            fontSize: { xs: '2rem', sm: '2.5rem' },
                            lineHeight: 1.1,
                          }}
                        >
                          {attempts.length}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    bgcolor: designSystem.colors.accentBlue,
                    color: designSystem.colors.textDark,
                    borderRadius: designSystem.borderRadius.bento,
                    boxShadow: designSystem.shadows.bento,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.02)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    },
                  }}
                >
                  <CardContent sx={{ p: designSystem.spacing.md }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: designSystem.borderRadius.sm,
                          bgcolor: 'rgba(26, 26, 26, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Timer sx={{ fontSize: 28, color: designSystem.colors.textDark }} />
                      </Box>
                      <Box>
                        <Typography 
                          variant="body2" 
                          sx={{ opacity: 0.8, fontWeight: 500, mb: 0.5 }}
                        >
                          Completed
                        </Typography>
                        <Typography 
                          variant="h3"
                          sx={{ 
                            fontWeight: 800,
                            fontFamily: designSystem.typography.fontFamily.mono,
                            fontSize: { xs: '2rem', sm: '2.5rem' },
                            lineHeight: 1.1,
                          }}
                        >
                          {attempts.filter(a => a.completed_at).length}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    bgcolor: designSystem.colors.accentGreen,
                    color: designSystem.colors.textDark,
                    borderRadius: designSystem.borderRadius.bento,
                    boxShadow: designSystem.shadows.bento,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.02)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    },
                  }}
                >
                  <CardContent sx={{ p: designSystem.spacing.md }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: designSystem.borderRadius.sm,
                          bgcolor: 'rgba(26, 26, 26, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Schedule sx={{ fontSize: 28, color: designSystem.colors.textDark }} />
                      </Box>
                      <Box>
                        <Typography 
                          variant="body2" 
                          sx={{ opacity: 0.8, fontWeight: 500, mb: 0.5 }}
                        >
                          Avg Score
                        </Typography>
                        <Typography 
                          variant="h3"
                          sx={{ 
                            fontWeight: 800,
                            fontFamily: designSystem.typography.fontFamily.mono,
                            fontSize: { xs: '2rem', sm: '2.5rem' },
                            lineHeight: 1.1,
                          }}
                        >
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
                <Card
                  sx={{
                    bgcolor: designSystem.colors.brandPrimary,
                    color: designSystem.colors.textLight,
                    borderRadius: designSystem.borderRadius.bento,
                    boxShadow: designSystem.shadows.bento,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.02)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    },
                  }}
                >
                  <CardContent sx={{ p: designSystem.spacing.md }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: designSystem.borderRadius.sm,
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Quiz sx={{ fontSize: 28, color: designSystem.colors.textLight }} />
                      </Box>
                      <Box>
                        <Typography 
                          variant="body2" 
                          sx={{ opacity: 0.9, fontWeight: 500, mb: 0.5 }}
                        >
                          Best Score
                        </Typography>
                        <Typography 
                          variant="h3"
                          sx={{ 
                            fontWeight: 800,
                            fontFamily: designSystem.typography.fontFamily.mono,
                            fontSize: { xs: '2rem', sm: '2.5rem' },
                            lineHeight: 1.1,
                          }}
                        >
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
            <Paper
              sx={{
                background: 'linear-gradient(135deg, #121212 0%, #181818 100%)',
                borderRadius: designSystem.borderRadius.bento,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: designSystem.shadows.bento,
                overflow: 'hidden',
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <TableCell sx={{ color: designSystem.colors.textLight, fontWeight: 700 }}>Quiz</TableCell>
                      <TableCell sx={{ color: designSystem.colors.textLight, fontWeight: 700 }}>Mode</TableCell>
                      <TableCell sx={{ color: designSystem.colors.textLight, fontWeight: 700 }}>Date</TableCell>
                      <TableCell sx={{ color: designSystem.colors.textLight, fontWeight: 700 }}>Duration</TableCell>
                      <TableCell sx={{ color: designSystem.colors.textLight, fontWeight: 700 }}>Score</TableCell>
                      <TableCell sx={{ color: designSystem.colors.textLight, fontWeight: 700 }}>Tags</TableCell>
                      <TableCell sx={{ color: designSystem.colors.textLight, fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ color: designSystem.colors.textLight, fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attempts.map((attempt) => (
                      <TableRow 
                        key={attempt.id}
                        hover
                        sx={{ 
                          cursor: attempt.completed_at ? 'pointer' : 'default',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          transition: 'all 0.2s ease',
                          '&:hover': attempt.completed_at ? {
                            bgcolor: 'rgba(255, 255, 255, 0.08)',
                          } : {},
                        }}
                        onClick={() => {
                          if (attempt.completed_at) {
                            navigate(`/quiz/attempt/${attempt.id}`)
                          }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ color: designSystem.colors.textLight }}>
                            Quiz #{attempt.quiz_id.slice(-6)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={attempt.mode}
                            sx={{
                              bgcolor: attempt.mode === 'timed' 
                                ? designSystem.colors.accentBlue 
                                : designSystem.colors.accentGreen,
                              color: designSystem.colors.textDark,
                              fontWeight: 600,
                              fontSize: '12px',
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {formatDate(attempt.started_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {formatDuration(attempt.started_at, attempt.completed_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              color: (attempt.score / attempt.max_points) * 100 >= 80 
                                ? designSystem.colors.accentGreen
                                : (attempt.score / attempt.max_points) * 100 >= 60
                                ? designSystem.colors.accentYellow
                                : designSystem.colors.brandPrimary,
                              fontWeight: 700,
                              fontSize: '15px',
                            }}
                          >
                            {Math.round((attempt.score / attempt.max_points) * 100)}%
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.5)',
                              display: 'block',
                            }}
                          >
                            {attempt.score}/{attempt.max_points} pts
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            {attempt.tags_snapshot.slice(0, 3).map(tag => (
                              <Chip 
                                key={tag} 
                                label={tag} 
                                size="small" 
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                                  color: 'rgba(255, 255, 255, 0.8)',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  fontSize: '11px',
                                }}
                              />
                            ))}
                            {attempt.tags_snapshot.length > 3 && (
                              <Chip 
                                label={`+${attempt.tags_snapshot.length - 3}`} 
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  fontSize: '11px',
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={attempt.completed_at ? 'Completed' : 'Incomplete'}
                            sx={{
                              bgcolor: attempt.completed_at 
                                ? designSystem.colors.accentGreen 
                                : designSystem.colors.accentYellow,
                              color: designSystem.colors.textDark,
                              fontWeight: 600,
                              fontSize: '11px',
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {attempt.completed_at ? (
                            <Tooltip title="Click to view detailed breakdown">
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<Visibility />}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate(`/quiz/attempt/${attempt.id}`)
                                }}
                                sx={{ 
                                  whiteSpace: 'nowrap',
                                  bgcolor: designSystem.colors.accentBlue,
                                  color: designSystem.colors.textDark,
                                  fontWeight: 600,
                                  '&:hover': {
                                    bgcolor: designSystem.colors.accentBlue,
                                    filter: 'brightness(1.1)',
                                  },
                                }}
                              >
                                View Details
                              </Button>
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                              Not available
                            </Typography>
                          )}
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
