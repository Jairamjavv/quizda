import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { designSystem } from '../theme/designSystem';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleContributeClick = () => {
    navigate('/auth/login');
  };

  const handleAttemptClick = () => {
    navigate('/auth/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        animation: 'fadeIn 0.6s ease-out',
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      {/* Contribute Mode - Left Side */}
      <Box
        onClick={handleContributeClick}
        sx={{
          flex: 1,
          backgroundColor: designSystem.colors.accentGreen,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: { xs: '48px 24px', md: '64px 48px' },
          position: 'relative',
          cursor: 'pointer',
          transition: designSystem.animations.transition.default,
          '&:hover': {
            backgroundColor: '#5AD88A',
            transform: { md: 'scale(1.02)' },
            boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.1)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        }}
      >
        {/* Logo - Top Left */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: '24px', md: '48px' },
            left: { xs: '24px', md: '48px' },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: designSystem.typography.fontFamily.mono,
              color: designSystem.colors.textLight,
              fontSize: { xs: '24px', md: '32px' },
              fontWeight: 700,
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
            }}
          >
            Quizda
          </Typography>
        </Box>

        {/* Content */}
        <Box
          sx={{
            textAlign: 'center',
            animation: 'slideInLeft 0.8s ease-out',
            '@keyframes slideInLeft': {
              from: { 
                opacity: 0, 
                transform: 'translateX(-30px)' 
              },
              to: { 
                opacity: 1, 
                transform: 'translateX(0)' 
              },
            },
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontFamily: designSystem.typography.fontFamily.mono,
              fontSize: { xs: '36px', sm: '48px', md: '56px', lg: '64px' },
              fontWeight: 700,
              color: designSystem.colors.textLight,
              marginBottom: { xs: '16px', md: '24px' },
              textShadow: '3px 3px 6px rgba(0, 0, 0, 0.3)',
              letterSpacing: '-0.02em',
            }}
          >
            Contribute Mode
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: designSystem.typography.fontFamily.primary,
              fontSize: { xs: '16px', sm: '18px', md: '20px' },
              fontWeight: 400,
              color: designSystem.colors.textLight,
              opacity: 0.95,
              maxWidth: '400px',
              margin: '0 auto',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
            }}
          >
            Create and share your own quizzes.
          </Typography>

          {/* Arrow Icon */}
          <Box
            sx={{
              marginTop: { xs: '32px', md: '48px' },
              animation: 'floatLeft 2s ease-in-out infinite',
              '@keyframes floatLeft': {
                '0%, 100%': { transform: 'translateX(0)' },
                '50%': { transform: 'translateX(-10px)' },
              },
            }}
          >
            <ArrowBackIcon
              sx={{
                fontSize: { xs: '48px', md: '64px' },
                color: designSystem.colors.textLight,
                filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Attempt Mode - Right Side */}
      <Box
        onClick={handleAttemptClick}
        sx={{
          flex: 1,
          backgroundColor: designSystem.colors.accentBlue,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: { xs: '48px 24px', md: '64px 48px' },
          position: 'relative',
          cursor: 'pointer',
          transition: designSystem.animations.transition.default,
          '&:hover': {
            backgroundColor: '#5EC2FF',
            transform: { md: 'scale(1.02)' },
            boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.1)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        }}
      >
        {/* Content */}
        <Box
          sx={{
            textAlign: 'center',
            animation: 'slideInRight 0.8s ease-out',
            '@keyframes slideInRight': {
              from: { 
                opacity: 0, 
                transform: 'translateX(30px)' 
              },
              to: { 
                opacity: 1, 
                transform: 'translateX(0)' 
              },
            },
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontFamily: designSystem.typography.fontFamily.mono,
              fontSize: { xs: '36px', sm: '48px', md: '56px', lg: '64px' },
              fontWeight: 700,
              color: designSystem.colors.textLight,
              marginBottom: { xs: '16px', md: '24px' },
              textShadow: '3px 3px 6px rgba(0, 0, 0, 0.3)',
              letterSpacing: '-0.02em',
            }}
          >
            Attempt Mode
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: designSystem.typography.fontFamily.primary,
              fontSize: { xs: '16px', sm: '18px', md: '20px' },
              fontWeight: 400,
              color: designSystem.colors.textLight,
              opacity: 0.95,
              maxWidth: '400px',
              margin: '0 auto',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
            }}
          >
            Test your knowledge on community quizzes.
          </Typography>

          {/* Arrow Icon */}
          <Box
            sx={{
              marginTop: { xs: '32px', md: '48px' },
              animation: 'floatRight 2s ease-in-out infinite',
              '@keyframes floatRight': {
                '0%, 100%': { transform: 'translateX(0)' },
                '50%': { transform: 'translateX(10px)' },
              },
            }}
          >
            <ArrowForwardIcon
              sx={{
                fontSize: { xs: '48px', md: '64px' },
                color: designSystem.colors.textLight,
                filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: '16px', md: '24px' },
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
      >
          <Typography
          variant="body2"
          sx={{
            fontFamily: designSystem.typography.fontFamily.mono,
            fontSize: { xs: '12px', md: '14px' },
            color: 'rgba(255, 255, 255, 0.8)',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
          }}
        >
          © {currentYear} Quizda. All rights reserved. — With love from Tamil Nadu, India ❤️
        </Typography>
      </Box>
    </Box>
  );
};

export default Landing;
