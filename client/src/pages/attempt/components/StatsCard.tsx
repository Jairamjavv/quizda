import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { designSystem } from "../../../theme/designSystem";

interface StatsCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
  progress?: number; // 0-100
  accentColor?: string;
}

/**
 * StatsCard Component
 * 
 * Displays a single statistics metric with icon, value, label, and optional
 * progress bar or change indicator. Used in dashboard bento grid layout.
 * 
 * @param icon - Icon element (MUI Icon component)
 * @param value - Main statistic value to display
 * @param label - Descriptive label for the stat
 * @param change - Optional change indicator with value and direction
 * @param progress - Optional progress percentage (0-100)
 * @param accentColor - Optional accent color for icon/progress bar
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  value,
  label,
  change,
  progress,
  accentColor = designSystem.colors.accentBlue,
}) => {
  return (
    <Box
      sx={{
        background: designSystem.colors.darkBg,
        borderRadius: designSystem.borderRadius.sm,
        padding: designSystem.spacing.md,
        border: `1px solid rgba(255, 255, 255, 0.1)`,
        transition: designSystem.animations.transition.default,
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: designSystem.shadows.hover,
          borderColor: accentColor,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            color: accentColor,
            display: "flex",
            alignItems: "center",
            mr: 2,
            "& > svg": {
              fontSize: "28px",
            },
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: "32px",
              fontWeight: 700,
              color: designSystem.colors.textLight,
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              color: designSystem.colors.textMuted,
              mt: 0.5,
            }}
          >
            {label}
          </Typography>
        </Box>
      </Box>

      {change && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mb: progress !== undefined ? 1.5 : 0,
          }}
        >
          <Typography
            sx={{
              fontSize: "12px",
              color: change.isPositive
                ? designSystem.colors.accentGreen
                : designSystem.colors.brandPrimary,
              fontWeight: 600,
            }}
          >
            {change.isPositive ? "↑" : "↓"} {change.value}
          </Typography>
        </Box>
      )}

      {progress !== undefined && (
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 0.5,
            }}
          >
            <Typography
              sx={{
                fontSize: "12px",
                color: designSystem.colors.textMuted,
              }}
            >
              Progress
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                color: designSystem.colors.textLight,
                fontWeight: 600,
              }}
            >
              {progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              "& .MuiLinearProgress-bar": {
                backgroundColor: accentColor,
                borderRadius: 4,
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

