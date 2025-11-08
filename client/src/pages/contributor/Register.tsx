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
  FormControlLabel,
  Checkbox
} from '@mui/material'
import { useAuthV2 as useAuth } from '../../contexts/AuthContextV2'
import { designSystem } from '../../theme/designSystem'
import ModeToggle from '../../components/ModeToggle'
import SandglassLoader from '../../components/SandglassLoader'

const Register: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [mode, setMode] = useState<'contributor' | 'attempt'>('attempt')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await register(email, password, mode, rememberMe)
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
              Sign Up
            </Typography>
          </Box>

          {/* Mode Toggle */}
          <ModeToggle mode={mode} onChange={setMode} />
          
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
              autoComplete="new-password"
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                transition: designSystem.animations.transition.default,
                '&:hover': {
                  bgcolor: designSystem.colors.brandHover,
                  boxShadow: designSystem.shadows.bento,
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                },
                '&.Mui-disabled': {
                  bgcolor: 'rgba(245, 72, 72, 0.5)',
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            >
              {loading ? <SandglassLoader size={24} color={designSystem.colors.textLight} /> : 'Sign Up'}
            </Button>
            <Box textAlign="center" sx={{ mt: 3 }}>
              <Link to="/auth/login" style={{ textDecoration: 'none' }}>
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
                  Already have an account? Sign In
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Register
