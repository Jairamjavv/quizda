import React from 'react'
import { Box } from '@mui/material'
import SandglassLoader from './SandglassLoader'
import { designSystem } from '../theme/designSystem'

interface LoadingScreenProps {
  size?: number
  color?: string
  message?: string
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  size = 80, 
  color = designSystem.colors.brandPrimary,
  message 
}) => {
  return (
    <Box 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      gap={2}
      sx={{ 
        bgcolor: designSystem.colors.darkBg,
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        animation: 'fadeIn 300ms ease-in',
      }}
    >
      <SandglassLoader size={size} color={color} />
      {message && (
        <Box 
          sx={{ 
            color: designSystem.colors.textMuted,
            fontFamily: designSystem.typography.fontFamily.primary,
            fontSize: '14px',
            mt: 2
          }}
        >
          {message}
        </Box>
      )}
    </Box>
  )
}

export default LoadingScreen
