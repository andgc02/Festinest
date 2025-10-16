import { Pressable, PressableProps, Text, View } from 'react-native';
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
      {...props}>
      {leadingIcon ? <View className="h-4 w-4 items-center justify-center">{leadingIcon}</View> : null}
      <Text
        className={cn(
          'text-sm font-semibold',
          selected ? 'text-primary' : 'text-slate-200',
          labelClassName,
        )}>
        {label}
      </Text>
      {badge !== undefined ? (
        <View className={cn('rounded-full bg-slate-700/60 px-2 py-0.5', selected && 'bg-primary/20')}>
          <Text className={cn('text-xs font-semibold text-slate-200', selected && 'text-primary')}>{badge}</Text>
        </View>
      ) : null}
      {trailingIcon ? <View className="h-4 w-4 items-center justify-center">{trailingIcon}</View> : null}
    </Pressable>
  );
}
