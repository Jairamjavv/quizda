import React from 'react'
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Typography
} from '@mui/material'
import { designSystem } from '../theme/designSystem'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'primary' | 'error' | 'warning'
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary'
}) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const colorMap = {
    primary: designSystem.colors.brandPrimary,
    error: designSystem.colors.brandPrimary,
    warning: designSystem.colors.accentOrange,
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: designSystem.borderRadius.md,
          bgcolor: designSystem.colors.lightSurface,
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          fontFamily: designSystem.typography.fontFamily.display,
          fontWeight: 700,
          color: designSystem.colors.textDark,
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography 
          sx={{ 
            fontFamily: designSystem.typography.fontFamily.primary,
            color: designSystem.colors.textDark,
          }}
        >
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose}
          sx={{
            fontFamily: designSystem.typography.fontFamily.primary,
            textTransform: 'none',
            color: designSystem.colors.textMuted,
          }}
        >
          {cancelText}
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained"
          sx={{
            fontFamily: designSystem.typography.fontFamily.primary,
            textTransform: 'none',
            bgcolor: colorMap[confirmColor],
            '&:hover': {
              bgcolor: colorMap[confirmColor],
              filter: 'brightness(0.9)',
            }
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog
