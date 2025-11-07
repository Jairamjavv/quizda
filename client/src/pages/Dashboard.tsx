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
  SelfImprovement,
  Schedule
} from '@mui/icons-material'
import { PieChart } from '@mui/x-charts/PieChart'
import { useAuthV2 as useAuth } from '../contexts/AuthContextV2'
import axios from 'axios'
import { designSystem } from '../theme/designSystem'

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
      // Only log in development mode - groups are not critical
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load groups:', err)
      }
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

  if (error) {
    return (
      <Container 
        maxWidth="md" 
        sx={{ 
          mt: 4,
          px: { xs: 2, sm: 3, md: 4 },
          '@keyframes slideDown': {
            from: { transform: 'translateY(-20px)', opacity: 0 },
            to: { transform: 'translateY(0)', opacity: 1 },
          },
          animation: 'slideDown 300ms ease-out',
        }}
      >
        <Alert 
          severity="error"
          sx={{
            borderRadius: designSystem.borderRadius.md,
            transition: designSystem.animations.transition.default,
          }}
        >
          {error}
        </Alert>
      </Container>
    )
  }

  const pieChartData = stats?.tagStats.map(tag => ({
    id: tag.tagName,
    value: tag.accuracyPercent,
    label: tag.tagName
  })) || []

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
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          bgcolor: designSystem.colors.darkBg, 
          borderBottom: `1px solid ${designSystem.colors.textMuted}40`,
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
              transition: designSystem.animations.transition.default,
            }}
          >
            Quizda
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mr: 3,
              color: designSystem.colors.textMuted,
              fontWeight: 500,
              display: { xs: 'none', sm: 'block' },
              transition: designSystem.animations.transition.default,
            }}
          >
            {user?.email}
          </Typography>
          <IconButton 
            onClick={handleLogout}
            sx={{
              color: designSystem.colors.textLight,
              transition: designSystem.animations.transition.default,
              '&:hover': {
                bgcolor: `${designSystem.colors.brandPrimary}20`,
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
          py: { xs: 3, sm: 4, md: 4 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Header Section */}
        <Box 
          mb={4}
          sx={{
            '@keyframes slideUp': {
              from: { transform: 'translateY(20px)', opacity: 0 },
              to: { transform: 'translateY(0)', opacity: 1 },
            },
            animation: 'slideUp 500ms ease-out',
          }}
        >
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              fontWeight: 800,
              color: designSystem.colors.textLight,
              mb: 1,
              fontFamily: designSystem.typography.fontFamily.display,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
              transition: designSystem.animations.transition.default,
            }}
          >
            Welcome back! 👋
          </Typography>
          <Typography 
            variant="body1" 
            sx={{
              color: designSystem.colors.textMuted,
              mb: 3,
              fontSize: { xs: '0.9rem', sm: '1rem' },
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
                px: { xs: 3, sm: 4 },
                py: { xs: 1.25, sm: 1.5 },
                borderRadius: designSystem.borderRadius.bento,
                background: designSystem.colors.brandPrimary,
                boxShadow: `0 4px 20px ${designSystem.colors.brandPrimary}50`,
                fontWeight: designSystem.typography.fontWeight.semibold,
                textTransform: 'none',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                transition: designSystem.animations.transition.default,
                '&:hover': {
                  background: designSystem.colors.brandHover,
                  boxShadow: `0 6px 30px ${designSystem.colors.brandPrimary}60`,
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'translateY(0px)',
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
                px: { xs: 3, sm: 4 },
                py: { xs: 1.25, sm: 1.5 },
                borderRadius: designSystem.borderRadius.bento,
                borderColor: designSystem.colors.textMuted,
                color: designSystem.colors.textLight,
                fontWeight: designSystem.typography.fontWeight.medium,
                textTransform: 'none',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                transition: designSystem.animations.transition.default,
                '&:hover': {
                  borderColor: designSystem.colors.accentBlue,
                  bgcolor: `${designSystem.colors.accentBlue}10`,
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                },
              }}
            >
              View History
            </Button>
            <FormControl 
              sx={{ 
                minWidth: { xs: '100%', sm: 200 },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <InputLabel 
                id="group-select-label"
                sx={{ 
                  color: designSystem.colors.textMuted,
                  transition: designSystem.animations.transition.default,
                }}
              >
                Filter by Group
              </InputLabel>
              <Select
                labelId="group-select-label"
                id="group-select"
                value={selectedGroup}
                label="Filter by Group"
                onChange={handleGroupChange}
                sx={{
                  borderRadius: designSystem.borderRadius.bento,
                  color: designSystem.colors.textLight,
                  transition: designSystem.animations.transition.default,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: designSystem.colors.accentBlue,
                    },
                  },
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: designSystem.colors.textMuted,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: designSystem.colors.accentBlue,
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
          </Box>
        </Box>

        {/* Bento Box Grid Layout */}
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(6, 1fr)',
              md: 'repeat(12, 1fr)',
            },
            gap: { xs: 2, sm: 3, md: designSystem.spacing.md },
            gridAutoRows: 'minmax(140px, auto)',
            '@keyframes staggerIn': {
              from: { transform: 'scale(0.95)', opacity: 0 },
              to: { transform: 'scale(1)', opacity: 1 },
            },
          }}
        >
          {/* Total Quizzes Card - Accent Yellow */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 3' },
              borderRadius: designSystem.borderRadius.bento,
              background: designSystem.colors.accentYellow,
              color: designSystem.colors.textDark,
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
                  borderRadius: designSystem.borderRadius.md,
                  bgcolor: 'rgba(26, 26, 26, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Quiz sx={{ fontSize: 28, color: designSystem.colors.textDark }} />
              </Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 0.5,
                  fontFamily: designSystem.typography.fontFamily.mono,
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  transition: designSystem.animations.transition.default,
                }}
              >
                {stats?.totalQuizzesTaken || 0}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.8, 
                  fontWeight: 500,
                  fontSize: { xs: '0.85rem', sm: '0.875rem' },
                }}
              >
                Total Quizzes
              </Typography>
            </CardContent>
          </Card>

          {/* Day Streak Card - Brand Primary */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 3' },
              borderRadius: designSystem.borderRadius.bento,
              background: designSystem.colors.brandPrimary,
              color: designSystem.colors.textLight,
              boxShadow: designSystem.shadows.bento,
              border: 'none',
              transition: designSystem.animations.transition.default,
              animation: 'staggerIn 500ms ease-out 200ms backwards',
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
                  borderRadius: designSystem.borderRadius.md,
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
                <Timeline sx={{ fontSize: { xs: 24, sm: 28 }, color: '#fff' }} />
              </Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 0.5,
                  fontFamily: designSystem.typography.fontFamily.mono,
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  transition: designSystem.animations.transition.default,
                }}
              >
                {stats?.streakDays || 0}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9, 
                  fontWeight: 500,
                  fontSize: { xs: '0.85rem', sm: '0.875rem' },
                }}
              >
                Day Streak 🔥
              </Typography>
            </CardContent>
          </Card>

          {/* Average Score Card - Accent Green */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 3' },
              borderRadius: designSystem.borderRadius.bento,
              background: designSystem.colors.accentGreen,
              color: designSystem.colors.textDark,
              boxShadow: designSystem.shadows.bento,
              border: 'none',
              transition: designSystem.animations.transition.default,
              animation: 'staggerIn 500ms ease-out 300ms backwards',
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
                  borderRadius: designSystem.borderRadius.md,
                  bgcolor: 'rgba(26, 26, 26, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  transition: designSystem.animations.transition.default,
                  '&:hover': {
                    transform: 'rotate(-10deg)',
                  },
                }}
              >
                <TrendingUp sx={{ fontSize: { xs: 24, sm: 28 }, color: designSystem.colors.textDark }} />
              </Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 0.5,
                  fontFamily: designSystem.typography.fontFamily.mono,
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  transition: designSystem.animations.transition.default,
                }}
              >
                {stats?.averageScore ? `${stats.averageScore.toFixed(0)}%` : '0%'}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.8, 
                  fontWeight: 500,
                  fontSize: { xs: '0.85rem', sm: '0.875rem' },
                }}
              >
                Average Score
              </Typography>
            </CardContent>
          </Card>

          {/* Analytics Card - Accent Blue */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 3' },
              borderRadius: designSystem.borderRadius.bento,
              bgcolor: designSystem.colors.accentBlue,
              color: designSystem.colors.textDark,
              border: 'none',
              boxShadow: designSystem.shadows.bento,
              transition: designSystem.animations.transition.default,
              animation: 'staggerIn 500ms ease-out 400ms backwards',
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
              <Assessment 
                sx={{ 
                  fontSize: { xs: 36, sm: 40 }, 
                  mb: 2, 
                  opacity: 0.9, 
                  color: designSystem.colors.textDark,
                  transition: designSystem.animations.transition.default,
                }} 
              />
              <Typography 
                variant="h6" 
                fontWeight={700} 
                mb={1}
                sx={{ 
                  color: designSystem.colors.textDark,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                }}
              >
                Topic Accuracy
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.8, 
                  mb: 2, 
                  fontWeight: 500,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
              >
                Advanced analytics coming soon
              </Typography>
              <Button 
                variant="contained"
                size="small"
                fullWidth
                sx={{
                  bgcolor: 'rgba(26, 26, 26, 0.15)',
                  color: designSystem.colors.textDark,
                  fontWeight: 600,
                  borderRadius: designSystem.borderRadius.md,
                  textTransform: 'none',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  transition: designSystem.animations.transition.default,
                  '&:hover': {
                    bgcolor: 'rgba(26, 26, 26, 0.25)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0px)',
                  },
                }}
              >
                View Insights
              </Button>
            </CardContent>
          </Card>

          {/* SWOT Analysis Card - Accent Yellow */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 3' },
              borderRadius: designSystem.borderRadius.bento,
              background: designSystem.colors.accentYellow,
              color: designSystem.colors.textDark,
              boxShadow: designSystem.shadows.bento,
              border: 'none',
              transition: designSystem.animations.transition.default,
              animation: 'staggerIn 500ms ease-out 500ms backwards',
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
                  borderRadius: designSystem.borderRadius.md,
                  bgcolor: 'rgba(26, 26, 26, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  transition: designSystem.animations.transition.default,
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <Assessment sx={{ fontSize: { xs: 24, sm: 28 }, color: designSystem.colors.textDark }} />
              </Box>
              <Typography 
                variant="h6" 
                fontWeight={700} 
                mb={1}
                sx={{ 
                  color: designSystem.colors.textDark,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                }}
              >
                SWOT Analysis
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.8, 
                  mb: 2, 
                  fontWeight: 500,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
              >
                Coming soon - Identify your strengths & weaknesses
              </Typography>
              <Button 
                variant="contained"
                size="small"
                fullWidth
                disabled
                sx={{
                  bgcolor: 'rgba(26, 26, 26, 0.15)',
                  color: designSystem.colors.textDark,
                  fontWeight: 600,
                  borderRadius: designSystem.borderRadius.md,
                  textTransform: 'none',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  transition: designSystem.animations.transition.default,
                  '&:hover': {
                    bgcolor: 'rgba(26, 26, 26, 0.25)',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(26, 26, 26, 0.1)',
                    color: 'rgba(26, 26, 26, 0.4)',
                  },
                }}
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Top Groups Card - Spans 6 columns - Light Surface */}
          <Card 
            sx={{
              gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 6' },
              borderRadius: designSystem.borderRadius.bento,
              border: 'none',
              boxShadow: designSystem.shadows.bento,
              bgcolor: designSystem.colors.lightSurface,
              transition: designSystem.animations.transition.default,
              animation: 'staggerIn 500ms ease-out 600ms backwards',
              '&:hover': {
                boxShadow: designSystem.shadows.hover,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: designSystem.spacing.md } }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Assessment 
                  sx={{ 
                    mr: 1.5, 
                    color: designSystem.colors.accentGreen, 
                    fontSize: { xs: 24, sm: 28 },
                    transition: designSystem.animations.transition.default,
                  }} 
                />
                <Typography 
                  variant="h6"
                  sx={{ 
                    fontWeight: 700,
                    color: designSystem.colors.textDark,
                    fontSize: { xs: '1rem', sm: '1.25rem' },
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
                        p: { xs: 1.5, sm: 2 },
                        mb: 1.5,
                        borderRadius: designSystem.borderRadius.sm,
                        bgcolor: 'rgba(26, 26, 26, 0.03)',
                        border: `1px solid rgba(26, 26, 26, 0.08)`,
                        transition: designSystem.animations.transition.default,
                        cursor: 'pointer',
                        '@keyframes slideInRight': {
                          from: { transform: 'translateX(-20px)', opacity: 0 },
                          to: { transform: 'translateX(0)', opacity: 1 },
                        },
                        animation: `slideInRight 400ms ease-out ${index * 100 + 700}ms backwards`,
                        '&:hover': {
                          bgcolor: 'rgba(26, 26, 26, 0.05)',
                          transform: 'translateX(6px)',
                          borderColor: designSystem.colors.accentGreen,
                          boxShadow: `0 2px 8px ${designSystem.colors.accentGreen}33`,
                        },
                        '&:active': {
                          transform: 'translateX(3px)',
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={{ xs: 1.5, sm: 2 }}>
                        <Box
                          sx={{
                            width: { xs: 28, sm: 32 },
                            height: { xs: 28, sm: 32 },
                            borderRadius: '50%',
                            background: index === 0 ? 'linear-gradient(135deg, #FFD452 0%, #FFC107 100%)' : 
                                       index === 1 ? 'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%)' :
                                       index === 2 ? 'linear-gradient(135deg, #CD7F32 0%, #B8651A 100%)' :
                                       'rgba(26, 26, 26, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: index < 3 ? designSystem.colors.textDark : 'rgba(26, 26, 26, 0.6)',
                            fontSize: { xs: '12px', sm: '14px' },
                            fontFamily: designSystem.typography.fontFamily.mono,
                            boxShadow: index < 3 ? designSystem.shadows.subtle : 'none',
                            transition: designSystem.animations.transition.bounce,
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Typography 
                          variant="body2" 
                          noWrap 
                          sx={{ 
                            maxWidth: '150px', 
                            fontWeight: 600, 
                            color: designSystem.colors.textDark,
                          }}
                        >
                          {group.name}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${group.averageScore.toFixed(0)}%`}
                        size="small"
                        sx={{
                          bgcolor: group.averageScore >= 75 
                            ? designSystem.colors.accentGreen 
                            : group.averageScore >= 60 
                            ? designSystem.colors.accentYellow 
                            : 'rgba(26, 26, 26, 0.15)',
                          color: group.averageScore >= 60 
                            ? designSystem.colors.textDark 
                            : 'rgba(26, 26, 26, 0.6)',
                          fontWeight: 700,
                          fontSize: '13px',
                          fontFamily: designSystem.typography.fontFamily.mono,
                          border: 'none',
                        }}
                      />
                    </Box>
                  ))}
                {groups.filter(g => g.attemptCount > 0).length === 0 && (
                  <Box 
                    sx={{
                      textAlign: 'center',
                      py: 4,
                      color: 'rgba(26, 26, 26, 0.4)',
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
              gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 6' },
              borderRadius: designSystem.borderRadius.bento,
              border: 'none',
              boxShadow: designSystem.shadows.bento,
              bgcolor: designSystem.colors.darkBg,
              transition: designSystem.animations.transition.default,
              animation: 'staggerIn 500ms ease-out 700ms backwards',
              '&:hover': {
                boxShadow: designSystem.shadows.hover,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: designSystem.spacing.md } }}>
              <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center" 
                mb={3}
                flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
                gap={{ xs: 2, sm: 0 }}
              >
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Schedule 
                    sx={{ 
                      color: designSystem.colors.accentBlue,
                      fontSize: { xs: 24, sm: 28 },
                    }} 
                  />
                  <Typography 
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: designSystem.colors.textLight,
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                    }}
                  >
                    Recent Activity
                  </Typography>
                </Box>
                <Button 
                  variant="text" 
                  onClick={handleViewHistory}
                  size="small"
                  sx={{
                    color: designSystem.colors.accentBlue,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: designSystem.borderRadius.sm,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    transition: designSystem.animations.transition.default,
                    '&:hover': {
                      bgcolor: `${designSystem.colors.accentBlue}15`,
                      transform: 'translateX(4px)',
                    },
                    '&:active': {
                      transform: 'translateX(2px)',
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
                          p: { xs: 1.5, sm: 2 },
                          mb: 1.5,
                          borderRadius: designSystem.borderRadius.sm,
                          bgcolor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          transition: designSystem.animations.transition.default,
                          cursor: 'pointer',
                          '@keyframes slideInLeft': {
                            from: { transform: 'translateX(20px)', opacity: 0 },
                            to: { transform: 'translateX(0)', opacity: 1 },
                          },
                          animation: `slideInLeft 400ms ease-out ${index * 100 + 800}ms backwards`,
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.08)',
                            borderColor: designSystem.colors.accentBlue,
                            transform: 'translateX(6px)',
                            boxShadow: `0 2px 8px ${designSystem.colors.accentBlue}33`,
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                            width: 48,
                            height: 48,
                            borderRadius: designSystem.borderRadius.sm,
                            bgcolor: passed ? designSystem.colors.accentGreen : designSystem.colors.brandPrimary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: designSystem.shadows.subtle,
                            }}
                          >
                            {passed ? (
                              <CheckCircle sx={{ color: designSystem.colors.textDark, fontSize: 28 }} />
                            ) : (
                              <Cancel sx={{ color: designSystem.colors.textLight, fontSize: 28 }} />
                            )}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                              <Typography variant="body1" fontWeight={700} color={designSystem.colors.textLight}>
                                Quiz Attempt #{attempt.id}
                              </Typography>
                              <Chip 
                                label={attempt.mode === 'timed' ? 'Timed ⏱️' : 'Zen 🧘'} 
                                size="small"
                                sx={{
                                  bgcolor: attempt.mode === 'timed' 
                                    ? `${designSystem.colors.brandPrimary}25` 
                                    : `${designSystem.colors.accentGreen}25`,
                                  color: attempt.mode === 'timed' 
                                    ? designSystem.colors.brandPrimary 
                                    : designSystem.colors.accentGreen,
                                  fontWeight: 600,
                                  fontSize: '11px',
                                  border: 'none',
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
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    fontSize: '11px',
                                    height: '22px',
                                  }}
                                />
                              ))}
                              <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
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
                            <Typography 
                              variant="h6" 
                              fontWeight={800} 
                              color={percentage >= 75 
                                ? designSystem.colors.accentGreen 
                                : percentage >= 60 
                                ? designSystem.colors.accentYellow 
                                : 'rgba(255, 255, 255, 0.4)'}
                              sx={{ fontFamily: designSystem.typography.fontFamily.mono }}
                            >
                              {percentage.toFixed(0)}%
                            </Typography>
                            <Typography 
                              variant="caption" 
                              display="block" 
                              sx={{ 
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontWeight: 500,
                                fontFamily: designSystem.typography.fontFamily.mono,
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
                    color: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <Quiz sx={{ fontSize: 64, opacity: 0.3, mb: 2, color: 'rgba(255, 255, 255, 0.2)' }} />
                  <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
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
