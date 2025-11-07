// QuizUp × Bento Minimal Design System
// Color Palette & Theme Configuration

export const designSystem = {
  colors: {
    // Brand & Primary
    brandPrimary: "#F54848", // Main CTA buttons, brand bar
    brandHover: "#DD3333", // Hover state for primary

    // Backgrounds
    darkBg: "#1A1A1A", // Page backgrounds
    lightSurface: "#F3F3F3", // Bento tiles, cards

    // Accents
    accentYellow: "#FFD452", // XP progress, highlights
    accentGreen: "#67D67D", // Correct answers, success banners
    accentBlue: "#4DB8FF", // Neutral or secondary info

    // Text
    textLight: "#FFFFFF", // Text on dark
    textDark: "#1A1A1A", // Text on light
    textMuted: "#666666", // Secondary text

    // Legacy support (map to new system)
    white: "#FFFFFF",
    gray: "#E0E0E0",
  },

  // Typography Scale
  typography: {
    fontFamily: {
      primary:
        '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: '"Poppins", "Inter", sans-serif',
      mono: '"Rubik Mono One", "JetBrains Mono", monospace',
    },
    fontSize: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "20px",
      xl: "24px",
      "2xl": "28px",
      "3xl": "32px",
      "4xl": "48px",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  // Spacing (8px base grid)
  spacing: {
    xs: "8px",
    sm: "16px",
    md: "24px",
    lg: "32px",
    xl: "48px",
    "2xl": "64px",
  },

  // Border Radius
  borderRadius: {
    sm: "8px",
    md: "16px",
    bento: "24px", // Signature Bento radius
    full: "9999px",
  },

  // Shadows
  shadows: {
    bento: "0 4px 12px rgba(0, 0, 0, 0.15)",
    hover: "0 6px 20px rgba(0, 0, 0, 0.2)",
    subtle: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },

  // Breakpoints
  breakpoints: {
    mobile: "640px",
    tablet: "768px",
    desktop: "1024px",
    wide: "1440px",
  },

  // Animations & Transitions
  animations: {
    // Durations
    duration: {
      fast: "150ms",
      normal: "300ms",
      slow: "500ms",
    },
    // Easing functions
    easing: {
      default: "cubic-bezier(0.4, 0, 0.2, 1)",
      smooth: "cubic-bezier(0.4, 0, 0.6, 1)",
      bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },
    // Common transitions
    transition: {
      default: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      fast: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
      slow: "all 500ms cubic-bezier(0.4, 0, 0.2, 1)",
      bounce: "all 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },
  },

  // Responsive utilities
  responsive: {
    // Container max widths
    containerWidth: {
      mobile: "100%",
      tablet: "720px",
      desktop: "960px",
      wide: "1200px",
    },
    // Padding scales
    padding: {
      mobile: "16px",
      tablet: "24px",
      desktop: "32px",
      wide: "48px",
    },
    // Font size scales for responsive typography
    fontScale: {
      mobile: 0.875, // 87.5% of base
      tablet: 1, // 100% of base
      desktop: 1, // 100% of base
      wide: 1.125, // 112.5% of base
    },
  },
};

// MUI Theme Overrides
export const muiThemeOverrides = {
  palette: {
    primary: {
      main: designSystem.colors.brandPrimary,
      contrastText: designSystem.colors.textLight,
    },
    success: {
      main: designSystem.colors.accentGreen,
    },
    warning: {
      main: designSystem.colors.accentYellow,
    },
    info: {
      main: designSystem.colors.accentBlue,
    },
    background: {
      default: designSystem.colors.darkBg,
      paper: designSystem.colors.lightSurface,
    },
    text: {
      primary: designSystem.colors.textDark,
      secondary: designSystem.colors.textMuted,
    },
  },
  typography: {
    fontFamily: designSystem.typography.fontFamily.primary,
    h1: {
      fontFamily: designSystem.typography.fontFamily.display,
      fontWeight: designSystem.typography.fontWeight.bold,
      fontSize: designSystem.typography.fontSize["4xl"],
    },
    h2: {
      fontFamily: designSystem.typography.fontFamily.display,
      fontWeight: designSystem.typography.fontWeight.semibold,
      fontSize: designSystem.typography.fontSize["2xl"],
    },
    h3: {
      fontWeight: designSystem.typography.fontWeight.semibold,
      fontSize: designSystem.typography.fontSize.lg,
    },
    body1: {
      fontSize: designSystem.typography.fontSize.base,
    },
    button: {
      fontWeight: designSystem.typography.fontWeight.medium,
      textTransform: "none" as const,
      fontSize: designSystem.typography.fontSize.sm,
    },
  },
  shape: {
    borderRadius: parseInt(designSystem.borderRadius.bento),
  },
  shadows: [
    "none",
    designSystem.shadows.subtle,
    designSystem.shadows.bento,
    designSystem.shadows.hover,
    // ... rest of MUI shadow array
  ] as any,
};

export default designSystem;
