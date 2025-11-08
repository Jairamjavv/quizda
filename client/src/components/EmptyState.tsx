import React from 'react'
import { Box, Typography } from '@mui/material'
import { designSystem } from '../theme/designSystem'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  message?: string
  action?: React.ReactNode
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action
}) => {
  return (
    <Box 
      sx={{ 
        textAlign: 'center', 
        py: { xs: 6, md: 8 },
        px: 2,
      }}
    >
      {icon && (
        <Box
          sx={{
            mb: 3,
            color: designSystem.colors.textMuted,
            opacity: 0.4,
            display: 'flex',
            justifyContent: 'center',
            '& svg': {
              fontSize: { xs: 48, sm: 64 }
            }
          }}
        >
          {icon}
        </Box>
      )}
      
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{
          color: designSystem.colors.textLight,
          fontFamily: designSystem.typography.fontFamily.display,
          fontWeight: 600,
          mb: 1,
        }}
      >
        {title}
      </Typography>
      
      {message && (
        <Typography 
          variant="body2" 
          sx={{
            color: designSystem.colors.textMuted,
            fontFamily: designSystem.typography.fontFamily.primary,
            mb: action ? 3 : 0,
            maxWidth: '400px',
            mx: 'auto',
          }}
        >
          {message}
        </Typography>
      )}
      
      {action && (
        <Box sx={{ mt: 3 }}>
          {action}
        </Box>
      )}
    </Box>
  )
}

export default EmptyState
