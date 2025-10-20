import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import QuizTaking from './pages/QuizTaking'
import QuizHistory from './pages/QuizHistory'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminQuizzes from './pages/admin/AdminQuizzes'
import AdminGroups from './pages/admin/AdminGroups'
import AdminLogin from './pages/admin/AdminLogin'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
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
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App