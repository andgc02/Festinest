import { ActivityIndicator, Animated, Pressable, PressableProps, StyleSheet, Text } from 'react-native';
import { ReactNode, useRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'md' | 'lg';

type ButtonProps = PressableProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
  className?: string; // kept for backwards compatibility; ignored
  textClassName?: string; // kept for backwards compatibility; ignored
};

// Legacy NativeWind class maps removed in favor of StyleSheet styles.

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
  const scale = useRef(new Animated.Value(1)).current;
  const animateTo = (toValue: number) =>
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 20, bounciness: 6 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={[
        styles.base,
        size === 'md' ? styles.sizeMd : styles.sizeLg,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        (disabled || loading) && styles.disabled,
        props.style as any,
      ]}
      onPressIn={() => animateTo(0.98)}
      onPressOut={() => animateTo(1)}
      {...props}>
      {loading ? (
        <ActivityIndicator color="#5A67D8" />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'primary' && styles.textOnPrimary,
            variant === 'secondary' && styles.textOnSecondary,
            variant === 'outline' && styles.textOnOutline,
          ]}>
          {children}
        </Text>
      )}
      </Pressable>
    </Animated.View>
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
  primary: { backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#CBD5E1' },
  secondary: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#CBD5E1' },
  disabled: { opacity: 0.6 },
  text: { fontSize: 16, fontWeight: '600' },
  textOnPrimary: { color: '#1A202C' },
  textOnSecondary: { color: '#1A202C' },
  textOnOutline: { color: '#1A202C' },
});
