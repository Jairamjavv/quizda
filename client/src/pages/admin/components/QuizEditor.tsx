import React from 'react'
import { Paper, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Box, Chip, Button, Switch, FormControlLabel } from '@mui/material'
import { Save, Cancel } from '@mui/icons-material'
import type { Quiz, Group } from '../types'
import { designSystem } from '../../../theme/designSystem'

interface Props {
  quizForm: any
  setQuizForm: (updater: any) => void
  groups: Group[]
  onSave: () => void
  onCancel: () => void
  tags: string[]
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  newTag: string
  setNewTag: (s: string) => void
}

/**
 * QuizEditor
 * Shows quiz details form and small stats box.
 */
const QuizEditor: React.FC<Props> = ({ quizForm, setQuizForm, groups, onSave, onCancel, addTag, removeTag, newTag, setNewTag }) => {
  return (
    <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.02)' }}>
      <Typography variant="h6" gutterBottom sx={{ fontFamily: designSystem.typography.fontFamily.display }}>Quiz Details</Typography>

      <TextField fullWidth label="Title" value={quizForm.title}
        onChange={(e) => setQuizForm((prev: any) => ({ ...prev, title: e.target.value }))} sx={{ mb: 2 }} />

      <TextField fullWidth multiline rows={3} label="Description" value={quizForm.description}
        onChange={(e) => setQuizForm((prev: any) => ({ ...prev, description: e.target.value }))} sx={{ mb: 2 }} />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Group</InputLabel>
        <Select value={quizForm.group_id} onChange={(e) => setQuizForm((prev: any) => ({ ...prev, group_id: e.target.value }))}>
          <MenuItem value="">No Group</MenuItem>
          {groups.map(g => <MenuItem key={g._id} value={g._id}>{g.name}</MenuItem>)}
        </Select>
      </FormControl>

      <Box mb={2}>
        <Typography variant="subtitle2" gutterBottom>Tags</Typography>
        <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
          {quizForm.tags.map((tag: string) => (
            <Chip key={tag} label={tag} onDelete={() => removeTag(tag)} size="small" />
          ))}
        </Box>
        <Box display="flex" gap={1}>
          <TextField size="small" placeholder="Add tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} />
          <Button onClick={() => addTag(newTag)} disabled={!newTag.trim()}>Add</Button>
        </Box>
      </Box>

      <FormControlLabel control={<Switch checked={quizForm.is_published} onChange={(e) => setQuizForm((prev: any) => ({ ...prev, is_published: e.target.checked }))} />} label="Published" />

      <Box display="flex" gap={2} mt={3}>
        <Button variant="contained" startIcon={<Save />} onClick={onSave}>Save Quiz</Button>
        <Button variant="outlined" startIcon={<Cancel />} onClick={onCancel}>Cancel</Button>
      </Box>
    </Paper>
  )
}

export default QuizEditor
