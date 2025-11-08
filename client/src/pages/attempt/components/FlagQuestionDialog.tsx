import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material'
import { designSystem } from '../../../theme/designSystem'

interface FlagQuestionDialogProps {
  open: boolean
  onClose: () => void
  onSave: (reason: string) => void
}

const FlagQuestionDialog: React.FC<FlagQuestionDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [reason, setReason] = useState('')

  const handleSave = () => {
    onSave(reason)
    setReason('')
  }

  const handleClose = () => {
    setReason('')
    onClose()
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      PaperProps={{
        sx: {
          bgcolor: designSystem.colors.darkBg,
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }
      }}
    >
      <DialogTitle sx={{ color: designSystem.colors.textLight }}>
        Flag Question
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          multiline
          rows={4}
          label="Reason for flagging (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{
            mt: 1,
            '& .MuiOutlinedInput-root': {
              color: designSystem.colors.textLight,
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
              '&:hover fieldset': { borderColor: designSystem.colors.accentBlue },
              '&.Mui-focused fieldset': { borderColor: designSystem.colors.brandPrimary },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ color: designSystem.colors.textLight }}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          sx={{
            bgcolor: designSystem.colors.brandPrimary,
            '&:hover': { bgcolor: designSystem.colors.brandHover }
          }}
        >
          Flag Question
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default FlagQuestionDialog
