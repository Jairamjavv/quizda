import React from 'react'
import { Box, Button } from '@mui/material'
import { ArrowBack, ArrowForward } from '@mui/icons-material'
import { designSystem } from '../../../theme/designSystem'

interface QuizNavigationProps {
  currentIndex: number
  totalQuestions: number
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
}

const QuizNavigation: React.FC<QuizNavigationProps> = ({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit,
}) => {
  const isFirst = currentIndex === 0
  const isLast = currentIndex === totalQuestions - 1

  return (
    <Box display="flex" justifyContent="space-between" gap={2}>
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={onPrevious}
        disabled={isFirst}
        sx={{
          borderColor: 'rgba(255, 255, 255, 0.2)',
          color: designSystem.colors.textLight,
          '&:hover': {
            borderColor: designSystem.colors.accentBlue,
            bgcolor: 'rgba(107, 194, 245, 0.1)',
          },
          '&.Mui-disabled': {
            borderColor: 'rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.3)',
          }
        }}
      >
        Previous
      </Button>

      {isLast ? (
        <Button
          variant="contained"
          onClick={onSubmit}
          sx={{
            bgcolor: designSystem.colors.accentGreen,
            color: designSystem.colors.textDark,
            fontWeight: 700,
            px: 4,
            '&:hover': {
              bgcolor: designSystem.colors.accentGreen,
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(125, 214, 141, 0.3)',
            }
          }}
        >
          Submit Quiz
        </Button>
      ) : (
        <Button
          variant="contained"
          endIcon={<ArrowForward />}
          onClick={onNext}
          sx={{
            bgcolor: designSystem.colors.brandPrimary,
            color: designSystem.colors.textLight,
            fontWeight: 700,
            '&:hover': {
              bgcolor: designSystem.colors.brandHover,
            }
          }}
        >
          Next
        </Button>
      )}
    </Box>
  )
}

export default QuizNavigation
