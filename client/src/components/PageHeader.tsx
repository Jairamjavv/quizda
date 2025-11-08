import React from 'react'
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material'
import { ArrowBack, ExitToApp } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { designSystem } from '../theme/designSystem'

interface PageHeaderProps {
  title: string
  showBackButton?: boolean
  backPath?: string
  showLogoutButton?: boolean
  onLogout?: () => void
  rightActions?: React.ReactNode
  userEmail?: string
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showBackButton = false,
  backPath,
  showLogoutButton = false,
  onLogout,
  rightActions,
  userEmail
}) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (backPath) {
      navigate(backPath)
    } else {
      navigate(-1)
    }
  }

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        bgcolor: designSystem.colors.darkBg, 
        boxShadow: 'none', 
        borderBottom: `1px solid rgba(255, 255, 255, 0.1)` 
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {showBackButton && (
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={handleBack}
            sx={{ 
              mr: 2,
              color: designSystem.colors.textLight,
              '&:hover': { bgcolor: `${designSystem.colors.brandPrimary}25` }
            }}
          >
            <ArrowBack />
          </IconButton>
        )}
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 700,
            color: designSystem.colors.textLight,
            fontFamily: designSystem.typography.fontFamily.display,
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
          }}
        >
          {title}
        </Typography>

        {userEmail && (
          <Typography 
            variant="body2" 
            sx={{ 
              mr: 3,
              color: designSystem.colors.textMuted,
              fontWeight: 500,
              fontFamily: designSystem.typography.fontFamily.primary,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {userEmail}
          </Typography>
        )}

        {rightActions}

        {showLogoutButton && onLogout && (
          <IconButton 
            onClick={onLogout}
            sx={{
              color: designSystem.colors.textLight,
              '&:hover': { bgcolor: `${designSystem.colors.brandPrimary}20` },
            }}
          >
            <ExitToApp />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default PageHeader
