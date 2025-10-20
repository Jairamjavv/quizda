import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: number
  email: string
  role: 'user' | 'admin'
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Configure axios defaults - use environment variable in production
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Verify token and get user info
      verifyToken()
    } else {
      setLoading(false)
    }
  }, [token])

  const verifyToken = async () => {
    try {
      // Decode the token to get user info
      const payload = JSON.parse(atob(token!.split('.')[1]))
      const storedEmail = localStorage.getItem('userEmail')
      
      setUser({
        id: payload.id,
        email: storedEmail || 'user@example.com',
        role: payload.role
      })
    } catch (error) {
      console.error('Token verification failed:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/auth/login', { email, password })
      const { token: newToken, email: userEmail, role } = response.data
      
      setToken(newToken)
      localStorage.setItem('token', newToken)
      localStorage.setItem('userEmail', userEmail)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      // Decode token to get user info
      const payload = JSON.parse(atob(newToken.split('.')[1]))
      setUser({
        id: payload.id,
        email: userEmail,
        role: role || payload.role
      })
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed')
    }
  }

  const register = async (email: string, password: string) => {
    try {
      const response = await axios.post('/auth/register', { email, password })
      const { token: newToken, email: userEmail, role } = response.data
      
      setToken(newToken)
      localStorage.setItem('token', newToken)
      localStorage.setItem('userEmail', userEmail)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      // Decode token to get user info
      const payload = JSON.parse(atob(newToken.split('.')[1]))
      setUser({
        id: payload.id,
        email: userEmail,
        role: role || payload.role
      })
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed')
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
