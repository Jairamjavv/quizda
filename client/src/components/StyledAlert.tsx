import React from 'react'
import { Alert } from '@mui/material'
import type { AlertProps } from '@mui/material'
import { designSystem } from '../theme/designSystem'

interface StyledAlertProps extends Omit<AlertProps, 'severity' | 'variant'> {
  severity?: 'error' | 'warning' | 'info' | 'success'
  alertVariant?: 'dark' | 'light'
}

const StyledAlert: React.FC<StyledAlertProps> = ({ 
  severity = 'error',
  alertVariant = 'dark',
  sx,
  children,
  ...props 
}) => {
  const severityColors = {
    error: designSystem.colors.brandPrimary,
    warning: designSystem.colors.accentOrange,
    info: designSystem.colors.accentBlue,
    success: designSystem.colors.accentGreen,
  }

  const color = severityColors[severity]

  const darkStyles = {
    borderRadius: designSystem.borderRadius.md,
    bgcolor: `${color}15`,
    color: color,
    border: `1px solid ${color}`,
    fontFamily: designSystem.typography.fontFamily.primary,
    '& .MuiAlert-icon': {
      color: color,
    }
  }

  const lightStyles = {
    borderRadius: designSystem.borderRadius.md,
    fontFamily: designSystem.typography.fontFamily.primary,
  }

  return (
    <Alert
      severity={severity}
      {...props}
      sx={{
        ...(alertVariant === 'dark' ? darkStyles : lightStyles),
        ...sx
      }}
    >
      {children}
    </Alert>
  )
}

export default StyledAlert
