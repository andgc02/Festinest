import { Pressable, PressableProps, StyleSheet, Text, View } from 'react-native';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

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
      className={cn(
        'flex-row items-center gap-2 rounded-full border px-4 py-2',
        selected ? 'border-primary bg-primary/15' : 'border-slate-700/70 bg-transparent',
        selected ? 'active:bg-primary/25' : 'active:bg-slate-800/60',
        className,
      )}
      style={[
        styles.base,
        selected ? styles.selected : styles.unselected,
        props.style as any,
      ]}
      {...props}>
      {leadingIcon ? <View className="h-4 w-4 items-center justify-center">{leadingIcon}</View> : null}
      <Text
        className={cn('text-sm font-semibold', selected ? 'text-primary' : 'text-slate-200', labelClassName)}
        style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>
        {label}
      </Text>
      {badge !== undefined ? (
        <View style={[styles.badge, selected && styles.badgeSelected]} className={cn('rounded-full bg-slate-700/60 px-2 py-0.5', selected && 'bg-primary/20')}>
          <Text style={[styles.badgeText, selected && styles.labelSelected]} className={cn('text-xs font-semibold text-slate-200', selected && 'text-primary')}>{badge}</Text>
        </View>
      ) : null}
      {trailingIcon ? <View className="h-4 w-4 items-center justify-center">{trailingIcon}</View> : null}
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
