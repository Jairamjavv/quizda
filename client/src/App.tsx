import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProviderV2 as AuthProvider } from './contexts/AuthContextV2'
import { useAuthV2 as useAuth } from './contexts/AuthContextV2'
import ProtectedRoute from './components/ProtectedRoute'
import { SessionExpiryModal } from './components/SessionExpiryModal'
import { Box, CircularProgress } from '@mui/material'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import QuizTaking from './pages/QuizTaking'
import QuizHistory from './pages/QuizHistory'
import AttemptReview from './pages/AttemptReview'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminQuizzes from './pages/admin/AdminQuizzes'
import AdminGroups from './pages/admin/AdminGroups'
import AdminLogin from './pages/admin/AdminLogin'

// Root redirect component that checks authentication
const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }
  
  // Redirect to dashboard if authenticated, otherwise to login
  return <Navigate to={user ? "/dashboard" : "/auth/login"} replace />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true} />}>
          <Route index element={<AdminDashboard />} />
          <Route path="quizzes" element={<AdminQuizzes />} />
          <Route path="quizzes/:id" element={<AdminQuizzes />} />
          <Route path="groups" element={<AdminGroups />} />
          <Route path="groups/:id" element={<AdminGroups />} />
        </Route>
        
        {/* User routes */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} />
        </Route>
        <Route path="/quiz" element={<ProtectedRoute />}>
          <Route path="new" element={<QuizTaking />} />
          <Route path="history" element={<QuizHistory />} />
          <Route path="attempt/:attemptId" element={<AttemptReview />} />
        </Route>
      </Routes>
      
      {/* Global session expiry warning modal */}
      <SessionExpiryModal />
    </AuthProvider>
  )
}

export default App