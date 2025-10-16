import { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';

import { cn } from '@/lib/utils';

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

const typeStyles: Record<ToastType, string> = {
  info: 'bg-slate-900/95 border border-slate-700/60',
  success: 'bg-emerald-500/90 border border-emerald-400/60',
  warning: 'bg-amber-500/90 border border-amber-400/60',
  error: 'bg-red-500/90 border border-red-400/60',
};

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
    <View className="pointer-events-none absolute bottom-12 left-0 right-0 items-center px-6">
      <Animated.View
        style={{ opacity }}
        className={cn(
          'w-full max-w-xl rounded-2xl px-4 py-3 shadow-lg shadow-slate-950/40',
          typeStyles[type],
          className,
        )}>
        {title ? <Text className="text-sm font-semibold text-slate-50">{title}</Text> : null}
        <Text className={cn('text-sm', type === 'info' ? 'text-slate-200' : 'text-white')}>{message}</Text>
      </Animated.View>
    </View>
  );
}
