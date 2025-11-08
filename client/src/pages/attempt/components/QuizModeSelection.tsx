import React from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { designSystem } from '../../../theme/designSystem'

interface Quiz {
  _id: string
  title: string
  description: string
  total_points: number
  tags: string[]
  group_id?: string
}

interface Group {
  _id: string
  name: string
  description: string
}

interface QuizModeSelectionProps {
  availableGroups: Group[]
  availableQuizzes: Quiz[]
  selectedGroupId: string
  selectedQuizId: string
  onGroupChange: (groupId: string) => void
  onQuizChange: (quizId: string) => void
  onModeSelect: (mode: 'timed' | 'zen', duration?: number) => void
  onBack: () => void
}

const QuizModeSelection: React.FC<QuizModeSelectionProps> = ({
  availableGroups,
  availableQuizzes,
  selectedGroupId,
  selectedQuizId,
  onGroupChange,
  onQuizChange,
  onModeSelect,
  onBack,
}) => {
  const filteredQuizzes = availableQuizzes.filter(q => 
    selectedGroupId === 'all' || q.group_id === selectedGroupId
  )

  return (
    <Box sx={{ bgcolor: designSystem.colors.darkBg, color: designSystem.colors.textLight, minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: designSystem.colors.darkBg, boxShadow: 'none', borderBottom: `1px solid rgba(255, 255, 255, 0.1)` }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onBack}
            sx={{ 
              mr: 2,
              color: designSystem.colors.textLight,
              '&:hover': { bgcolor: `${designSystem.colors.brandPrimary}25` }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: designSystem.colors.textLight,
              fontFamily: designSystem.typography.fontFamily.display 
            }}
          >
            Quiz Mode Selection
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper 
          sx={{ 
            p: 4,
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            color: designSystem.colors.textLight,
            borderRadius: designSystem.borderRadius.bento,
            boxShadow: designSystem.shadows.bento,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Group and Quiz Selection */}
          <Box mb={4}>
            <Typography 
              variant="h5" 
              gutterBottom 
              align="center" 
              sx={{ 
                mb: 3,
                color: designSystem.colors.textLight,
                fontWeight: 700,
                fontFamily: designSystem.typography.fontFamily.display,
              }}
            >
              Select Quiz
            </Typography>
            
            {/* Group Selection */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="group-select-label" sx={{ color: designSystem.colors.textLight }}>Group</InputLabel>
              <Select
                labelId="group-select-label"
                id="group-select"
                value={selectedGroupId}
                label="Group"
                onChange={(e) => onGroupChange(e.target.value)}
                sx={{ color: designSystem.colors.textLight, '.MuiSelect-icon': { color: designSystem.colors.textLight } }}
                MenuProps={{ PaperProps: { sx: { bgcolor: designSystem.colors.darkBg } } }}
              >
                <MenuItem value="all" sx={{ color: designSystem.colors.textLight }}>All Groups</MenuItem>
                {availableGroups.map(group => (
                  <MenuItem key={group._id} value={group._id} sx={{ color: designSystem.colors.textLight }}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Quiz Selection */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="quiz-select-label" sx={{ color: designSystem.colors.textLight }}>Quiz</InputLabel>
              <Select
                labelId="quiz-select-label"
                id="quiz-select"
                value={selectedQuizId}
                label="Quiz"
                onChange={(e) => onQuizChange(e.target.value)}
                disabled={filteredQuizzes.length === 0}
                sx={{ color: designSystem.colors.textLight, '.MuiSelect-icon': { color: designSystem.colors.textLight } }}
                MenuProps={{ PaperProps: { sx: { bgcolor: designSystem.colors.darkBg } } }}
              >
                {filteredQuizzes.map(quiz => (
                  <MenuItem key={quiz._id} value={quiz._id} sx={{ color: designSystem.colors.textLight }}>
                    {quiz.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {filteredQuizzes.length === 0 && (
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 1 }}>
                No quizzes available in this group
              </Typography>
            )}
          </Box>

          {/* Mode Selection */}
          {selectedQuizId && (
            <>
              <Typography 
                variant="h5" 
                gutterBottom 
                align="center" 
                sx={{ 
                  mb: 3,
                  color: designSystem.colors.textLight,
                  fontWeight: 700,
                  fontFamily: designSystem.typography.fontFamily.display,
                }}
              >
                Choose Quiz Mode
              </Typography>

              <Box display="flex" gap={3} justifyContent="center" flexWrap="wrap">
                <Card sx={{ minWidth: 200, bgcolor: 'rgba(255,255,255,0.02)', color: designSystem.colors.textLight }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: designSystem.colors.textLight }}>
                      Zen Mode
                    </Typography>
                    <Typography variant="body2" sx={{ color: designSystem.colors.textLight }} gutterBottom>
                      No time limits, learn at your own pace
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => onModeSelect('zen')}
                    >
                      Start Zen Quiz
                    </Button>
                  </CardContent>
                </Card>

                <Card sx={{ minWidth: 200, bgcolor: 'rgba(255,255,255,0.02)', color: designSystem.colors.textLight }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: designSystem.colors.textLight }}>
                      Timed Mode
                    </Typography>
                    <Typography variant="body2" sx={{ color: designSystem.colors.textLight }} gutterBottom>
                      Challenge yourself with time limits
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1} mt={2}>
                      {[10, 20, 30].map(minutes => (
                        <Button
                          key={minutes}
                          variant="outlined"
                          onClick={() => onModeSelect('timed', minutes)}
                        >
                          {minutes} minutes
                        </Button>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  )
}

export default QuizModeSelection
