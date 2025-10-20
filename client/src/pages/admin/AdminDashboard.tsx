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
import { useAuth } from '../../contexts/AuthContext'
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
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Quizda Admin Dashboard
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Welcome, {user?.email}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Quiz color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Quizzes
                    </Typography>
                    <Typography variant="h4">
                      {quizzes.length}
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
                  <Visibility color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Published
                    </Typography>
                    <Typography variant="h4">
                      {quizzes.filter(q => q.is_published).length}
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
                  <VisibilityOff color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Drafts
                    </Typography>
                    <Typography variant="h4">
                      {quizzes.filter(q => !q.is_published).length}
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
                  <Group color="info" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Groups
                    </Typography>
                    <Typography variant="h4">
                      {groups.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/admin/quizzes')}
            >
              Create New Quiz
            </Button>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => navigate('/admin/groups')}
            >
              Create New Group
            </Button>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Recent Quizzes */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Recent Quizzes
                </Typography>
                <Button
                  variant="text"
                  onClick={() => navigate('/admin/quizzes')}
                >
                  View All
                </Button>
              </Box>
              <List>
                {quizzes.slice(0, 5).map(quiz => (
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
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => toggleQuizPublish(quiz._id, quiz.is_published)}
                        >
                          {quiz.is_published ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin/quizzes/${quiz._id}`)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteQuiz(quiz._id)}
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
          </Grid>

          {/* Recent Groups */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Recent Groups
                </Typography>
                <Button
                  variant="text"
                  onClick={() => navigate('/admin/groups')}
                >
                  View All
                </Button>
              </Box>
              <List>
                {groups.slice(0, 5).map(group => (
                  <ListItem key={group._id} divider>
                    <ListItemText
                      primary={group.name}
                      secondary={group.description}
                    />
                    <ListItemSecondaryAction>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin/groups/${group._id}`)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteGroup(group._id)}
                          color="error"
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
                      primary="No groups yet"
                      secondary="Create your first group to organize quizzes"
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default AdminDashboard
