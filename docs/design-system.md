# Festinest Design System (StyleSheet Edition)

This app uses a lightweight, React Native StyleSheet-based design system. It replaces the previous Tailwind/NativeWind setup to simplify bundling and reduce moving parts.

## 1. Core Color Tokens

File: `apps/mobile/styles/colors.ts`

```
export const Colors = {
  primary: '#5A67D8',         // Indigo
  accent: '#38B2AC',          // Teal
  background: '#F7FAFC',      // Light gray
  surface: '#FFFFFF',         // White cards
  text: '#1A202C',            // Slate 800
  muted: '#A0AEC0',           // Slate 400
  error: '#E53E3E',           // Red
  warning: '#F6AD55',         // Orange
  darkBg: '#0F172A',          // For dark mode later
};
```

## 2. Base Typography

File: `apps/mobile/styles/typography.ts`

```
import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const Typography = StyleSheet.create({
  heading: { fontSize: 22, fontWeight: '700', color: Colors.text },
  body: { fontSize: 16, color: Colors.text },
  label: { fontSize: 14, fontWeight: '500', color: Colors.muted },
  caption: { fontSize: 12, color: Colors.muted, textTransform: 'uppercase' },
});
```

Usage:

```
import { Typography } from '@/styles/typography';
<Text style={Typography.heading}>My Schedule</Text>
```

## 3. Reusable Component Styles

Buttons — `apps/mobile/styles/components/Button.ts`

```
export const ButtonStyles = StyleSheet.create({
  base: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: '#E2E8F0' },
  textPrimary: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
});
```

Cards — `apps/mobile/styles/components/Card.ts`

```
export const CardStyles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
```

Chips — `apps/mobile/styles/components/Chip.ts`

```
export const ChipStyles = StyleSheet.create({
  base: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.muted, marginRight: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  selected: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  text: { fontSize: 14, fontWeight: '500', color: Colors.text },
});
```

## 4. Spacing & Layout

File: `apps/mobile/styles/spacing.ts`

```
export const Spacing = {
  screenPadding: 16,
  sectionGap: 24,
  cardGap: 12,
  inputHeight: 48,
  avatarSize: 40,
};
```

Use in screens: `style={{ paddingHorizontal: Spacing.screenPadding }}`

## 5. Animations

Use `react-native-reanimated` (already configured) or `react-native-animatable` if you want declarative helpers. Current Toast uses `Animated` for fade in/out.

## 6. Migration Notes

- NativeWind and Tailwind have been removed from the app.
- New screens and components should import tokens from `apps/mobile/styles/*`.
- Legacy helpers in `constants/theme.ts` remain for compatibility (`Colors` object used by navigation). Prefer the new tokens for future work.

