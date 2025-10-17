import { Platform, StyleSheet, TextStyle } from 'react-native';

/**
 * Central design tokens that align with tailwind.config.js.
 * Keep these in sync when adding new primitives so screens and components share a single source of truth.
 */
export const palette = {
  primary: '#5A67D8',
  accent: '#38B2AC',
  warning: '#F6AD55',
  error: '#E53E3E',
  backgroundLight: '#F7FAFC',
  backgroundDark: '#040A1A',
  surfaceDark: '#0F172A',
  slate50: '#F8FAFC',
  slate200: '#E2E8F0',
  slate300: '#CBD5F5',
  slate400: '#94A3B8',
  slate600: '#475569',
  slate800: '#1E293B',
  graphite: '#1A202C',
};

export const typography = {
  display: 'text-3xl font-semibold text-slate-50',
  heading: 'text-2xl md:text-[28px] font-semibold text-slate-50',
  subheading: 'text-xl font-semibold text-slate-100',
  body: 'text-base text-slate-300',
  bodyStrong: 'text-base font-semibold text-slate-100',
  caption: 'text-xs text-slate-400',
  overline: 'text-[11px] uppercase tracking-[0.3em] text-slate-400',
};

/**
 * React Native style equivalents for when NativeWind is disabled.
 * Prefer these over class strings on Text.
 */
export const typographyRN: Record<keyof typeof typography, TextStyle> = StyleSheet.create({
  display: { fontSize: 24, fontWeight: '600', color: '#F8FAFC' },
  heading: { fontSize: 22, fontWeight: '600', color: '#F8FAFC' },
  subheading: { fontSize: 18, fontWeight: '600', color: '#F1F5F9' },
  body: { fontSize: 16, color: '#CBD5E1' },
  bodyStrong: { fontSize: 16, color: '#F1F5F9', fontWeight: '600' },
  caption: { fontSize: 12, color: '#94A3B8' },
  overline: { fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.8 },
});

export const components = {
  card: 'rounded-2xl bg-slate-900/70 p-4 shadow-card',
  modal: 'rounded-3xl bg-slate-900/95 p-6',
  buttonPrimary: 'bg-primary rounded-xl px-6 py-3',
  chip: 'rounded-full border border-slate-700/70 px-4 py-2',
};

const tintColorLight = palette.primary;
const tintColorDark = '#FFFFFF';

export const Colors = {
  light: {
    text: palette.graphite,
    background: palette.backgroundLight,
    tint: tintColorLight,
    icon: palette.slate600,
    tabIconDefault: palette.slate400,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: palette.slate50,
    background: palette.backgroundDark,
    tint: tintColorDark,
    icon: palette.slate400,
    tabIconDefault: palette.slate600,
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const FONT_SIZES = {
  heading: 'text-2xl font-semibold',
  body: 'text-base text-slate-800',
  caption: 'text-xs text-slate-400',
};
