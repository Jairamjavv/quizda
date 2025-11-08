import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  TextField,
  Chip,
  IconButton,
} from '@mui/material'
import { Flag, FlagOutlined } from '@mui/icons-material'
import { designSystem } from '../../../theme/designSystem'

type QuestionType = 'mcq_single' | 'mcq_multiple' | 'true_false' | 'fill_blanks'

interface Choice {
  id: string
  text: string
  is_correct: boolean
}

interface Question {
  _id: string
  text: string
  choices: Choice[]
  points: number
  tags: string[]
  order: number
  question_type?: QuestionType
  correct_answers?: string[]
}

interface QuizQuestionProps {
  question: Question
  answer: string | string[] | undefined
  isFlagged: boolean
  onAnswerChange: (questionId: string, answer: string | string[]) => void
  onFlagToggle: (questionId: string) => void
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  answer,
  isFlagged,
  onAnswerChange,
  onFlagToggle,
}) => {
  const questionType = question.question_type || 'mcq_single'

  const handleSingleChoiceChange = (choiceId: string) => {
    onAnswerChange(question._id, choiceId)
  }

  const handleMultipleChoiceChange = (choiceId: string, checked: boolean) => {
    const currentAnswers = Array.isArray(answer) ? answer : []
    const newAnswers = checked
      ? [...currentAnswers, choiceId]
      : currentAnswers.filter(id => id !== choiceId)
    onAnswerChange(question._id, newAnswers)
  }

  const handleTextChange = (text: string) => {
    onAnswerChange(question._id, text)
  }

  return (
    <Paper 
      sx={{ 
        p: 4,
        bgcolor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: designSystem.borderRadius.bento,
        boxShadow: designSystem.shadows.bento,
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box flex={1}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              color: designSystem.colors.textLight,
              fontWeight: 600 
            }}
          >
            {question.text}
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
            {question.tags.map(tag => (
              <Chip 
                key={tag} 
                label={tag} 
                size="small"
                sx={{
                  bgcolor: 'rgba(107, 194, 245, 0.15)',
                  color: designSystem.colors.accentBlue,
                  border: `1px solid ${designSystem.colors.accentBlue}`,
                }}
              />
            ))}
            <Chip 
              label={`${question.points} points`} 
              size="small"
              sx={{
                bgcolor: 'rgba(245, 224, 153, 0.15)',
                color: designSystem.colors.accentYellow,
                border: `1px solid ${designSystem.colors.accentYellow}`,
              }}
            />
          </Box>
        </Box>
        <IconButton 
          onClick={() => onFlagToggle(question._id)}
          sx={{ 
            color: isFlagged ? designSystem.colors.brandPrimary : designSystem.colors.textLight 
          }}
        >
          {isFlagged ? <Flag /> : <FlagOutlined />}
        </IconButton>
      </Box>

      <FormControl component="fieldset" fullWidth sx={{ mt: 3 }}>
        {questionType === 'mcq_single' && (
          <RadioGroup 
            value={answer || ''} 
            onChange={(e) => handleSingleChoiceChange(e.target.value)}
          >
            {question.choices.map(choice => (
              <FormControlLabel
                key={choice.id}
                value={choice.id}
                control={<Radio />}
                label={<Typography sx={{ color: designSystem.colors.textLight }}>{choice.text}</Typography>}
                sx={{ 
                  mb: 1,
                  p: 1.5,
                  borderRadius: designSystem.borderRadius.sm,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  bgcolor: answer === choice.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' }
                }}
              />
            ))}
          </RadioGroup>
        )}

        {questionType === 'mcq_multiple' && (
          <Box>
            <FormLabel sx={{ color: designSystem.colors.textLight, mb: 1 }}>
              Select all that apply
            </FormLabel>
            {question.choices.map(choice => (
              <FormControlLabel
                key={choice.id}
                control={
                  <Checkbox 
                    checked={Array.isArray(answer) && answer.includes(choice.id)}
                    onChange={(e) => handleMultipleChoiceChange(choice.id, e.target.checked)}
                  />
                }
                label={<Typography sx={{ color: designSystem.colors.textLight }}>{choice.text}</Typography>}
                sx={{ 
                  display: 'block',
                  mb: 1,
                  p: 1.5,
                  borderRadius: designSystem.borderRadius.sm,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  bgcolor: Array.isArray(answer) && answer.includes(choice.id) 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' }
                }}
              />
            ))}
          </Box>
        )}

        {questionType === 'true_false' && (
          <RadioGroup 
            value={answer || ''} 
            onChange={(e) => handleSingleChoiceChange(e.target.value)}
          >
            {question.choices.map(choice => (
              <FormControlLabel
                key={choice.id}
                value={choice.id}
                control={<Radio />}
                label={<Typography sx={{ color: designSystem.colors.textLight }}>{choice.text}</Typography>}
                sx={{ 
                  mb: 1,
                  p: 1.5,
                  borderRadius: designSystem.borderRadius.sm,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  bgcolor: answer === choice.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' }
                }}
              />
            ))}
          </RadioGroup>
        )}

        {questionType === 'fill_blanks' && (
          <TextField
            fullWidth
            multiline
            rows={3}
            value={answer || ''}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type your answer here..."
            sx={{
              '& .MuiOutlinedInput-root': {
                color: designSystem.colors.textLight,
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: designSystem.colors.accentBlue },
                '&.Mui-focused fieldset': { borderColor: designSystem.colors.brandPrimary },
              },
            }}
          />
        )}
      </FormControl>
    </Paper>
  )
}

export default QuizQuestion
