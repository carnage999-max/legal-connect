// Legal Connect Mobile App Theme
// Based on the design specs

export const colors = {
  // Global colors (never change)
  white: '#FFFFFF',
  black: '#0B0D12',
  textPrimary: '#0B0D12',
  textSecondary: '#4B5563',
  border: '#E5E7EB',

  // Public / Client accent (Discretion Emerald)
  clientAccent: '#065F46',
  clientAccentMuted: '#D1FAE5',

  // Attorney accent (Institutional Indigo on dark)
  attorneyAccent: '#6366F1',
  attorneyBgPrimary: '#0B0D12',
  attorneyBgSecondary: '#111827',
  attorneyTextPrimary: '#F9FAFB',
  attorneyTextSecondary: '#9CA3AF',
  attorneyBorder: '#1F2937',

  // Status colors
  success: '#059669',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#2563EB',

  // Background
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  backgroundTertiary: '#F3F4F6',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Theme for client app (light)
export const clientTheme = {
  colors: {
    primary: colors.clientAccent,
    primaryMuted: colors.clientAccentMuted,
    background: colors.white,
    backgroundSecondary: colors.backgroundSecondary,
    text: colors.textPrimary,
    textSecondary: colors.textSecondary,
    border: colors.border,
    card: colors.white,
  },
};

// Theme for attorney app (dark)
export const attorneyTheme = {
  colors: {
    primary: colors.attorneyAccent,
    primaryMuted: colors.attorneyBgSecondary,
    background: colors.attorneyBgPrimary,
    backgroundSecondary: colors.attorneyBgSecondary,
    text: colors.attorneyTextPrimary,
    textSecondary: colors.attorneyTextSecondary,
    border: colors.attorneyBorder,
    card: colors.attorneyBgSecondary,
  },
};

export type Theme = typeof clientTheme;

// Convenience exports for attorney screens (dark theme)
export const attorneyColors = {
  accent: colors.attorneyAccent,
  bgPrimary: colors.attorneyBgPrimary,
  bgSecondary: colors.attorneyBgSecondary,
  textPrimary: colors.attorneyTextPrimary,
  textSecondary: colors.attorneyTextSecondary,
  border: colors.attorneyBorder,
  error: colors.error,
};

// Convenience exports for client screens (light theme)
export const clientColors = {
  accent: colors.clientAccent,
  accentMuted: colors.clientAccentMuted,
  bgPrimary: colors.white,
  bgSecondary: colors.backgroundSecondary,
  textPrimary: colors.textPrimary,
  textSecondary: colors.textSecondary,
  border: colors.border,
};
