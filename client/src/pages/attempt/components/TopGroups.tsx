import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip
} from '@mui/material'
import { Assessment } from '@mui/icons-material'
import { designSystem } from '../../../theme/designSystem'

interface GroupStat {
  id: string
  name: string
  attemptCount: number
  averageScore: number
}

interface TopGroupsProps {
  groups: GroupStat[]
}

const TopGroups: React.FC<TopGroupsProps> = ({ groups }) => {
  const topGroups = groups
    .filter(g => g.attemptCount > 0)
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 5)

  return (
    <Card 
      sx={{
        gridColumn: { xs: 'span 1', sm: 'span 6', md: 'span 6' },
        borderRadius: designSystem.borderRadius.bento,
        boxShadow: designSystem.shadows.bento,
        bgcolor: designSystem.colors.lightSurface,
        '&:hover': {
          boxShadow: designSystem.shadows.hover,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: designSystem.spacing.md }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Assessment 
            sx={{ 
              mr: 1.5, 
              color: designSystem.colors.accentGreen, 
              fontSize: 28,
            }} 
          />
          <Typography 
            variant="h6"
            sx={{ 
              fontWeight: 700,
              color: designSystem.colors.textDark,
              fontFamily: designSystem.typography.fontFamily.display,
            }}
          >
            Top Groups
          </Typography>
        </Box>
        <Box>
          {topGroups.map((group, index) => (
            <Box 
              key={group.id} 
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                mb: 1.5,
                borderRadius: designSystem.borderRadius.sm,
                bgcolor: 'rgba(26, 26, 26, 0.03)',
                border: `1px solid rgba(26, 26, 26, 0.08)`,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'rgba(26, 26, 26, 0.05)',
                  transform: 'translateX(6px)',
                  borderColor: designSystem.colors.accentGreen,
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
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
                    fontSize: '14px',
                    fontFamily: designSystem.typography.fontFamily.mono,
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
                    fontFamily: designSystem.typography.fontFamily.primary,
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
                    ? designSystem.colors.accentYellowDark 
                    : 'rgba(26, 26, 26, 0.15)',
                  color: designSystem.colors.textDark,
                  fontWeight: 700,
                  fontFamily: designSystem.typography.fontFamily.mono,
                  fontSize: '13px',
                }}
              />
            </Box>
          ))}
          {topGroups.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4, color: 'rgba(26, 26, 26, 0.4)' }}>
              <Typography variant="body2" sx={{ fontFamily: designSystem.typography.fontFamily.primary }}>
                No groups attempted yet
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default TopGroups
