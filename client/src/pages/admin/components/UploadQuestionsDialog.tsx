import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Alert } from '@mui/material'

interface Props {
  open: boolean
  onClose: () => void
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploadError?: string
  onDownloadTemplate: () => void
}

/**
 * UploadQuestionsDialog
 * Handles file input and shows validation errors returned by the parent.
 */
const UploadQuestionsDialog: React.FC<Props> = ({ open, onClose, onFileUpload, uploadError, onDownloadTemplate }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Upload Questions (JSON)</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <input type="file" accept="application/json" onChange={onFileUpload} />
          <Box mt={2}>
            <Button variant="outlined" onClick={onDownloadTemplate}>Download Template</Button>
          </Box>
          {uploadError && <Alert severity="error" sx={{ mt: 2 }}>{uploadError}</Alert>}
          <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
            The JSON must be an array of question objects. See template for structure.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default UploadQuestionsDialog
