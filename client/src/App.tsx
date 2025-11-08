import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProviderV2 as AuthProvider } from './contexts/AuthContextV2'
import ProtectedRoute from './components/ProtectedRoute'
import AuthRedirect from './components/AuthRedirect'
import { SessionExpiryModal } from './components/SessionExpiryModal'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/contributor/Register'
import Dashboard from './pages/attempt/Dashboard'
import QuizTaking from './pages/attempt/QuizTaking'
import QuizHistory from './pages/attempt/QuizHistory'
import AttemptReview from './pages/attempt/AttemptReview'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminQuizzes from './pages/admin/AdminQuizzesNew'
import AdminGroups from './pages/admin/AdminGroups'
import AdminLogin from './pages/admin/AdminLogin'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes - redirect to dashboard if already logged in */}
        <Route path="/" element={<AuthRedirect><Landing /></AuthRedirect>} />
        <Route path="/auth/login" element={<AuthRedirect><Login /></AuthRedirect>} />
        <Route path="/auth/register" element={<AuthRedirect><Register /></AuthRedirect>} />
        
        {/* Admin routes - admin login also redirects if already logged in */}
        <Route path="/admin/login" element={<AuthRedirect><AdminLogin /></AuthRedirect>} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true} />}>
          <Route index element={<AdminDashboard />} />
          <Route path="quizzes" element={<AdminQuizzes />} />
          <Route path="quizzes/:id" element={<AdminQuizzes />} />
          <Route path="groups" element={<AdminGroups />} />
          <Route path="groups/:id" element={<AdminGroups />} />
        </Route>
        
        {/* User routes - protected, require authentication */}
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