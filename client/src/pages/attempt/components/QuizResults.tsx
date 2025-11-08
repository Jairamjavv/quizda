import React from 'react'
import { Box, Container, Paper, Typography, Button } from '@mui/material'
import { designSystem } from '../../../theme/designSystem'

interface QuizResultsProps {
  score: number
  maxPoints: number
  onRetakeQuiz: () => void
  onViewHistory: () => void
}

const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  maxPoints,
  onRetakeQuiz,
  onViewHistory,
}) => {
  const percentage = Math.round((score / maxPoints) * 100)

  return (
    <Box sx={{ bgcolor: designSystem.colors.darkBg, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Paper 
          sx={{ 
            p: 4,
            bgcolor: designSystem.colors.lightSurface,
            borderRadius: designSystem.borderRadius.bento,
            boxShadow: designSystem.shadows.bento,
          }}
        >
          <Typography 
            variant="h4" 
            gutterBottom 
            align="center"
            sx={{ 
              color: designSystem.colors.textDark,
              fontFamily: designSystem.typography.fontFamily.display,
              fontWeight: 700 
            }}
          >
            Quiz Complete!
          </Typography>
          <Box textAlign="center" mb={3}>
            <Typography 
              variant="h2" 
              sx={{ 
                color: percentage >= 75 
                  ? designSystem.colors.accentGreen 
                  : percentage >= 60 
                  ? designSystem.colors.accentYellow 
                  : designSystem.colors.brandPrimary,
                fontFamily: designSystem.typography.fontFamily.mono,
                fontWeight: 800
              }}
            >
              {percentage}%
            </Typography>
            <Typography 
              variant="h6"
              sx={{ 
                color: designSystem.colors.textDark,
                fontFamily: designSystem.typography.fontFamily.mono 
              }}
            >
              {score} / {maxPoints} points
            </Typography>
          </Box>
          <Box display="flex" gap={2} justifyContent="center">
            <Button
              variant="contained"
              onClick={onRetakeQuiz}
              sx={{
                bgcolor: designSystem.colors.brandPrimary,
                color: designSystem.colors.textLight,
                borderRadius: designSystem.borderRadius.sm,
                py: 1.5,
                px: 4,
                fontWeight: 700,
                '&:hover': {
                  bgcolor: designSystem.colors.brandHover,
                }
              }}
            >
              Take Another Quiz
            </Button>
            <Button
              variant="outlined"
              onClick={onViewHistory}
              sx={{
                borderColor: designSystem.colors.brandPrimary,
                color: designSystem.colors.textDark,
                borderRadius: designSystem.borderRadius.sm,
                py: 1.5,
                px: 4,
                fontWeight: 700,
                '&:hover': {
                  borderColor: designSystem.colors.brandHover,
                  bgcolor: 'rgba(245, 72, 72, 0.1)',
                }
              }}
            >
              View Detailed Results
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default QuizResults
