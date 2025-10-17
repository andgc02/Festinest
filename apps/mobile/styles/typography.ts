import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const Typography = StyleSheet.create({
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  body: {
    fontSize: 16,
    color: Colors.text,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.muted,
  },
  caption: {
    fontSize: 12,
    color: Colors.muted,
    textTransform: 'uppercase',
  },
});

