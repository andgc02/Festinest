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
  selected: { borderColor: '#CBD5E1', backgroundColor: '#E2E8F0' },
  unselected: { borderColor: '#E2E8F0', backgroundColor: 'transparent' },
  label: { fontSize: 14, fontWeight: '600' },
  labelSelected: { color: '#1A202C' },
  labelUnselected: { color: '#475569' },
  badge: { borderRadius: 9999, backgroundColor: '#E2E8F0', paddingHorizontal: 8, paddingVertical: 2 },
  badgeSelected: { backgroundColor: '#E2E8F0' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#475569' },
});
