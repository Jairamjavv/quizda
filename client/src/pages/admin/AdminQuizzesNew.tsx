import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, IconButton, Typography, Box, Container, Grid } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import axios from 'axios'
import { useAuthV2 as useAuth } from '../../contexts/AuthContextV2'
import SandglassLoader from '../../components/SandglassLoader'
import { designSystem } from '../../theme/designSystem'
import type { Quiz, Group } from './types'
import QuizListPanel from './components/QuizListPanel'

const AdminQuizzesNew: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { (async () => {
    try {
      const [qR, gR] = await Promise.all([axios.get('/admin/quizzes'), axios.get('/admin/groups')])
      setQuizzes(qR.data || [])
      setGroups(gR.data || [])
    } catch (e) {
      // ignore; will show empty state
    } finally { setLoading(false) }
  })() }, [])

  if (loading) return (<Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" sx={{ bgcolor: designSystem.colors.darkBg }}><SandglassLoader size={48} color={designSystem.colors.brandPrimary} /></Box>)

  return (
    <Box sx={{ bgcolor: designSystem.colors.darkBg, minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: designSystem.colors.darkBg, boxShadow: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/admin')} sx={{ color: designSystem.colors.textLight }}><ArrowBack /></IconButton>
          <Typography 
            variant="h6" 
            sx={{ 
              color: designSystem.colors.textLight,
              fontWeight: 700,
              fontFamily: designSystem.typography.fontFamily.display,
            }}
          >
            Manage Quizzes
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid sx={{ width: { xs: '100%', md: 360 } }}>
            <QuizListPanel quizzes={quizzes} groups={groups} onSelectQuiz={() => {}} onCreate={() => {}} onDelete={() => {}} />
          </Grid>
          <Grid sx={{ flex: 1 }}>
            <Typography color="text.secondary">Select a quiz to edit or create a new quiz.</Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default AdminQuizzesNew
