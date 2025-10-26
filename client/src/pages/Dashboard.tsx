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
import { useAuthV2 as useAuth } from '../contexts/AuthContextV2'
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#FFFFFF' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #E0E0E0' }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              color: '#121212',
            }}
          >
            Quizda
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mr: 3,
              color: '#666',
              fontWeight: 500,
            }}
          >
            {user?.email}
          </Typography>
          <IconButton 
            onClick={handleLogout}
            sx={{
              color: '#121212',
              '&:hover': {
                bgcolor: 'rgba(0, 177, 94, 0.08)',
              },
            }}
          >
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box mb={4}>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              fontWeight: 800,
              color: '#121212',
              mb: 1,
            }}
          >
            Welcome back! 👋
          </Typography>
          <Typography 
            variant="body1" 
            sx={{
              color: '#666',
              mb: 3,
            }}
          >
            Track your progress and continue learning
          </Typography>
          
          {/* Action Buttons */}
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              size="large"
              startIcon={<Quiz />}
              onClick={handleNewQuiz}
              sx={{ 
                px: 4,
                py: 1.5,
                borderRadius: 3,
                background: '#00B15E',
                boxShadow: '0 4px 20px rgba(0, 177, 94, 0.3)',
                '&:hover': {
                  background: '#009B50',
                  boxShadow: '0 6px 30px rgba(0, 177, 94, 0.4)',
                },
              }}
            >
              Start New Quiz
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleViewHistory}
              sx={{ 
                px: 4,
                py: 1.5,
                borderRadius: 3,
                borderColor: '#E0E0E0',
                color: '#121212',
                '&:hover': {
                  borderColor: '#00B15E',
                  bgcolor: 'rgba(0, 177, 94, 0.04)',
                },
              }}
            >
              View History
            </Button>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="group-select-label">Filter by Group</InputLabel>
              <Select
                labelId="group-select-label"
                id="group-select"
                value={selectedGroup}
                label="Filter by Group"
                onChange={handleGroupChange}
                sx={{
                  borderRadius: 3,
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
          </Box>
        </Box>

        {/* Bento Box Grid Layout */}
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 3,
            gridAutoRows: 'minmax(120px, auto)',
          }}
        >
          {/* Total Quizzes Card - 3 columns */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
              borderRadius: 4,
              background: '#00B15E',
              color: 'white',
              boxShadow: '0 4px 16px rgba(0, 177, 94, 0.25)',
              border: '1px solid #00B15E',
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
                {stats?.totalQuizzesTaken || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Quizzes
              </Typography>
            </CardContent>
          </Card>

          {/* Day Streak Card - 3 columns */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
              borderRadius: 4,
              background: '#FF7A00',
              color: 'white',
              boxShadow: '0 4px 16px rgba(255, 122, 0, 0.25)',
              border: '1px solid #FF7A00',
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
                <Timeline sx={{ fontSize: 28, color: '#fff' }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                {stats?.streakDays || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Day Streak 🔥
              </Typography>
            </CardContent>
          </Card>

          {/* Average Score Card - 3 columns */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
              borderRadius: 4,
              background: '#00B15E',
              color: 'white',
              boxShadow: '0 4px 16px rgba(0, 177, 94, 0.25)',
              border: '1px solid #00B15E',
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
                <TrendingUp sx={{ fontSize: 28, color: '#fff' }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                {stats?.averageScore ? `${stats.averageScore.toFixed(0)}%` : '0%'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Average Score
              </Typography>
            </CardContent>
          </Card>

          {/* Analytics Card - 3 columns */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
              borderRadius: 4,
              bgcolor: '#FF7A00',
              color: 'white',
              border: '1px solid #FF7A00',
              boxShadow: '0 4px 16px rgba(255, 122, 0, 0.25)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Assessment sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
              <Typography variant="h6" fontWeight={700} mb={1}>
                Topic Accuracy
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                Advanced analytics coming soon
              </Typography>
              <Button 
                variant="contained"
                size="small"
                fullWidth
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                  },
                }}
              >
                View Insights
              </Button>
            </CardContent>
          </Card>

          {/* SWOT Analysis Card - 3 columns */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
              borderRadius: 4,
              background: '#00B15E',
              color: 'white',
              boxShadow: '0 4px 16px rgba(0, 177, 94, 0.25)',
              border: '1px solid #00B15E',
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
                <Assessment sx={{ fontSize: 28, color: '#fff' }} />
              </Box>
              <Typography variant="h6" fontWeight={700} mb={1}>
                SWOT Analysis
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                Coming soon - Identify your strengths & weaknesses
              </Typography>
              <Button 
                variant="contained"
                size="small"
                fullWidth
                disabled
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.5)',
                  },
                }}
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Top Groups Card - Spans 6 columns */}
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
              <Box display="flex" alignItems="center" mb={3}>
                <Assessment sx={{ mr: 1.5, color: '#00B15E', fontSize: 28 }} />
                <Typography 
                  variant="h6"
                  sx={{ 
                    fontWeight: 700,
                    color: '#121212',
                  }}
                >
                  Top Groups
                </Typography>
              </Box>
              <Box>
                {groups
                  .filter(g => g.attemptCount > 0)
                  .sort((a, b) => b.averageScore - a.averageScore)
                  .slice(0, 5)
                  .map((group, index) => (
                    <Box 
                      key={group.id} 
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        mb: 1.5,
                        borderRadius: 2,
                        bgcolor: '#F9F9F9',
                        border: '1px solid #E0E0E0',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: '#F2F2F2',
                          transform: 'translateX(4px)',
                          borderColor: '#00B15E',
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: index === 0 ? '#FFD700' : 
                                       index === 1 ? '#C0C0C0' :
                                       index === 2 ? '#CD7F32' :
                                       '#E0E0E0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: index < 3 ? '#fff' : '#121212',
                            fontSize: '14px',
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Typography variant="body2" noWrap sx={{ maxWidth: '150px', fontWeight: 600, color: '#121212' }}>
                          {group.name}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${group.averageScore.toFixed(0)}%`}
                        size="small"
                        sx={{
                          bgcolor: group.averageScore >= 75 ? '#00B15E' : group.averageScore >= 60 ? '#FF7A00' : '#E0E0E0',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '13px',
                        }}
                      />
                    </Box>
                  ))}
                {groups.filter(g => g.attemptCount > 0).length === 0 && (
                  <Box 
                    sx={{
                      textAlign: 'center',
                      py: 4,
                      color: '#666',
                    }}
                  >
                    <Typography variant="body2">
                      No groups attempted yet
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Recent Activity - Wide Card */}
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
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography 
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#121212',
                  }}
                >
                  Recent Activity
                </Typography>
                <Button 
                  variant="text" 
                  onClick={handleViewHistory}
                  size="small"
                  sx={{
                    color: '#00B15E',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'rgba(0, 177, 94, 0.08)',
                    },
                  }}
                >
                  View All →
                </Button>
              </Box>
              {stats?.recentAttempts && stats.recentAttempts.length > 0 ? (
                <Box>
                  {stats.recentAttempts.slice(0, 3).map((attempt, index) => {
                    const percentage = (attempt.score / attempt.max_points) * 100
                    const passed = percentage >= 60
                    
                    return (
                      <Box 
                        key={attempt.id}
                        sx={{
                          p: 2,
                          mb: 1.5,
                          borderRadius: 2,
                          bgcolor: '#F9F9F9',
                          border: '1px solid #E0E0E0',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: '#F2F2F2',
                            borderColor: '#00B15E',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: passed ? '#00B15E' : '#FF7A00',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            }}
                          >
                            {passed ? (
                              <CheckCircle sx={{ color: '#fff', fontSize: 28 }} />
                            ) : (
                              <Cancel sx={{ color: '#fff', fontSize: 28 }} />
                            )}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                              <Typography variant="body1" fontWeight={700} color="#121212">
                                Quiz Attempt #{attempt.id}
                              </Typography>
                              <Chip 
                                label={attempt.mode === 'timed' ? 'Timed ⏱️' : 'Zen 🧘'} 
                                size="small"
                                sx={{
                                  bgcolor: attempt.mode === 'timed' ? 'rgba(255, 122, 0, 0.15)' : 'rgba(0, 177, 94, 0.15)',
                                  color: attempt.mode === 'timed' ? '#FF7A00' : '#00B15E',
                                  fontWeight: 600,
                                  fontSize: '11px',
                                }}
                              />
                            </Box>
                            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                              {attempt.tags_snapshot.slice(0, 3).map(tag => (
                                <Chip 
                                  key={tag} 
                                  label={tag} 
                                  size="small" 
                                  sx={{
                                    bgcolor: '#fff',
                                    color: '#666',
                                    border: '1px solid #E0E0E0',
                                    fontSize: '11px',
                                    height: '22px',
                                  }}
                                />
                              ))}
                              <Typography variant="caption" color="#666">
                                {new Date(attempt.completed_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                            </Box>
                          </Box>
                          <Box textAlign="right">
                            <Typography variant="h6" fontWeight={800} color={percentage >= 75 ? '#00B15E' : percentage >= 60 ? '#FF7A00' : '#666'}>
                              {percentage.toFixed(0)}%
                            </Typography>
                            <Typography 
                              variant="caption" 
                              display="block" 
                              sx={{ 
                                color: '#666',
                                fontWeight: 500,
                              }}
                            >
                              {attempt.score}/{attempt.max_points}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
              ) : (
                <Box 
                  sx={{
                    textAlign: 'center',
                    py: 6,
                    color: '#666',
                  }}
                >
                  <Quiz sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
                  <Typography variant="body1">
                    Complete your first quiz to see activity
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  )
}

export default Dashboard
