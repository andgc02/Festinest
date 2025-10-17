import { StyleSheet } from 'react-native';
import { Colors } from '../colors';

export const ChipStyles = StyleSheet.create({
  base: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.muted,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
});

