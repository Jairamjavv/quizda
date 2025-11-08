import React from 'react'
import { Paper } from '@mui/material'
import type { PaperProps } from '@mui/material'
import { designSystem } from '../theme/designSystem'

interface StyledCardProps extends Omit<PaperProps, 'elevation' | 'variant'> {
  cardVariant?: 'dark' | 'light' | 'transparent'
  hover?: boolean
}

const StyledCard: React.FC<StyledCardProps> = ({ 
  cardVariant = 'dark',
  hover = false,
  sx,
  children,
  ...props 
}) => {
  const variantStyles = {
    dark: {
      bgcolor: 'rgba(255, 255, 255, 0.03)',
      borderRadius: designSystem.borderRadius.bento,
      boxShadow: designSystem.shadows.bento,
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    light: {
      bgcolor: designSystem.colors.lightSurface,
      borderRadius: designSystem.borderRadius.bento,
      boxShadow: designSystem.shadows.bento,
      border: 'none',
    },
    transparent: {
      bgcolor: 'transparent',
      borderRadius: designSystem.borderRadius.md,
      boxShadow: 'none',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }
  }

  const hoverStyles = hover ? {
    transition: designSystem.animations.transition.default,
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: designSystem.shadows.hover,
    }
  } : {}

  return (
    <Paper
      elevation={0}
      {...props}
      sx={{
        ...variantStyles[cardVariant],
        ...hoverStyles,
        ...sx
      }}
    >
      {children}
    </Paper>
  )
}

export default StyledCard
