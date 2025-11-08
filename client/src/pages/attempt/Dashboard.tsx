import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Alert,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import SandglassLoader from '../../components/SandglassLoader'
import { ExitToApp } from '@mui/icons-material'
import { useAuthV2 as useAuth } from '../../contexts/AuthContextV2'
import axios from 'axios'
import { designSystem } from '../../theme/designSystem'
import DashboardHeader from './components/DashboardHeader'
import StatsCards from './components/StatsCards'
import TopGroups from './components/TopGroups'
import RecentActivity from './components/RecentActivity'

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

const DashboardNew: React.FC = () => {
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
        sx={{ bgcolor: designSystem.colors.darkBg }}
      >
        <SandglassLoader size={80} color={designSystem.colors.brandPrimary} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: designSystem.colors.darkBg }}>
        <Container maxWidth="md" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
          <Alert severity="error" sx={{ borderRadius: designSystem.borderRadius.md }}>
            {error}
          </Alert>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: designSystem.colors.darkBg }}>
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          bgcolor: designSystem.colors.darkBg, 
          borderBottom: `1px solid ${designSystem.colors.textMuted}40`,
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
            Quizda
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mr: 3,
              color: designSystem.colors.textMuted,
              fontWeight: 500,
              fontFamily: designSystem.typography.fontFamily.primary,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {user?.email}
          </Typography>
          <IconButton 
            onClick={handleLogout}
            sx={{
              color: designSystem.colors.textLight,
              '&:hover': { bgcolor: `${designSystem.colors.brandPrimary}20` },
            }}
          >
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 4, md: 4 }, px: { xs: 2, sm: 3, md: 4 } }}>
        <DashboardHeader 
          selectedGroup={selectedGroup}
          groups={groups}
          onGroupChange={handleGroupChange}
          onViewHistory={handleViewHistory}
        />

        {/* Bento Box Grid Layout */}
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(6, 1fr)',
              md: 'repeat(12, 1fr)',
            },
            gap: designSystem.spacing.md,
            gridAutoRows: 'minmax(160px, auto)',
          }}
        >
          <StatsCards stats={stats} onNewQuiz={handleNewQuiz} />

          {/* Section Header: Performance Overview */}
          <Box 
            sx={{
              gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 12' },
              mt: { xs: 2, md: 3 },
              mb: { xs: -1, md: -2 },
            }}
          >
            <Typography 
              variant="h6" 
              sx={{
                color: designSystem.colors.textLight,
                fontWeight: 700,
                fontFamily: designSystem.typography.fontFamily.display,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                opacity: 0.9,
                letterSpacing: '0.5px',
              }}
            >
              📊 Performance Overview
            </Typography>
          </Box>

          <TopGroups groups={groups} />

          {/* Section Header: Recent Activity */}
          <Box 
            sx={{
              gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 12' },
              mt: { xs: 2, md: 3 },
              mb: { xs: -1, md: -2 },
            }}
          >
            <Typography 
              variant="h6" 
              sx={{
                color: designSystem.colors.textLight,
                fontWeight: 700,
                fontFamily: designSystem.typography.fontFamily.display,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                opacity: 0.9,
                letterSpacing: '0.5px',
              }}
            >
              ⏱️ Recent Activity
            </Typography>
          </Box>

          <RecentActivity 
            recentAttempts={stats?.recentAttempts}
            onViewHistory={handleViewHistory}
          />
        </Box>
      </Container>
    </Box>
  )
}

export default DashboardNew
