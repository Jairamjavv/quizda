import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip
} from '@mui/material'
import {
  Quiz,
  Schedule,
  CheckCircle,
  Cancel
} from '@mui/icons-material'
import { designSystem } from '../../../theme/designSystem'

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

interface RecentActivityProps {
  recentAttempts: RecentAttempt[] | undefined
  onViewHistory: () => void
}

const RecentActivity: React.FC<RecentActivityProps> = ({ recentAttempts, onViewHistory }) => {
  return (
    <Card 
      sx={{
        gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 12' },
        borderRadius: designSystem.borderRadius.bento,
        boxShadow: designSystem.shadows.subtle,
        bgcolor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        '&:hover': {
          boxShadow: designSystem.shadows.bento,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: designSystem.spacing.md }}>
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={3}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Schedule sx={{ color: designSystem.colors.accentBlue, fontSize: 24 }} />
            <Typography 
              variant="h6"
              sx={{
                fontWeight: 600,
                color: designSystem.colors.textLight,
                fontFamily: designSystem.typography.fontFamily.display,
                fontSize: '1.1rem',
              }}
            >
              Recent Activity
            </Typography>
          </Box>
          <Button 
            variant="text" 
            onClick={onViewHistory}
            size="small"
            sx={{
              color: designSystem.colors.accentBlue,
              fontWeight: 600,
              fontFamily: designSystem.typography.fontFamily.primary,
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': {
                bgcolor: `${designSystem.colors.accentBlue}15`,
              },
            }}
          >
            View All →
          </Button>
        </Box>
        {recentAttempts && recentAttempts.length > 0 ? (
          <Box>
            {recentAttempts.slice(0, 3).map((attempt) => {
              const percentage = (attempt.score / attempt.max_points) * 100
              const passed = percentage >= 60
              
              return (
                <Box 
                  key={attempt.id}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: designSystem.borderRadius.sm,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: designSystem.colors.accentBlue,
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
                        <Typography 
                          variant="body1" 
                          fontWeight={600}
                          fontFamily={designSystem.typography.fontFamily.primary}
                          color={designSystem.colors.textLight}
                        >
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
                            fontFamily: designSystem.typography.fontFamily.primary,
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
                              bgcolor: 'rgba(255, 255, 255, 0.05)',
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontFamily: designSystem.typography.fontFamily.primary,
                              fontSize: '11px',
                              height: '22px',
                            }}
                          />
                        ))}
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontFamily: designSystem.typography.fontFamily.primary,
                          }}
                        >
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
                        fontFamily={designSystem.typography.fontFamily.mono}
                        color={percentage >= 75 
                          ? designSystem.colors.accentGreen 
                          : percentage >= 60 
                          ? designSystem.colors.accentYellowDark 
                          : 'rgba(255, 255, 255, 0.4)'}
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
          <Box sx={{ textAlign: 'center', py: 6, color: 'rgba(255, 255, 255, 0.3)' }}>
            <Quiz sx={{ fontSize: 64, opacity: 0.2, mb: 2 }} />
            <Typography 
              variant="body1" 
              color="rgba(255, 255, 255, 0.5)"
              fontFamily={designSystem.typography.fontFamily.primary}
            >
              Complete your first quiz to see activity
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentActivity
