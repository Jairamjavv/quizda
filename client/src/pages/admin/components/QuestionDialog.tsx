import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material'
import type { Question } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  questionForm: any
  setQuestionForm: (updater: any) => void
  onSave: () => void
}

/**
 * QuestionDialog
 * Small dialog used for creating/editing a question. Keeps structure minimal.
 */
const QuestionDialog: React.FC<Props> = ({ open, onClose, questionForm, setQuestionForm, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{questionForm._id ? 'Edit Question' : 'Add Question'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <TextField fullWidth label="Question Text" value={questionForm.text} onChange={(e) => setQuestionForm((p: any) => ({ ...p, text: e.target.value }))} sx={{ mb: 2 }} />
          <TextField fullWidth label="Points" type="number" value={questionForm.points} onChange={(e) => setQuestionForm((p: any) => ({ ...p, points: Number(e.target.value) }))} sx={{ mb: 2 }} />
          {/* Choices and other fields can be extended later */}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSave}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default QuestionDialog
