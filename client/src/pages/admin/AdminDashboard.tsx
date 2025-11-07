import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material'
import {
  Quiz,
  Group,
  Assessment,
  ExitToApp,
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff
} from '@mui/icons-material'
import { useAuthV2 as useAuth } from '../../contexts/AuthContextV2'
import axios from 'axios'
import { designSystem } from '../../theme/designSystem'

interface QuizSummary {
  _id: string
  title: string
  description: string
  is_published: boolean
  total_points: number
  tags: string[]
  created_at: string
  question_count?: number
}

interface GroupSummary {
  _id: string
  name: string
  description: string
  created_at: string
  quiz_count?: number
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([])
  const [groups, setGroups] = useState<GroupSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [quizzesResponse, groupsResponse] = await Promise.all([
        axios.get('/admin/quizzes'),
        axios.get('/admin/groups')
      ])
      setQuizzes(quizzesResponse.data)
      setGroups(groupsResponse.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const toggleQuizPublish = async (quizId: string, currentStatus: boolean) => {
    try {
      await axios.put(`/admin/quizzes/${quizId}`, {
        is_published: !currentStatus
      })
      setQuizzes(prev => prev.map(quiz => 
        quiz._id === quizId 
          ? { ...quiz, is_published: !currentStatus }
          : quiz
      ))
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update quiz')
    }
  }

  const deleteQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return
    
    try {
      await axios.delete(`/admin/quizzes/${quizId}`)
      setQuizzes(prev => prev.filter(quiz => quiz._id !== quizId))
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete quiz')
    }
  }

  const deleteGroup = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return
    
    try {
      await axios.delete(`/admin/groups/${groupId}`)
      setGroups(prev => prev.filter(group => group._id !== groupId))
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete group')
    }
  }

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh" 
        sx={{ 
          bgcolor: designSystem.colors.darkBg,
          '@keyframes fadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
          animation: 'fadeIn 300ms ease-in',
        }}
      >
        <CircularProgress 
          sx={{ 
            color: designSystem.colors.brandPrimary,
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.05)' },
            },
            animation: 'pulse 2s ease-in-out infinite',
          }} 
        />
      </Box>
    )
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: designSystem.colors.darkBg,
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        animation: 'fadeIn 400ms ease-in',
      }}
    >
      {/* AppBar */}
      <AppBar 
        position="static" 
        sx={{ 
          bgcolor: designSystem.colors.darkBg, 
          color: designSystem.colors.textLight, 
          boxShadow: 'none', 
          borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
          transition: designSystem.animations.transition.default,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              color: designSystem.colors.textLight,
              fontFamily: designSystem.typography.fontFamily.display,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
            }}
          >
            Quizda Admin Dashboard
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mr: 2, 
              color: 'rgba(255, 255, 255, 0.7)',
              display: { xs: 'none', sm: 'block' },
              fontSize: { sm: '0.9rem', md: '1rem' },
            }}
          >
            Welcome, {user?.email}
          </Typography>
          <IconButton 
            onClick={handleLogout}
            sx={{
              color: designSystem.colors.textLight,
              transition: designSystem.animations.transition.default,
              '&:hover': {
                bgcolor: `${designSystem.colors.brandPrimary}25`,
                transform: 'scale(1.05)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
            }}
          >
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container 
        maxWidth="xl" 
        sx={{ 
          mt: { xs: 3, sm: 4 }, 
          mb: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: designSystem.borderRadius.md,
              bgcolor: `${designSystem.colors.brandPrimary}15`,
              color: designSystem.colors.brandPrimary,
              border: `1px solid ${designSystem.colors.brandPrimary}`,
              transition: designSystem.animations.transition.default,
              '@keyframes slideDown': {
                from: { transform: 'translateY(-20px)', opacity: 0 },
                to: { transform: 'translateY(0)', opacity: 1 },
              },
              animation: 'slideDown 300ms ease-out',
            }}
          >
            {error}
          </Alert>
        )}

        {/* Bento Box Grid Layout */}
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(6, 1fr)',
              md: 'repeat(12, 1fr)',
            },
            gap: { xs: 2, sm: 3 },
            gridAutoRows: 'minmax(120px, auto)',
            '@keyframes staggerIn': {
              from: { transform: 'scale(0.95)', opacity: 0 },
              to: { transform: 'scale(1)', opacity: 1 },
            },
          }}
        >
          {/* Total Quizzes Card - Brand Primary */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 3' },
              borderRadius: designSystem.borderRadius.bento,
              background: designSystem.colors.brandPrimary,
              color: designSystem.colors.textLight,
              boxShadow: designSystem.shadows.bento,
              border: 'none',
              transition: designSystem.animations.transition.default,
              animation: 'staggerIn 500ms ease-out 100ms backwards',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-4px) scale(1.02)',
                boxShadow: designSystem.shadows.hover,
              },
              '&:active': {
                transform: 'translateY(-2px) scale(1)',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: designSystem.spacing.md } }}>
              <Box 
                sx={{ 
                  width: { xs: 48, sm: 56 }, 
                  height: { xs: 48, sm: 56 }, 
                  borderRadius: designSystem.borderRadius.sm,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  transition: designSystem.animations.transition.default,
                  '&:hover': {
                    transform: 'rotate(10deg)',
                  },
                }}
              >
                <Quiz sx={{ fontSize: { xs: 24, sm: 28 }, color: designSystem.colors.textLight }} />
              </Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 0.5,
                  fontFamily: designSystem.typography.fontFamily.mono,
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                }}
              >
                {quizzes.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Quizzes
              </Typography>
            </CardContent>
          </Card>

          {/* Published Card - Accent Green */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
              borderRadius: designSystem.borderRadius.bento,
              background: designSystem.colors.accentGreen,
              color: designSystem.colors.textDark,
              boxShadow: designSystem.shadows.bento,
              border: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: designSystem.shadows.hover,
              },
            }}
          >
            <CardContent sx={{ p: designSystem.spacing.md }}>
              <Box 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: designSystem.borderRadius.sm,
                  bgcolor: 'rgba(26, 26, 26, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Visibility sx={{ fontSize: 28, color: designSystem.colors.textDark }} />
              </Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 0.5,
                  fontFamily: designSystem.typography.fontFamily.mono 
                }}
              >
                {quizzes.filter(q => q.is_published).length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Published
              </Typography>
            </CardContent>
          </Card>

          {/* Drafts Card - Accent Yellow */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
              borderRadius: designSystem.borderRadius.bento,
              background: designSystem.colors.accentYellow,
              color: designSystem.colors.textDark,
              boxShadow: designSystem.shadows.bento,
              border: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: designSystem.shadows.hover,
              },
            }}
          >
            <CardContent sx={{ p: designSystem.spacing.md }}>
              <Box 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: designSystem.borderRadius.sm,
                  bgcolor: 'rgba(26, 26, 26, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <VisibilityOff sx={{ fontSize: 28, color: designSystem.colors.textDark }} />
              </Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 0.5,
                  fontFamily: designSystem.typography.fontFamily.mono 
                }}
              >
                {quizzes.filter(q => !q.is_published).length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Drafts
              </Typography>
            </CardContent>
          </Card>

          {/* Groups Card - Accent Blue */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
              borderRadius: designSystem.borderRadius.bento,
              background: designSystem.colors.accentBlue,
              color: designSystem.colors.textDark,
              boxShadow: designSystem.shadows.bento,
              border: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: designSystem.shadows.hover,
              },
            }}
          >
            <CardContent sx={{ p: designSystem.spacing.md }}>
              <Box 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: designSystem.borderRadius.sm,
                  bgcolor: 'rgba(26, 26, 26, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Group sx={{ fontSize: 28, color: designSystem.colors.textDark }} />
              </Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 0.5,
                  fontFamily: designSystem.typography.fontFamily.mono 
                }}
              >
                {groups.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Groups
              </Typography>
            </CardContent>
          </Card>

          {/* Quick Actions Card - Light Surface */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
              borderRadius: designSystem.borderRadius.bento,
              border: 'none',
              boxShadow: designSystem.shadows.bento,
              bgcolor: designSystem.colors.lightSurface,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: designSystem.shadows.hover,
              },
            }}
          >
            <CardContent sx={{ p: designSystem.spacing.md }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 3, 
                  color: designSystem.colors.textDark,
                  fontFamily: designSystem.typography.fontFamily.display 
                }}
              >
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/admin/quizzes')}
                  fullWidth
                  sx={{
                    bgcolor: designSystem.colors.brandPrimary,
                    color: designSystem.colors.textLight,
                    borderRadius: designSystem.borderRadius.sm,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: designSystem.shadows.subtle,
                    '&:hover': {
                      bgcolor: designSystem.colors.brandHover,
                      transform: 'translateY(-2px)',
                      boxShadow: designSystem.shadows.bento,
                    },
                  }}
                >
                  Create New Quiz
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => navigate('/admin/groups')}
                  fullWidth
                  sx={{
                    borderColor: 'rgba(26, 26, 26, 0.2)',
                    color: designSystem.colors.textDark,
                    borderRadius: designSystem.borderRadius.sm,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: designSystem.colors.accentBlue,
                      bgcolor: `${designSystem.colors.accentBlue}15`,
                    },
                  }}
                >
                  Create New Group
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Recent Quizzes - Dark Card */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 12', md: 'span 9' },
              borderRadius: designSystem.borderRadius.bento,
              border: 'none',
              boxShadow: designSystem.shadows.bento,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardContent sx={{ p: designSystem.spacing.md }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    color: designSystem.colors.textLight,
                    fontFamily: designSystem.typography.fontFamily.display 
                  }}
                >
                  Recent Quizzes
                </Typography>
                <Button
                  variant="text"
                  onClick={() => navigate('/admin/quizzes')}
                  sx={{
                    color: designSystem.colors.accentBlue,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: designSystem.borderRadius.sm,
                    '&:hover': {
                      bgcolor: `${designSystem.colors.accentBlue}15`,
                    },
                  }}
                >
                  View All →
                </Button>
              </Box>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {quizzes.slice(0, 5).map(quiz => (
                  <ListItem 
                    key={quiz._id} 
                    divider
                    sx={{
                      borderRadius: designSystem.borderRadius.sm,
                      mb: 1,
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={600} color={designSystem.colors.textLight}>
                          {quiz.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="rgba(255, 255, 255, 0.6)" sx={{ mb: 1 }}>
                            {quiz.description}
                          </Typography>
                          <Box display="flex" gap={1}>
                            <Chip
                              label={quiz.is_published ? 'Published' : 'Draft'}
                              sx={{
                                bgcolor: quiz.is_published 
                                  ? designSystem.colors.accentGreen 
                                  : designSystem.colors.accentYellow,
                                color: designSystem.colors.textDark,
                                fontWeight: 600,
                                fontSize: '11px',
                                height: '24px',
                                border: 'none',
                              }}
                              size="small"
                            />
                            <Chip
                              label={`${quiz.total_points} pts`}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                color: 'rgba(255, 255, 255, 0.6)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                fontSize: '11px',
                                height: '24px',
                                fontFamily: designSystem.typography.fontFamily.mono,
                              }}
                            />
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => toggleQuizPublish(quiz._id, quiz.is_published)}
                          sx={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            '&:hover': {
                              bgcolor: `${designSystem.colors.accentGreen}25`,
                              color: designSystem.colors.accentGreen,
                            },
                          }}
                        >
                          {quiz.is_published ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin/quizzes/${quiz._id}`)}
                          sx={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            '&:hover': {
                              bgcolor: `${designSystem.colors.accentBlue}25`,
                              color: designSystem.colors.accentBlue,
                            },
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteQuiz(quiz._id)}
                          sx={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            '&:hover': {
                              bgcolor: `${designSystem.colors.brandPrimary}25`,
                              color: designSystem.colors.brandPrimary,
                            },
                          }}
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
                      primary={
                        <Typography color="rgba(255, 255, 255, 0.5)">No quizzes yet</Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="#999">
                          Create your first quiz to get started
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Recent Groups - Light Surface Card */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 12', md: 'span 6' },
              borderRadius: designSystem.borderRadius.bento,
              border: 'none',
              boxShadow: designSystem.shadows.bento,
              bgcolor: designSystem.colors.lightSurface,
            }}
          >
            <CardContent sx={{ p: designSystem.spacing.md }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    color: designSystem.colors.textDark,
                    fontFamily: designSystem.typography.fontFamily.display 
                  }}
                >
                  Recent Groups
                </Typography>
                <Button
                  variant="text"
                  onClick={() => navigate('/admin/groups')}
                  sx={{
                    color: designSystem.colors.accentBlue,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: designSystem.borderRadius.sm,
                    '&:hover': {
                      bgcolor: `${designSystem.colors.accentBlue}15`,
                    },
                  }}
                >
                  View All →
                </Button>
              </Box>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {groups.slice(0, 5).map(group => (
                  <ListItem 
                    key={group._id} 
                    divider
                    sx={{
                      borderRadius: designSystem.borderRadius.sm,
                      mb: 1,
                      borderColor: 'rgba(26, 26, 26, 0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(26, 26, 26, 0.03)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={600} color={designSystem.colors.textDark}>
                          {group.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="rgba(26, 26, 26, 0.6)">
                          {group.description}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin/groups/${group._id}`)}
                          sx={{
                            color: 'rgba(26, 26, 26, 0.5)',
                            '&:hover': {
                              bgcolor: `${designSystem.colors.accentBlue}25`,
                              color: designSystem.colors.accentBlue,
                            },
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteGroup(group._id)}
                          sx={{
                            color: 'rgba(26, 26, 26, 0.5)',
                            '&:hover': {
                              bgcolor: `${designSystem.colors.brandPrimary}25`,
                              color: designSystem.colors.brandPrimary,
                            },
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {groups.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography color="rgba(26, 26, 26, 0.5)">No groups yet</Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="rgba(26, 26, 26, 0.4)">
                          Create your first group to organize quizzes
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  )
}

export default AdminDashboard
