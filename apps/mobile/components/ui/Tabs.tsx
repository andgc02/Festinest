import { Pressable, ScrollView, Text, View } from 'react-native';

import { cn } from '@/lib/utils';

export type TabItem = {
  key: string;
  label: string;
  count?: number;
  disabled?: boolean;
};

type TabsVariant = 'pill' | 'underline';

type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  variant?: TabsVariant;
  className?: string;
  tabClassName?: string;
};

export function Tabs({
  items,
  value,
  onChange,
  variant = 'pill',
  className,
  tabClassName,
}: TabsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className={cn('flex-none', className)}>
      {items.map((item, index) => {
        const isActive = item.key === value;
        const disabled = item.disabled;
        const isLast = index === items.length - 1;
        const pressableClasses =
          variant === 'pill'
            ? cn(
                'mr-3 flex-row items-center gap-2 rounded-full border px-4 py-2',
                isActive ? 'border-primary bg-primary/15' : 'border-slate-700/60 bg-transparent',
                isActive ? 'active:bg-primary/25' : 'active:bg-slate-800/60',
                disabled && 'opacity-50',
                isLast && 'mr-0',
                tabClassName,
              )
            : cn(
                'mr-6 flex-row items-center gap-2 pb-2',
                isActive ? 'border-b-2 border-primary' : 'border-b-2 border-transparent',
                disabled && 'opacity-50',
                isLast && 'mr-0',
                tabClassName,
              );

        return (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            hitSlop={8}
            disabled={disabled}
            className={pressableClasses}
            onPress={() => onChange(item.key)}>
            <Text
              className={cn(
                'text-sm font-semibold',
                isActive ? 'text-primary' : 'text-slate-300',
                variant === 'underline' && 'text-base',
              )}>
              {item.label}
            </Text>
            {item.count !== undefined ? (
              <View className={cn('rounded-full bg-slate-800/70 px-2 py-0.5', isActive && 'bg-primary/20')}>
                <Text className={cn('text-xs font-semibold text-slate-200', isActive && 'text-primary')}>
                  {item.count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
