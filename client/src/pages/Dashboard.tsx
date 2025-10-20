import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import {
  Quiz,
  TrendingUp,
  Timeline,
  Assessment,
  ExitToApp,
  CheckCircle,
  Cancel,
  Timer,
  SelfImprovement
} from '@mui/icons-material'
import { PieChart } from '@mui/x-charts/PieChart'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

interface RecentAttempt {
  id: number
  quiz_id: string
  mode: 'timed' | 'zen'
  started_at: string
  completed_at: string
  score: number
  max_points: number
  tags_snapshot: string[]
}

interface GroupStat {
  id: string
  name: string
  attemptCount: number
  averageScore: number
}

interface DashboardStats {
  totalQuizzesTaken: number
  streakDays: number
  averageScore: number
  tagStats: Array<{
    tagName: string
    totalAttempts: number
    correctAttempts: number
    accuracyPercent: number
  }>
  swot: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  recentAttempts: RecentAttempt[]
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [groups, setGroups] = useState<GroupStat[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchGroups()
  }, [])

  useEffect(() => {
    fetchDashboardStats()
  }, [selectedGroup])

  const fetchGroups = async () => {
    try {
      const response = await axios.get('/dashboard/groups')
      setGroups(response.data)
    } catch (err: any) {
      console.error('Failed to load groups:', err)
    }
  }

  const handleGroupChange = (event: SelectChangeEvent) => {
    setSelectedGroup(event.target.value)
  }

  const fetchDashboardStats = async () => {
    try {
      const url = selectedGroup === 'all' ? '/dashboard' : `/dashboard?groupId=${selectedGroup}`
      const response = await axios.get(url)
      setStats(response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  const handleNewQuiz = () => {
    navigate('/quiz/new')
  }

  const handleViewHistory = () => {
    navigate('/quiz/history')
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  const pieChartData = stats?.tagStats.map(tag => ({
    id: tag.tagName,
    value: tag.accuracyPercent,
    label: tag.tagName
  })) || []

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Quizda Dashboard
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
        {/* Header with New Quiz Button and Group Selector */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
          <Typography variant="h4" component="h1">
            Your Learning Dashboard
          </Typography>
          <Box display="flex" gap={2} alignItems="center">
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="group-select-label">Filter by Group</InputLabel>
              <Select
                labelId="group-select-label"
                id="group-select"
                value={selectedGroup}
                label="Filter by Group"
                onChange={handleGroupChange}
              >
                <MenuItem value="all">All Groups</MenuItem>
                {groups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              size="large"
              startIcon={<Quiz />}
              onClick={handleNewQuiz}
              sx={{ px: 4 }}
            >
              New Quiz
            </Button>
          </Box>
        </Box>

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
                      {stats?.totalQuizzesTaken || 0}
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
                  <Timeline color="secondary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Streak (Days)
                    </Typography>
                    <Typography variant="h4">
                      {stats?.streakDays || 0}
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
                  <TrendingUp color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Average Score
                    </Typography>
                    <Typography variant="h4">
                      {stats?.averageScore ? `${stats.averageScore.toFixed(1)}%` : '0%'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Assessment color="info" sx={{ mr: 2 }} />
                  <Typography color="textSecondary">
                    Top 5 Groups
                  </Typography>
                </Box>
                <Box>
                  {groups
                    .filter(g => g.attemptCount > 0)
                    .sort((a, b) => b.averageScore - a.averageScore)
                    .slice(0, 5)
                    .map((group, index) => (
                      <Box key={group.id} display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: '150px' }}>
                          {index + 1}. {group.name}
                        </Typography>
                        <Chip 
                          label={`${group.averageScore.toFixed(0)}%`}
                          size="small"
                          color={group.averageScore >= 75 ? 'success' : group.averageScore >= 60 ? 'warning' : 'error'}
                        />
                      </Box>
                    ))}
                  {groups.filter(g => g.attemptCount > 0).length === 0 && (
                    <Typography variant="body2" color="textSecondary">
                      No groups attempted yet
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Tag Accuracy Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Topic Accuracy
              </Typography>
              <Typography variant="h5" color="primary" sx={{ mt: 2 }}>
                Coming Soon
              </Typography>
              <Typography color="textSecondary" align="center" sx={{ mt: 1 }}>
                Advanced analytics and topic breakdown will be available soon
              </Typography>
            </Paper>
          </Grid>

          {/* SWOT Analysis */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom>
                SWOT Analysis
              </Typography>
              <Typography variant="h5" color="primary" sx={{ mt: 2 }}>
                Coming Soon
              </Typography>
              <Typography color="textSecondary" align="center" sx={{ mt: 1 }}>
                Personalized strengths, weaknesses, opportunities, and threats analysis
              </Typography>
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Recent Activity
                </Typography>
                <Button variant="outlined" onClick={handleViewHistory}>
                  View All History
                </Button>
              </Box>
              {stats?.recentAttempts && stats.recentAttempts.length > 0 ? (
                <List>
                  {stats.recentAttempts.map((attempt, index) => {
                    const percentage = (attempt.score / attempt.max_points) * 100
                    const passed = percentage >= 60
                    
                    return (
                      <React.Fragment key={attempt.id}>
                        {index > 0 && <Divider />}
                        <ListItem>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                            {passed ? (
                              <CheckCircle color="success" />
                            ) : (
                              <Cancel color="error" />
                            )}
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography variant="body1">
                                    Quiz Attempt
                                  </Typography>
                                  <Chip 
                                    label={attempt.mode === 'timed' ? 'Timed' : 'Zen'} 
                                    size="small"
                                    icon={attempt.mode === 'timed' ? <Timer /> : <SelfImprovement />}
                                    color={attempt.mode === 'timed' ? 'primary' : 'secondary'}
                                  />
                                  {attempt.tags_snapshot.map(tag => (
                                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                                  ))}
                                </Box>
                              }
                              secondary={new Date(attempt.completed_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            />
                            <Box textAlign="right">
                              <Chip
                                label={`${attempt.score}/${attempt.max_points}`}
                                color={percentage >= 80 ? 'success' : percentage >= 60 ? 'warning' : 'error'}
                              />
                              <Typography variant="caption" display="block" color="textSecondary">
                                {percentage.toFixed(1)}%
                              </Typography>
                            </Box>
                          </Box>
                        </ListItem>
                      </React.Fragment>
                    )
                  })}
                </List>
              ) : (
                <Typography color="textSecondary">
                  Complete your first quiz to see recent activity
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default Dashboard
