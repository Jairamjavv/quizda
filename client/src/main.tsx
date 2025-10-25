import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.tsx'
import './index.css'

// Quizda Design System Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00B15E', // Accent Green
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF7A00', // Accent Orange
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F9F9F9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#121212', // Primary Dark
      secondary: '#666666',
    },
    divider: '#E0E0E0', // Neutral Gray
    success: {
      main: '#00B15E',
    },
    warning: {
      main: '#FF7A00',
    },
  },
  typography: {
    fontFamily: '"Inter", "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#121212',
    },
    h2: {
      fontWeight: 600,
      color: '#121212',
    },
    h3: {
      fontWeight: 600,
      color: '#121212',
    },
    h4: {
      fontWeight: 600,
      color: '#121212',
    },
    h5: {
      fontWeight: 600,
      color: '#121212',
    },
    h6: {
      fontWeight: 600,
      color: '#121212',
    },
  },
  shape: {
    borderRadius: 16, // Card border radius
  },
  shadows: [
    'none',
    '0 2px 8px rgba(0, 0, 0, 0.1)', // soft shadow
    '0 4px 12px rgba(0, 0, 0, 0.15)', // medium shadow
    '0 8px 24px rgba(0, 0, 0, 0.2)', // heavy shadow
    '0 2px 8px rgba(0, 0, 0, 0.1)',
    '0 2px 8px rgba(0, 0, 0, 0.1)',
    '0 4px 12px rgba(0, 0, 0, 0.15)',
    '0 4px 12px rgba(0, 0, 0, 0.15)',
    '0 8px 24px rgba(0, 0, 0, 0.2)',
    '0 8px 24px rgba(0, 0, 0, 0.2)',
    '0 8px 24px rgba(0, 0, 0, 0.2)',
    '0 8px 24px rgba(0, 0, 0, 0.2)',
    '0 8px 24px rgba(0, 0, 0, 0.2)',
    '0 8px 24px rgba(0, 0, 0, 0.2)',
    '0 8px 24px rgba(0, 0, 0, 0.2)',
    '0 8px 24px rgba(0, 0, 0, 0.2)',
    '0 8px 24px rgba(0, 0, 0, 0.2)',
    '0 8px 24px rgba(0, 0, 0, 0.2)',
    '0 8px 24px rgba(0, 0, 0, 0.2)',
    '0 8px 24px rgba(0, 0, 0, 0.2)',
    '0 8px 24px rgba(0, 0, 0, 0.2)',
    '0 8px 24px rgba(0, 0, 0, 0.2)',
    '0 8px 24px rgba(0, 0, 0, 0.2)',
    '0 8px 24px rgba(0, 0, 0, 0.2)',
    '0 8px 24px rgba(0, 0, 0, 0.2)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Input border radius
          padding: '16px 32px',
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          boxShadow: '0 4px 12px rgba(0, 177, 94, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0, 177, 94, 0.4)',
          },
        },
        containedSecondary: {
          boxShadow: '0 4px 12px rgba(255, 122, 0, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(255, 122, 0, 0.4)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#F2F2F2',
            '&:hover fieldset': {
              borderColor: '#00B15E',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00B15E',
              borderWidth: 2,
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 4px rgba(0, 177, 94, 0.1)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
        elevation3: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: '24px',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#121212',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)