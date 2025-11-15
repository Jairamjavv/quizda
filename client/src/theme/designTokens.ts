export const tokens = {
  /* Light mode */
  primary: {
    green: "#2E7D50",
    greenLight: "#E8F3ED",
    greenDark: "#1F5C3A",
    orange: "#D9822B",
    orangeLight: "#FFF4E5",
    orangeDark: "#A56620",
  },
  neutral: {
    background: "#FAFAFA",
    surface: "#F3F4F3",
    surfaceHover: "#EBECEB",
    textPrimary: "#1C1C1C",
    textSecondary: "#5D5D5D",
    textDisabled: "#A6A6A6",
  },
  accents: {
    blue: "#497AA7",
    purple: "#8566C2",
    yellow: "#E0C865",
  },
  status: {
    success: "#2E7D50",
    warning: "#E5962E",
    error: "#C64545",
    info: "#497AA7",
  },
  /* Dark mode equivalents */
  dark: {
    background: "#121416",
    surface: "#1A1C1E",
    surfaceHover: "#232527",
    textPrimary: "#E6E6E6",
    textSecondary: "#B3B3B3",
    textDisabled: "#6E6E6E",
    primaryGreen: "#4EBF7A",
    primaryGreenSubtle: "#1E3B2A",
    primaryOrange: "#E6A34F",
    primaryOrangeSubtle: "#3F2D1B",
    accentBlue: "#6BA8D1",
    accentPurple: "#A890DA",
    accentYellow: "#DDBB5A",
    success: "#4EBF7A",
    warning: "#E6A34F",
    error: "#D96A6A",
    info: "#6BA8D1",
  },
} as const;

export default tokens;
