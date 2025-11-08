import React from 'react'
import { TextField } from '@mui/material'
import type { TextFieldProps } from '@mui/material'
import { designSystem } from '../theme/designSystem'

type StyledTextFieldProps = TextFieldProps & {
  darkMode?: boolean
}

const StyledTextField: React.FC<StyledTextFieldProps> = ({ 
  darkMode = true,
  sx,
  ...props 
}) => {
  const darkStyles = {
    '& .MuiOutlinedInput-root': {
      color: designSystem.colors.textLight,
      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
      '&:hover fieldset': { borderColor: designSystem.colors.accentBlue },
      '&.Mui-focused fieldset': { borderColor: designSystem.colors.brandPrimary },
    },
    '& .MuiInputLabel-root': { 
      color: 'rgba(255, 255, 255, 0.6)',
      fontFamily: designSystem.typography.fontFamily.primary,
    },
    '& .MuiInputBase-input': {
      fontFamily: designSystem.typography.fontFamily.primary,
    },
  }

  const lightStyles = {
    '& .MuiOutlinedInput-root': {
      color: designSystem.colors.textDark,
      '& fieldset': { borderColor: 'rgba(26, 26, 26, 0.2)' },
      '&:hover fieldset': { borderColor: designSystem.colors.accentBlue },
      '&.Mui-focused fieldset': { borderColor: designSystem.colors.brandPrimary },
    },
    '& .MuiInputLabel-root': { 
      color: 'rgba(26, 26, 26, 0.6)',
      fontFamily: designSystem.typography.fontFamily.primary,
    },
    '& .MuiInputBase-input': {
      fontFamily: designSystem.typography.fontFamily.primary,
    },
  }

  return (
    <TextField
      {...props}
      sx={{
        ...(darkMode ? darkStyles : lightStyles),
        ...sx
      }}
    />
  )
}

export default StyledTextField
