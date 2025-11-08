import React from 'react';
import { Box, keyframes } from '@mui/material';
import { designSystem } from '../theme/designSystem';

interface SandglassLoaderProps {
  size?: number;
  color?: string;
}

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(180deg);
  }
`;

const fillSand = keyframes`
  0% {
    clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
  }
  50% {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
  100% {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
`;

const emptySand = keyframes`
  0% {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
  50% {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
  100% {
    clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
  }
`;

const SandglassLoader: React.FC<SandglassLoaderProps> = ({ 
  size = 60, 
  color = designSystem.colors.brandPrimary 
}) => {
  const glassColor = designSystem.colors.textMuted;
  const sandColor = color;

  return (
    <Box
      sx={{
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        animation: `${rotate} 2s ease-in-out infinite`,
      }}
    >
      {/* Sandglass Frame */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '50%',
            borderLeft: `3px solid ${glassColor}`,
            borderRight: `3px solid ${glassColor}`,
            boxSizing: 'border-box',
          },
          '&::before': {
            top: 0,
            borderTop: `3px solid ${glassColor}`,
            borderBottom: 'none',
            clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)',
          },
          '&::after': {
            bottom: 0,
            borderBottom: `3px solid ${glassColor}`,
            borderTop: 'none',
            clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
          },
        }}
      />

      {/* Top Sand */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          left: '15%',
          width: '70%',
          height: '40%',
          backgroundColor: sandColor,
          clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)',
          animation: `${emptySand} 2s ease-in-out infinite`,
        }}
      />

      {/* Bottom Sand */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '5%',
          left: '15%',
          width: '70%',
          height: '40%',
          backgroundColor: sandColor,
          clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
          animation: `${fillSand} 2s ease-in-out infinite`,
        }}
      />

      {/* Center Neck */}
      <Box
        sx={{
          position: 'absolute',
          top: '48%',
          left: '48%',
          width: '4%',
          height: '4%',
          backgroundColor: glassColor,
          borderRadius: '50%',
        }}
      />
    </Box>
  );
};

export default SandglassLoader;
