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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F9F9F9' }}>
      {/* AppBar */}
      <AppBar position="static" sx={{ bgcolor: '#FFFFFF', color: '#121212', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              color: '#121212'
            }}
          >
            Quizda Admin Dashboard
          </Typography>
          <Typography variant="body1" sx={{ mr: 2, color: '#666' }}>
            Welcome, {user?.email}
          </Typography>
          <IconButton 
            onClick={handleLogout}
            sx={{
              color: '#121212',
              '&:hover': {
                bgcolor: 'rgba(0, 177, 94, 0.08)',
              }
            }}
          >
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {/* Bento Box Grid Layout */}
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 3,
            gridAutoRows: 'minmax(120px, auto)',
          }}
        >
          {/* Total Quizzes Card - Green */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
              borderRadius: 4,
              background: '#00B15E',
              color: 'white',
              boxShadow: '0 4px 16px rgba(0, 177, 94, 0.25)',
              border: '1px solid #00B15E',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 6px 20px rgba(0, 177, 94, 0.4)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Quiz sx={{ fontSize: 28, color: '#fff' }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                {quizzes.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Quizzes
              </Typography>
            </CardContent>
          </Card>

          {/* Published Card - Orange */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
              borderRadius: 4,
              background: '#FF7A00',
              color: 'white',
              boxShadow: '0 4px 16px rgba(255, 122, 0, 0.25)',
              border: '1px solid #FF7A00',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 6px 20px rgba(255, 122, 0, 0.4)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Visibility sx={{ fontSize: 28, color: '#fff' }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                {quizzes.filter(q => q.is_published).length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Published
              </Typography>
            </CardContent>
          </Card>

          {/* Drafts Card - Green */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
              borderRadius: 4,
              background: '#00B15E',
              color: 'white',
              boxShadow: '0 4px 16px rgba(0, 177, 94, 0.25)',
              border: '1px solid #00B15E',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 6px 20px rgba(0, 177, 94, 0.4)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <VisibilityOff sx={{ fontSize: 28, color: '#fff' }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                {quizzes.filter(q => !q.is_published).length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Drafts
              </Typography>
            </CardContent>
          </Card>

          {/* Groups Card - Orange */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
              borderRadius: 4,
              background: '#FF7A00',
              color: 'white',
              boxShadow: '0 4px 16px rgba(255, 122, 0, 0.25)',
              border: '1px solid #FF7A00',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 6px 20px rgba(255, 122, 0, 0.4)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Group sx={{ fontSize: 28, color: '#fff' }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                {groups.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Groups
              </Typography>
            </CardContent>
          </Card>

          {/* Quick Actions Card - Spans 3 columns */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
              borderRadius: 4,
              border: '1px solid #E0E0E0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              bgcolor: '#FFFFFF',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                borderColor: '#00B15E',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#121212' }}>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/admin/quizzes')}
                  fullWidth
                  sx={{
                    bgcolor: '#00B15E',
                    color: '#fff',
                    borderRadius: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(0, 177, 94, 0.3)',
                    '&:hover': {
                      bgcolor: '#009B50',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(0, 177, 94, 0.4)',
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
                    borderColor: '#E0E0E0',
                    color: '#121212',
                    borderRadius: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#00B15E',
                      bgcolor: 'rgba(0, 177, 94, 0.08)',
                    },
                  }}
                >
                  Create New Group
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Recent Quizzes - Spans 9 columns */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 12', md: 'span 9' },
              borderRadius: 4,
              border: '1px solid #E0E0E0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              bgcolor: '#FFFFFF',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#121212' }}>
                  Recent Quizzes
                </Typography>
                <Button
                  variant="text"
                  onClick={() => navigate('/admin/quizzes')}
                  sx={{
                    color: '#00B15E',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'rgba(0, 177, 94, 0.08)',
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
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': {
                        bgcolor: '#F9F9F9',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={600} color="#121212">
                          {quiz.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="#666" sx={{ mb: 1 }}>
                            {quiz.description}
                          </Typography>
                          <Box display="flex" gap={1}>
                            <Chip
                              label={quiz.is_published ? 'Published' : 'Draft'}
                              sx={{
                                bgcolor: quiz.is_published ? '#00B15E' : '#FF7A00',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '11px',
                                height: '24px',
                              }}
                              size="small"
                            />
                            <Chip
                              label={`${quiz.total_points} pts`}
                              size="small"
                              sx={{
                                bgcolor: '#F9F9F9',
                                color: '#666',
                                border: '1px solid #E0E0E0',
                                fontSize: '11px',
                                height: '24px',
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
                            color: '#666',
                            '&:hover': {
                              bgcolor: 'rgba(0, 177, 94, 0.08)',
                              color: '#00B15E',
                            },
                          }}
                        >
                          {quiz.is_published ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin/quizzes/${quiz._id}`)}
                          sx={{
                            color: '#666',
                            '&:hover': {
                              bgcolor: 'rgba(0, 177, 94, 0.08)',
                              color: '#00B15E',
                            },
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteQuiz(quiz._id)}
                          sx={{
                            color: '#666',
                            '&:hover': {
                              bgcolor: 'rgba(255, 122, 0, 0.08)',
                              color: '#FF7A00',
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
                        <Typography color="#666">No quizzes yet</Typography>
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

          {/* Recent Groups - Spans 6 columns */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 12', md: 'span 6' },
              borderRadius: 4,
              border: '1px solid #E0E0E0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              bgcolor: '#FFFFFF',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#121212' }}>
                  Recent Groups
                </Typography>
                <Button
                  variant="text"
                  onClick={() => navigate('/admin/groups')}
                  sx={{
                    color: '#00B15E',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'rgba(0, 177, 94, 0.08)',
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
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': {
                        bgcolor: '#F9F9F9',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={600} color="#121212">
                          {group.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="#666">
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
                            color: '#666',
                            '&:hover': {
                              bgcolor: 'rgba(0, 177, 94, 0.08)',
                              color: '#00B15E',
                            },
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteGroup(group._id)}
                          sx={{
                            color: '#666',
                            '&:hover': {
                              bgcolor: 'rgba(255, 122, 0, 0.08)',
                              color: '#FF7A00',
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
                        <Typography color="#666">No groups yet</Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="#999">
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
