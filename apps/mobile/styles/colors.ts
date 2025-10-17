export const Colors = {
  primary: '#5A67D8', // Indigo
  accent: '#38B2AC', // Teal
  background: '#F7FAFC', // Light gray
  surface: '#FFFFFF', // White cards
  text: '#1A202C', // Slate 800
  muted: '#A0AEC0', // Slate 400
  error: '#E53E3E', // Red
  warning: '#F6AD55', // Orange
  darkBg: '#0F172A', // For dark mode later
} as const;

export type ColorToken = keyof typeof Colors;

