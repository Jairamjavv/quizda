import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'
import { logger } from '../utils/logger'

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
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
axios.defaults.baseURL = apiUrl;

logger.info('AuthContext initialized', { apiUrl });

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      logger.debug('Token found in localStorage, verifying...');
      // Verify token and get user info
      verifyToken()
    } else {
      logger.debug('No token found in localStorage');
      setLoading(false)
    }
  }, [token])

  const verifyToken = async () => {
    try {
      // Decode the token to get user info
      const payload = JSON.parse(atob(token!.split('.')[1]))
      const storedEmail = localStorage.getItem('userEmail')
      
      logger.info('Token verified', { userId: payload.id, role: payload.role });
      
      setUser({
        id: payload.id,
        email: storedEmail || 'user@example.com',
        role: payload.role
      })
    } catch (error) {
      logger.error('Token verification failed', error);
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    logger.authAttempt('login', email);
    
    try {
      const response = await axios.post('/auth/login', { email, password })
      const { token: newToken, email: userEmail, role } = response.data
      
      logger.authSuccess('login', email);
      
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
      
      logger.info('User logged in successfully', { email, role });
    } catch (error: any) {
      logger.authFailure('login', error);
      logger.error('Login failed', error, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.error || 'Login failed')
    }
  }

  const register = async (email: string, password: string) => {
    logger.authAttempt('register', email);
    
    try {
      const response = await axios.post('/auth/register', { email, password })
      const { token: newToken, email: userEmail, role } = response.data
      
      logger.authSuccess('register', email);
      
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
      
      logger.info('User registered successfully', { email, role });
    } catch (error: any) {
      logger.authFailure('register', error);
      logger.error('Registration failed', error, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.error || 'Registration failed')
    }
  }

  const logout = () => {
    logger.info('User logged out');
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
