import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material'
import { designSystem } from '../../../theme/designSystem'

interface SubmitConfirmationDialogProps {
  open: boolean
  answeredCount: number
  totalCount: number
  onConfirm: () => void
  onCancel: () => void
}

const SubmitConfirmationDialog: React.FC<SubmitConfirmationDialogProps> = ({
  open,
  answeredCount,
  totalCount,
  onConfirm,
  onCancel,
}) => {
  const unansweredCount = totalCount - answeredCount

  return (
    <Dialog 
      open={open} 
      onClose={onCancel}
      PaperProps={{
        sx: {
          bgcolor: designSystem.colors.darkBg,
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }
      }}
    >
      <DialogTitle sx={{ color: designSystem.colors.textLight }}>
        Submit Quiz?
      </DialogTitle>
      <DialogContent>
        <Box>
          <Typography sx={{ color: designSystem.colors.textLight, mb: 2 }}>
            Are you sure you want to submit your quiz?
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Answered: {answeredCount} / {totalCount}
          </Typography>
          {unansweredCount > 0 && (
            <Typography sx={{ color: designSystem.colors.brandPrimary, mt: 1 }}>
              Warning: You have {unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} sx={{ color: designSystem.colors.textLight }}>
          Review Answers
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained"
          sx={{
            bgcolor: designSystem.colors.accentGreen,
            color: designSystem.colors.textDark,
            fontWeight: 700,
            '&:hover': {
              bgcolor: designSystem.colors.accentGreen,
              transform: 'translateY(-2px)',
            }
          }}
        >
          Submit Quiz
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SubmitConfirmationDialog
