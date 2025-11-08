import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import EditIcon from '@mui/icons-material/Edit';
import { designSystem } from '../theme/designSystem';
import ModeExplanationPopup from './ModeExplanationPopup';

interface ModeToggleProps {
  mode: 'contributor' | 'attempt';
  onChange: (mode: 'contributor' | 'attempt') => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange }) => {
  const isContributor = mode === 'contributor';
  const [showExplanation, setShowExplanation] = useState(false);

  const handleToggle = (newMode: 'contributor' | 'attempt') => {
    if (newMode !== mode) {
      onChange(newMode);
      setShowExplanation(true);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          mb: 3,
        }}
      >
        {/* Contributor Label */}
        <Typography
          sx={{
            fontFamily: designSystem.typography.fontFamily.primary,
            fontSize: '14px',
            fontWeight: isContributor ? 700 : 400,
            color: isContributor ? designSystem.colors.textDark : designSystem.colors.textMuted,
            transition: designSystem.animations.transition.default,
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => handleToggle('contributor')}
        >
          Contributor
        </Typography>

        {/* Toggle Switch */}
        <Box
          onClick={() => handleToggle(isContributor ? 'attempt' : 'contributor')}
          sx={{
            position: 'relative',
            width: '200px',
            height: '60px',
            borderRadius: '30px',
            backgroundColor: isContributor ? designSystem.colors.accentGreen : designSystem.colors.accentBlue,
            cursor: 'pointer',
            transition: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: designSystem.shadows.subtle,
            '&:hover': {
              boxShadow: designSystem.shadows.bento,
            },
          }}
        >
          {/* Sliding Indicator */}
          <Box
            sx={{
              position: 'absolute',
              top: '6px',
              left: isContributor ? '6px' : 'calc(100% - 54px)',
              width: '48px',
              height: '48px',
              borderRadius: '24px',
              backgroundColor: designSystem.colors.white,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isContributor ? (
              <CodeIcon sx={{ fontSize: '24px', color: designSystem.colors.accentGreen }} />
            ) : (
              <EditIcon sx={{ fontSize: '24px', color: designSystem.colors.accentBlue }} />
            )}
          </Box>
        </Box>

        {/* Attempt Label */}
        <Typography
          sx={{
            fontFamily: designSystem.typography.fontFamily.primary,
            fontSize: '14px',
            fontWeight: !isContributor ? 700 : 400,
            color: !isContributor ? designSystem.colors.textDark : designSystem.colors.textMuted,
            transition: designSystem.animations.transition.default,
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => handleToggle('attempt')}
        >
          Attempt
        </Typography>
      </Box>

      {/* Mode Explanation Popup */}
      <ModeExplanationPopup
        open={showExplanation}
        onClose={() => setShowExplanation(false)}
        mode={mode}
      />
    </>
  );
};

export default ModeToggle;
