import React from 'react'
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, IconButton, Chip } from '@mui/material'
import { ExpandMore, Edit, Delete, Visibility, VisibilityOff } from '@mui/icons-material'
import type { Question } from '../types'

interface Props {
  questions: Question[]
  onEdit: (q: Question) => void
  onDelete: (id: string) => void
}

/**
 * QuestionSection
 * Renders list of questions as accordions. UI-only component.
 */
const QuestionSection: React.FC<Props> = ({ questions, onEdit, onDelete }) => {
  return (
    <Box>
      {questions.map((question, index) => (
        <Accordion key={question._id} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography sx={{ fontWeight: 600 }}>{index + 1}. {question.text}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="subtitle2">Points: {question.points}</Typography>
            <Box mt={1} display="flex" gap={1} flexWrap="wrap">
              {question.tags.map(t => <Chip key={t} label={t} size="small" />)}
            </Box>
            <Box mt={2} display="flex" gap={1}>
              <IconButton onClick={() => onEdit(question)} aria-label="edit"><Edit /></IconButton>
              <IconButton onClick={() => onDelete(question._id)} aria-label="delete"><Delete /></IconButton>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}

export default QuestionSection
