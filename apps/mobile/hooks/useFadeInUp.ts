import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

type Options = {
  delay?: number;
  offset?: number;
  duration?: number;
  enabled?: boolean;
};

/**
 * Shared fade-in-up animation for list items and chips.
 */
export function useFadeInUp({ delay = 0, offset = 12, duration = 220, enabled = true }: Options = {}) {
  const opacity = useRef(new Animated.Value(enabled ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(enabled ? offset : 0)).current;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [delay, duration, enabled, offset, opacity, translateY]);

  return {
    opacity,
    transform: [{ translateY }],
  };
}

