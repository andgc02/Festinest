import { StyleSheet } from 'react-native';
import { Colors } from '../colors';

export const ButtonStyles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: '#E2E8F0', // Slate-200
  },
  textPrimary: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

