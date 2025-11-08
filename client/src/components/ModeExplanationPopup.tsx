import React from 'react';
import { Dialog, DialogContent, DialogTitle, Typography, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CodeIcon from '@mui/icons-material/Code';
import EditIcon from '@mui/icons-material/Edit';
import { designSystem } from '../theme/designSystem';

interface ModeExplanationPopupProps {
  open: boolean;
  onClose: () => void;
  mode: 'contributor' | 'attempt';
}

const ModeExplanationPopup: React.FC<ModeExplanationPopupProps> = ({ open, onClose, mode }) => {
  const isContributor = mode === 'contributor';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: designSystem.borderRadius.bento,
          bgcolor: designSystem.colors.lightSurface,
          boxShadow: designSystem.shadows.bento,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: isContributor 
                ? designSystem.colors.accentGreen 
                : designSystem.colors.accentBlue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: designSystem.shadows.subtle,
            }}
          >
            {isContributor ? (
              <CodeIcon sx={{ fontSize: '28px', color: designSystem.colors.white }} />
            ) : (
              <EditIcon sx={{ fontSize: '28px', color: designSystem.colors.white }} />
            )}
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontFamily: designSystem.typography.fontFamily.display,
              fontWeight: 700,
              color: designSystem.colors.textDark,
            }}
          >
            {isContributor ? 'Contributor Mode' : 'Attempt Mode'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, pb: 3 }}>
        {isContributor ? (
          <Box>
            <Typography
              variant="body1"
              sx={{
                mb: 2,
                color: designSystem.colors.textDark,
                fontSize: '16px',
                lineHeight: 1.6,
              }}
            >
              As a <strong>Contributor</strong>, you can:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
              <Typography
                component="li"
                sx={{
                  mb: 1.5,
                  color: designSystem.colors.textDark,
                  fontSize: '15px',
                }}
              >
                Create and manage your own quizzes
              </Typography>
              <Typography
                component="li"
                sx={{
                  mb: 1.5,
                  color: designSystem.colors.textDark,
                  fontSize: '15px',
                }}
              >
                Organize quizzes into groups
              </Typography>
              <Typography
                component="li"
                sx={{
                  mb: 0,
                  color: designSystem.colors.textDark,
                  fontSize: '15px',
                }}
              >
                Share your knowledge with the community
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography
              variant="body1"
              sx={{
                mb: 2,
                color: designSystem.colors.textDark,
                fontSize: '16px',
                lineHeight: 1.6,
              }}
            >
              As an <strong>Attempt</strong> user, you can:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
              <Typography
                component="li"
                sx={{
                  mb: 1.5,
                  color: designSystem.colors.textDark,
                  fontSize: '15px',
                }}
              >
                Take quizzes created by the community
              </Typography>
              <Typography
                component="li"
                sx={{
                  mb: 1.5,
                  color: designSystem.colors.textDark,
                  fontSize: '15px',
                }}
              >
                Track your progress and scores
              </Typography>
              <Typography
                component="li"
                sx={{
                  mb: 0,
                  color: designSystem.colors.textDark,
                  fontSize: '15px',
                }}
              >
                Test your knowledge and improve skills
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModeExplanationPopup;
