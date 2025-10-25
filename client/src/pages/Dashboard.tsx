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
    <Box sx={{ minHeight: '100vh', bgcolor: '#F9F9F9' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              color: '#121212',
            }}
          >
            Quizda Dashboard
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mr: 3,
              color: '#666666',
            }}
          >
            {user?.email}
          </Typography>
          <IconButton 
            onClick={handleLogout}
            sx={{
              color: '#121212',
              '&:hover': {
                bgcolor: 'rgba(255, 122, 0, 0.1)',
              },
            }}
          >
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header with New Quiz Button and Group Selector */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={4} 
          flexWrap="wrap" 
          gap={2}
        >
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              fontWeight: 700,
              color: '#121212',
            }}
          >
            Your Learning Dashboard
          </Typography>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="group-select-label">Filter by Group</InputLabel>
              <Select
                labelId="group-select-label"
                id="group-select"
                value={selectedGroup}
                label="Filter by Group"
                onChange={handleGroupChange}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E0E0E0',
                  },
                }}
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
              sx={{ 
                px: 4,
                py: 1.5,
              }}
            >
              New Quiz
            </Button>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card 
              sx={{
                border: '2px solid #00B15E',
                borderLeft: '6px solid #00B15E',
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Quiz sx={{ mr: 2, color: '#00B15E', fontSize: 40 }} />
                  <Box>
                    <Typography 
                      sx={{ 
                        color: '#666666',
                        fontWeight: 500,
                        mb: 0.5,
                      }}
                    >
                      Total Quizzes
                    </Typography>
                    <Typography 
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: '#121212',
                      }}
                    >
                      {stats?.totalQuizzesTaken || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                border: '2px solid #FF7A00',
                borderLeft: '6px solid #FF7A00',
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Timeline sx={{ mr: 2, color: '#FF7A00', fontSize: 40 }} />
                  <Box>
                    <Typography 
                      sx={{ 
                        color: '#666666',
                        fontWeight: 500,
                        mb: 0.5,
                      }}
                    >
                      Streak (Days)
                    </Typography>
                    <Typography 
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: '#121212',
                      }}
                    >
                      {stats?.streakDays || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                border: '2px solid #00B15E',
                borderLeft: '6px solid #00B15E',
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUp sx={{ mr: 2, color: '#00B15E', fontSize: 40 }} />
                  <Box>
                    <Typography 
                      sx={{ 
                        color: '#666666',
                        fontWeight: 500,
                        mb: 0.5,
                      }}
                    >
                      Average Score
                    </Typography>
                    <Typography 
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: '#121212',
                      }}
                    >
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
                <Box display="flex" alignItems="center" mb={2}>
                  <Assessment sx={{ mr: 1, color: '#666666', fontSize: 28 }} />
                  <Typography 
                    sx={{ 
                      color: '#666666',
                      fontWeight: 500,
                    }}
                  >
                    Top 5 Groups
                  </Typography>
                </Box>
                <Box>
                  {groups
                    .filter(g => g.attemptCount > 0)
                    .sort((a, b) => b.averageScore - a.averageScore)
                    .slice(0, 5)
                    .map((group, index) => (
                      <Box key={group.id} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: '150px', fontWeight: 500 }}>
                          {index + 1}. {group.name}
                        </Typography>
                        <Chip 
                          label={`${group.averageScore.toFixed(0)}%`}
                          size="small"
                          sx={{
                            bgcolor: group.averageScore >= 75 ? '#00B15E' : group.averageScore >= 60 ? '#FF7A00' : '#E0E0E0',
                            color: '#FFFFFF',
                            fontWeight: 600,
                          }}
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
            <Paper 
              sx={{ 
                p: 4, 
                minHeight: 200, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                background: 'linear-gradient(135deg, #00B15E 0%, #009B50 100%)',
                color: '#FFFFFF',
              }}
            >
              <Assessment sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Topic Accuracy
              </Typography>
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 700 }}>
                Coming Soon
              </Typography>
              <Typography align="center" sx={{ mt: 1, opacity: 0.9 }}>
                Advanced analytics and topic breakdown
              </Typography>
            </Paper>
          </Grid>

          {/* SWOT Analysis */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper 
              sx={{ 
                p: 4, 
                minHeight: 200, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                background: 'linear-gradient(135deg, #FF7A00 0%, #E66D00 100%)',
                color: '#FFFFFF',
              }}
            >
              <TrendingUp sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
              <Typography variant="h6" gutterBottom fontWeight={600}>
                SWOT Analysis
              </Typography>
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 700 }}>
                Coming Soon
              </Typography>
              <Typography align="center" sx={{ mt: 1, opacity: 0.9 }}>
                Personalized learning insights
              </Typography>
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 4 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography 
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: '#121212',
                  }}
                >
                  Recent Activity
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={handleViewHistory}
                  sx={{
                    borderColor: '#00B15E',
                    color: '#00B15E',
                    '&:hover': {
                      borderColor: '#009B50',
                      bgcolor: 'rgba(0, 177, 94, 0.1)',
                    },
                  }}
                >
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
                        {index > 0 && <Divider sx={{ my: 1 }} />}
                        <ListItem sx={{ px: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                            {passed ? (
                              <CheckCircle sx={{ color: '#00B15E', fontSize: 32 }} />
                            ) : (
                              <Cancel sx={{ color: '#FF7A00', fontSize: 32 }} />
                            )}
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                  <Typography variant="body1" fontWeight={600}>
                                    Quiz Attempt
                                  </Typography>
                                  <Chip 
                                    label={attempt.mode === 'timed' ? 'Timed' : 'Zen'} 
                                    size="small"
                                    icon={attempt.mode === 'timed' ? <Timer /> : <SelfImprovement />}
                                    sx={{
                                      bgcolor: attempt.mode === 'timed' ? '#FF7A00' : '#00B15E',
                                      color: '#FFFFFF',
                                      fontWeight: 500,
                                      '& .MuiChip-icon': {
                                        color: '#FFFFFF',
                                      },
                                    }}
                                  />
                                  {attempt.tags_snapshot.map(tag => (
                                    <Chip 
                                      key={tag} 
                                      label={tag} 
                                      size="small" 
                                      variant="outlined"
                                      sx={{
                                        borderColor: '#E0E0E0',
                                        color: '#666666',
                                      }}
                                    />
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
                                sx={{
                                  bgcolor: percentage >= 80 ? '#00B15E' : percentage >= 60 ? '#FF7A00' : '#E0E0E0',
                                  color: '#FFFFFF',
                                  fontWeight: 600,
                                  mb: 0.5,
                                }}
                              />
                              <Typography 
                                variant="caption" 
                                display="block" 
                                sx={{ 
                                  color: '#666666',
                                  fontWeight: 500,
                                }}
                              >
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
