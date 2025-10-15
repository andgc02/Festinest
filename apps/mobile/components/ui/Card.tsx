import { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

import { cn } from '@/lib/utils';

type CardProps = ViewProps & {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View className={cn('rounded-2xl bg-slate-900/70 p-4 shadow-card', className)} {...props}>
      {children}
    </View>
  );
}
