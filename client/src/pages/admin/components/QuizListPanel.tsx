import React from 'react'
import { Box, Paper, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Button } from '@mui/material'
import { Add, Delete, Edit } from '@mui/icons-material'
import type { Quiz, Group } from '../types'
import { ListItemButton, ListItemIcon } from '@mui/material'

interface Props {
  quizzes: Quiz[]
  groups: Group[]
  onSelectQuiz: (quizId: string) => void
  onCreate: () => void
  onDelete: (quizId: string) => void
}

/**
 * QuizListPanel
 * Simple left-hand panel showing quizzes list and controls.
 */
const QuizListPanel: React.FC<Props> = ({ quizzes, groups, onSelectQuiz, onCreate, onDelete }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Quizzes</Typography>
        <Button startIcon={<Add />} variant="contained" size="small" onClick={onCreate}>New</Button>
      </Box>

      <List dense>
        {quizzes.map(q => (
          <ListItem key={q._id} disablePadding>
            <ListItemButton onClick={() => onSelectQuiz(q._id)}>
              <ListItemText primary={q.title} secondary={q.tags.join(', ')} />
            </ListItemButton>
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => onSelectQuiz(q._id)} aria-label="edit">
                <Edit />
              </IconButton>
              <IconButton edge="end" onClick={() => onDelete(q._id)} aria-label="delete">
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}

export default QuizListPanel
