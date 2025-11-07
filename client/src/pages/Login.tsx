import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox
} from '@mui/material'
import { useAuthV2 as useAuth } from '../contexts/AuthContextV2'
import { designSystem } from '../theme/designSystem'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password, rememberMe)
      navigate('/dashboard')
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
        background: designSystem.colors.darkBg,
        padding: { xs: 2, sm: 3 },
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        animation: 'fadeIn 400ms ease-in',
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            padding: { xs: 3, sm: 6 },
            borderRadius: designSystem.borderRadius.bento,
            boxShadow: designSystem.shadows.bento,
            bgcolor: designSystem.colors.lightSurface,
            transition: designSystem.animations.transition.default,
            '@keyframes slideUp': {
              from: { transform: 'translateY(30px)', opacity: 0 },
              to: { transform: 'translateY(0)', opacity: 1 },
            },
            animation: 'slideUp 500ms ease-out',
            '&:hover': {
              boxShadow: designSystem.shadows.hover,
            },
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              component="h1" 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                color: designSystem.colors.textDark,
                mb: 1,
                fontFamily: designSystem.typography.fontFamily.display,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              }}
            >
              Quizda
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(26, 26, 26, 0.6)',
                fontWeight: 500,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
              }}
            >
              Sign In
            </Typography>
          </Box>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: designSystem.borderRadius.md,
                bgcolor: `${designSystem.colors.brandPrimary}15`,
                color: designSystem.colors.brandPrimary,
                border: `1px solid ${designSystem.colors.brandPrimary}`,
                transition: designSystem.animations.transition.default,
                '@keyframes shake': {
                  '0%, 100%': { transform: 'translateX(0)' },
                  '25%': { transform: 'translateX(-10px)' },
                  '75%': { transform: 'translateX(10px)' },
                },
                animation: 'shake 400ms ease-in-out',
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
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: designSystem.colors.textDark,
                  transition: designSystem.animations.transition.default,
                  '& fieldset': { 
                    borderColor: 'rgba(26, 26, 26, 0.2)',
                    transition: designSystem.animations.transition.default,
                  },
                  '&:hover fieldset': { 
                    borderColor: designSystem.colors.accentBlue,
                    transform: 'scale(1.01)',
                  },
                  '&.Mui-focused fieldset': { 
                    borderColor: designSystem.colors.brandPrimary,
                    boxShadow: `0 0 0 3px ${designSystem.colors.brandPrimary}15`,
                  },
                },
                '& .MuiInputLabel-root': { 
                  color: 'rgba(26, 26, 26, 0.6)',
                  transition: designSystem.animations.transition.default,
                },
              }}
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
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: designSystem.colors.textDark,
                  transition: designSystem.animations.transition.default,
                  '& fieldset': { 
                    borderColor: 'rgba(26, 26, 26, 0.2)',
                    transition: designSystem.animations.transition.default,
                  },
                  '&:hover fieldset': { 
                    borderColor: designSystem.colors.accentBlue,
                    transform: 'scale(1.01)',
                  },
                  '&.Mui-focused fieldset': { 
                    borderColor: designSystem.colors.brandPrimary,
                    boxShadow: `0 0 0 3px ${designSystem.colors.brandPrimary}15`,
                  },
                },
                '& .MuiInputLabel-root': { 
                  color: 'rgba(26, 26, 26, 0.6)',
                  transition: designSystem.animations.transition.default,
                },
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{
                    color: 'rgba(26, 26, 26, 0.4)',
                    transition: designSystem.animations.transition.default,
                    '&.Mui-checked': {
                      color: designSystem.colors.brandPrimary,
                      transform: 'scale(1.1)',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: designSystem.colors.textDark }}>
                    Remember me for 30 days
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(26, 26, 26, 0.6)' }}>
                    Keep me signed in on this device
                  </Typography>
                </Box>
              }
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 2,
                fontSize: '1.1rem',
                mb: 2,
                bgcolor: designSystem.colors.brandPrimary,
                color: designSystem.colors.textLight,
                borderRadius: designSystem.borderRadius.sm,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: designSystem.shadows.subtle,
                '&:hover': {
                  bgcolor: designSystem.colors.brandHover,
                  boxShadow: designSystem.shadows.bento,
                },
                '&.Mui-disabled': {
                  bgcolor: 'rgba(245, 72, 72, 0.5)',
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: designSystem.colors.textLight }} /> : 'Sign In'}
            </Button>
            <Box textAlign="center" sx={{ mt: 3 }}>
              <Link to="/auth/register" style={{ textDecoration: 'none' }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: designSystem.colors.brandPrimary,
                    fontWeight: 500,
                    '&:hover': {
                      color: designSystem.colors.brandHover,
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Don't have an account? Sign Up
                </Typography>
              </Link>
            </Box>
            <Box textAlign="center" sx={{ mt: 2 }}>
              <Link to="/admin/login" style={{ textDecoration: 'none' }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(26, 26, 26, 0.6)',
                    '&:hover': {
                      color: designSystem.colors.textDark,
                    },
                  }}
                >
                  Admin Login
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Login
