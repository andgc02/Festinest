import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';


type ToastType = 'info' | 'success' | 'warning' | 'error';

type ToastProps = {
  visible: boolean;
  message: string;
  title?: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
  className?: string;
};

const typeStyles = StyleSheet.create({
  info: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  success: { backgroundColor: 'rgba(16,185,129,0.10)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.30)' },
  warning: { backgroundColor: 'rgba(245,158,11,0.10)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.30)' },
  error: { backgroundColor: 'rgba(239,68,68,0.10)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.30)' },
});

export function Toast({
  visible,
  message,
  title,
  type = 'info',
  duration = 2800,
  onHide,
  className,
}: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(visible);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
      hideTimeout.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(({ finished }) => {
          if (finished) {
            setShouldRender(false);
            onHide?.();
          }
        });
      }, duration);
    } else if (shouldRender) {
      Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }).start(({ finished }) => {
        if (finished) {
          setShouldRender(false);
          onHide?.();
        }
      });
    }

    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, [visible, duration, opacity, onHide, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[{ opacity }, styles.container, typeStyles[type]]}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <Text style={[styles.message, type !== 'info' && styles.message]}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    pointerEvents: 'none',
  },
  container: {
    width: '100%',
    maxWidth: 640,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#0b1220',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  title: { fontSize: 14, fontWeight: '600', color: '#1A202C' },
  message: { fontSize: 14, color: '#1A202C' },
});
