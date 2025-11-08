import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button
} from '@mui/material'
import {
  Quiz,
  TrendingUp,
  Timeline,
  Assessment,
  SelfImprovement
} from '@mui/icons-material'
import { designSystem } from '../../../theme/designSystem'

interface DashboardStats {
  totalQuizzesTaken: number
  streakDays: number
  averageScore: number
}

interface StatsCardsProps {
  stats: DashboardStats | null
  onNewQuiz: () => void
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, onNewQuiz }) => {
  return (
    <>
      {/* Start New Quiz - Top-left Bento block (Fixed CTA Card) */}
      <Card 
        sx={{
          gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 3' },
          gridRow: { md: 'span 2' },
          borderRadius: designSystem.borderRadius.bento,
          background: `linear-gradient(135deg, ${designSystem.colors.brandPrimary} 0%, ${designSystem.colors.brandHover} 100%)`,
          color: designSystem.colors.textLight,
          boxShadow: `0 8px 24px ${designSystem.colors.brandPrimary}40`,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            transform: 'translateY(-6px) scale(1.02)',
            boxShadow: `0 12px 32px ${designSystem.colors.brandPrimary}50`,
          },
        }}
        onClick={onNewQuiz}
      >
        <CardContent sx={{ 
          p: designSystem.spacing.md,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
        }}>
          <Box>
            <Box 
              sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: designSystem.borderRadius.md,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <Quiz sx={{ fontSize: 32, color: designSystem.colors.textLight }} />
            </Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 800, 
                mb: 1,
                fontFamily: designSystem.typography.fontFamily.display,
              }}
            >
              Start New Quiz
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.9, 
                fontWeight: 500,
                fontFamily: designSystem.typography.fontFamily.primary,
                mb: 3,
              }}
            >
              Test your knowledge and track your progress
            </Typography>
          </Box>
          <Button
            variant="contained"
            fullWidth
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              color: designSystem.colors.brandPrimary,
              fontWeight: 700,
              py: 1.5,
              borderRadius: designSystem.borderRadius.md,
              fontFamily: designSystem.typography.fontFamily.primary,
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
              },
            }}
          >
            Begin Quiz →
          </Button>
        </CardContent>
      </Card>

      {/* Total Quizzes Card */}
      <Card 
        sx={{
          gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 3' },
          borderRadius: designSystem.borderRadius.bento,
          background: designSystem.colors.accentYellowDark,
          color: designSystem.colors.textDark,
          boxShadow: designSystem.shadows.bento,
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: designSystem.shadows.hover,
          },
        }}
      >
        <CardContent sx={{ p: designSystem.spacing.md }}>
          <Box 
            sx={{ 
              width: 56, 
              height: 56, 
              borderRadius: designSystem.borderRadius.md,
              bgcolor: 'rgba(26, 26, 26, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <TrendingUp sx={{ fontSize: 28, color: designSystem.colors.textDark }} />
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
            {stats?.totalQuizzesTaken || 0}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.8, 
              fontWeight: 500,
              fontFamily: designSystem.typography.fontFamily.primary,
            }}
          >
            Total Quizzes
          </Typography>
        </CardContent>
      </Card>

      {/* Day Streak Card - Orange if 0, Red if >0 */}
      <Card 
        sx={{
          gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 3' },
          borderRadius: designSystem.borderRadius.bento,
          background: (stats?.streakDays || 0) === 0 
            ? designSystem.colors.accentOrange 
            : designSystem.colors.brandPrimary,
          color: designSystem.colors.textLight,
          boxShadow: designSystem.shadows.bento,
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: designSystem.shadows.hover,
          },
        }}
      >
        <CardContent sx={{ p: designSystem.spacing.md }}>
          <Box 
            sx={{ 
              width: 56, 
              height: 56, 
              borderRadius: designSystem.borderRadius.md,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Timeline sx={{ fontSize: 28, color: '#fff' }} />
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
            {stats?.streakDays || 0}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.9, 
              fontWeight: 500,
              fontFamily: designSystem.typography.fontFamily.primary,
            }}
          >
            Day Streak {(stats?.streakDays || 0) > 0 ? '🔥' : ''}
          </Typography>
        </CardContent>
      </Card>

      {/* Average Score Card */}
      <Card 
        sx={{
          gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 3' },
          borderRadius: designSystem.borderRadius.bento,
          background: designSystem.colors.accentGreen,
          color: designSystem.colors.textDark,
          boxShadow: designSystem.shadows.bento,
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: designSystem.shadows.hover,
          },
        }}
      >
        <CardContent sx={{ p: designSystem.spacing.md }}>
          <Box 
            sx={{ 
              width: 56, 
              height: 56, 
              borderRadius: designSystem.borderRadius.md,
              bgcolor: 'rgba(26, 26, 26, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Assessment sx={{ fontSize: 28, color: designSystem.colors.textDark }} />
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
            {stats?.averageScore ? `${stats.averageScore.toFixed(0)}%` : '0%'}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.8, 
              fontWeight: 500,
              fontFamily: designSystem.typography.fontFamily.primary,
            }}
          >
            Average Score
          </Typography>
        </CardContent>
      </Card>

      {/* SWOT Analysis Card - Lighter Yellow */}
      <Card 
        sx={{
          gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 3' },
          borderRadius: designSystem.borderRadius.bento,
          background: designSystem.colors.accentYellow,
          color: designSystem.colors.textDark,
          boxShadow: designSystem.shadows.bento,
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: designSystem.shadows.hover,
          },
        }}
      >
        <CardContent sx={{ p: designSystem.spacing.md }}>
          <Box 
            sx={{ 
              width: 56, 
              height: 56, 
              borderRadius: designSystem.borderRadius.md,
              bgcolor: 'rgba(26, 26, 26, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <SelfImprovement sx={{ fontSize: 28, color: designSystem.colors.textDark }} />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              mb: 1,
              fontFamily: designSystem.typography.fontFamily.display,
            }}
          >
            SWOT Analysis
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.75, 
              mb: 2, 
              fontWeight: 500,
              fontFamily: designSystem.typography.fontFamily.primary,
              fontSize: '0.875rem',
            }}
          >
            Identify strengths & areas to improve
          </Typography>
          <Button 
            variant="contained"
            size="small"
            fullWidth
            disabled
            sx={{
              bgcolor: 'rgba(26, 26, 26, 0.08)',
              color: designSystem.colors.textDark,
              fontWeight: 600,
              borderRadius: designSystem.borderRadius.md,
              fontFamily: designSystem.typography.fontFamily.primary,
              textTransform: 'none',
              '&.Mui-disabled': {
                bgcolor: 'rgba(26, 26, 26, 0.08)',
                color: 'rgba(26, 26, 26, 0.4)',
              },
            }}
          >
            Coming Soon
          </Button>
        </CardContent>
      </Card>
    </>
  )
}

export default StatsCards
