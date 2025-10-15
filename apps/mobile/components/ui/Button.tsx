import { ActivityIndicator, Pressable, PressableProps, Text } from 'react-native';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'md' | 'lg';

type ButtonProps = PressableProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
  className?: string;
  textClassName?: string;
};

const variantClasses: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-accent/20 border border-accent/60',
    text: 'text-accent',
  },
  outline: {
    container: 'border border-slate-600 bg-transparent',
    text: 'text-slate-100',
  },
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-12 px-5',
  lg: 'h-14 px-6',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  textClassName,
  ...props
}: ButtonProps) {
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  const opacityClass = disabled || loading ? 'opacity-60' : 'active:opacity-80';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      className={cn(
        'flex-row items-center justify-center rounded-xl',
        variantClass.container,
        sizeClass,
        opacityClass,
        className,
      )}
      {...props}>
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#38B2AC' : '#F8FAFC'} />
      ) : (
        <Text className={cn('text-base font-semibold', variantClass.text, textClassName)}>{children}</Text>
      )}
    </Pressable>
  );
}
