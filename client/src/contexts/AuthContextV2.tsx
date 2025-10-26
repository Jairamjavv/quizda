import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'
import { logger } from '../utils/logger'
import { sessionManager } from '../utils/sessionManager'

interface User {
  id: number
  email: string
  role: 'user' | 'admin'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>
  register: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Configure axios defaults - use environment variable in production
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
axios.defaults.baseURL = apiUrl;
axios.defaults.withCredentials = true; // Enable cookies for refresh tokens

logger.info('AuthContext initialized', { apiUrl });

export const AuthProviderV2: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Always try to verify/restore session on app startup
    // This handles page refreshes where access token is lost from memory
    logger.debug('App starting, checking for existing session...');
    verifySession();
  }, [])

  const verifySession = async () => {
    try {
      let currentUser = sessionManager.getCurrentUser();
      
      // If no access token in memory, try to refresh using the refresh token cookie
      if (!currentUser) {
        logger.info('No access token in memory, attempting token refresh...');
        try {
          await sessionManager.refreshToken();
          currentUser = sessionManager.getCurrentUser();
          logger.info('Token refreshed successfully on app startup');
        } catch (refreshError) {
          logger.info('No valid refresh token found, user needs to login');
          setLoading(false);
          return;
        }
      }
      
      if (currentUser) {
        // Check if token is expired
        if (sessionManager.isTokenExpired()) {
          logger.info('Token expired, refreshing...');
          try {
            await sessionManager.refreshToken();
            const refreshedUser = sessionManager.getCurrentUser();
            if (refreshedUser) {
              setUser({
                id: refreshedUser.id,
                email: refreshedUser.email,
                role: refreshedUser.role as 'user' | 'admin'
              });
            }
          } catch (refreshError) {
            logger.warn('Token refresh failed, keeping existing session');
            // Don't clear session if refresh fails - user might still be valid
          }
        } else {
          setUser({
            id: currentUser.id,
            email: currentUser.email,
            role: currentUser.role as 'user' | 'admin'
          });
        }
        
        logger.info('Session verified', { userId: currentUser.id, role: currentUser.role });
      }
    } catch (error) {
      logger.error('Session verification failed', error);
      // Only clear session if we don't already have a user
      // This prevents clearing session immediately after login
      if (!user) {
        sessionManager.clearSession();
      }
    } finally {
      setLoading(false);
    }
  }

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<User> => {
    logger.authAttempt('login', email);
    
    try {
      const response = await axios.post('/auth/login', { 
        email, 
        password,
        rememberMe 
      });
      
      const { accessToken, user: userData, csrfToken } = response.data;
      
      logger.authSuccess('login', email);
      
      // Set tokens in session manager
      sessionManager.setTokens(accessToken, csrfToken);
      
      // Set user state
      const userObj: User = {
        id: userData.id,
        email: userData.email,
        role: userData.role
      };
      setUser(userObj);
      
      logger.info('User logged in successfully', { email, role: userData.role });
      
      return userObj;
    } catch (error: any) {
      logger.authFailure('login', error);
      logger.error('Login failed', error, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  const register = async (email: string, password: string, rememberMe: boolean = false) => {
    logger.authAttempt('register', email);
    
    try {
      const response = await axios.post('/auth/register', { 
        email, 
        password,
        rememberMe 
      });
      
      const { accessToken, user: userData, csrfToken } = response.data;
      
      logger.authSuccess('register', email);
      
      // Set tokens in session manager
      sessionManager.setTokens(accessToken, csrfToken);
      
      // Set user state
      setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role
      });
      
      logger.info('User registered successfully', { email, role: userData.role });
    } catch (error: any) {
      logger.authFailure('register', error);
      logger.error('Registration failed', error, {
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  }

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
      logger.info('Logout successful');
    } catch (error) {
      logger.error('Logout request failed', error);
      // Continue with local logout even if server request fails
    } finally {
      sessionManager.clearSession();
      setUser(null);
    }
  }

  const logoutAll = async () => {
    try {
      await axios.post('/auth/logout-all');
      logger.info('Logged out from all devices');
    } catch (error) {
      logger.error('Logout all request failed', error);
    } finally {
      sessionManager.clearSession();
      setUser(null);
    }
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    logoutAll,
    loading,
    isAuthenticated: !!user && sessionManager.isAuthenticated(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthV2 = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthV2 must be used within AuthProviderV2')
  }
  return context
}
