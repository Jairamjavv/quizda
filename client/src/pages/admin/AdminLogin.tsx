import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      // Check if user is admin after login
      const user = JSON.parse(atob(localStorage.getItem('token')!.split('.')[1]))
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        setError('Access denied. Admin privileges required.')
        navigate('/auth/login')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #121212 0%, #1E1E1E 100%)',
        padding: 2,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            padding: { xs: 4, sm: 6 },
            borderRadius: 4,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            border: '2px solid #FF7A00',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              component="h1" 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                color: '#121212',
                mb: 1,
              }}
            >
              Quizda Admin
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#FF7A00',
                fontWeight: 600,
              }}
            >
              Admin Sign In
            </Typography>
          </Box>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                border: '1px solid #FF7A00',
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Admin Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              disabled={loading}
              sx={{
                py: 2,
                fontSize: '1.1rem',
                mb: 2,
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : 'Admin Sign In'}
            </Button>
            <Box textAlign="center" sx={{ mt: 3 }}>
              <Button
                variant="text"
                onClick={() => navigate('/auth/login')}
                sx={{ 
                  color: '#00B15E',
                  '&:hover': {
                    bgcolor: 'rgba(0, 177, 94, 0.1)',
                  },
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  ← Back to User Login
                </Typography>
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default AdminLogin
