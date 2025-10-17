import { Pressable, PressableProps, StyleSheet, Text, View } from 'react-native';
import { ReactNode } from 'react';


type FilterChipProps = PressableProps & {
  label: string;
  selected?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  badge?: string | number;
  className?: string;
  labelClassName?: string;
};

export function FilterChip({
  label,
  selected = false,
  leadingIcon,
  trailingIcon,
  badge,
  className,
  labelClassName,
  ...props
}: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={[
        styles.base,
        selected ? styles.selected : styles.unselected,
        props.style as any,
      ]}
      {...props}>
      {leadingIcon ? <View style={{ height: 16, width: 16, alignItems: 'center', justifyContent: 'center' }}>{leadingIcon}</View> : null}
      <Text
        style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>
        {label}
      </Text>
      {badge !== undefined ? (
        <View style={[styles.badge, selected && styles.badgeSelected]}>
          <Text style={[styles.badgeText, selected && styles.labelSelected]}>{badge}</Text>
        </View>
      ) : null}
      {trailingIcon ? <View style={{ height: 16, width: 16, alignItems: 'center', justifyContent: 'center' }}>{trailingIcon}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selected: { borderColor: '#5A67D8', backgroundColor: 'rgba(90,103,216,0.15)' },
  unselected: { borderColor: 'rgba(51,65,85,0.70)', backgroundColor: 'transparent' },
  label: { fontSize: 14, fontWeight: '600' },
  labelSelected: { color: '#5A67D8' },
  labelUnselected: { color: '#E2E8F0' },
  badge: { borderRadius: 9999, backgroundColor: 'rgba(71,85,105,0.60)', paddingHorizontal: 8, paddingVertical: 2 },
  badgeSelected: { backgroundColor: 'rgba(90,103,216,0.20)' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#E2E8F0' },
});
