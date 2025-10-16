import { ActivityIndicator, Pressable, PressableProps, StyleSheet, Text } from 'react-native';
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
      style={[
        styles.base,
        size === 'md' ? styles.sizeMd : styles.sizeLg,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        (disabled || loading) && styles.disabled,
        props.style as any,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#38B2AC' : '#F8FAFC'} />
      ) : (
        <Text
          className={cn('text-base font-semibold', variantClass.text, textClassName)}
          style={[styles.text, variant === 'primary' && styles.textOnPrimary, variant === 'secondary' && styles.textOnSecondary, variant === 'outline' && styles.textOnOutline]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  sizeMd: { height: 48, paddingHorizontal: 20 },
  sizeLg: { height: 56, paddingHorizontal: 24 },
  primary: { backgroundColor: '#5A67D8' },
  secondary: { backgroundColor: 'rgba(56,178,172,0.20)', borderWidth: 1, borderColor: 'rgba(56,178,172,0.60)' },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#475569' },
  disabled: { opacity: 0.6 },
  text: { fontSize: 16, fontWeight: '600' },
  textOnPrimary: { color: '#F8FAFC' },
  textOnSecondary: { color: '#38B2AC' },
  textOnOutline: { color: '#F1F5F9' },
});
