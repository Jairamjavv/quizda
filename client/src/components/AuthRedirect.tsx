import React from 'react'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuthV2 as useAuth } from '../contexts/AuthContextV2'

interface AuthRedirectProps {
  children: React.ReactNode
}

/**
 * AuthRedirect - Redirects authenticated users away from public pages
 * 
 * Use this component to wrap landing, login, and register pages.
 * If user is already authenticated, they'll be redirected to their dashboard.
 * Otherwise, the children (public page) will be rendered.
 */
const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  // If user is authenticated, redirect to appropriate dashboard
  if (user) {
    // Admin users go to admin dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />
    }
    // Regular users go to user dashboard
    return <Navigate to="/dashboard" replace />
  }

  // User not authenticated - render the public page
  return <>{children}</>
}

export default AuthRedirect
