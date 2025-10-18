import { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, ViewStyle } from 'react-native';

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [shimmer]);

  const animatedStyle: StyleProp<ViewStyle> = {
    opacity: shimmer.interpolate({
      inputRange: [0, 1],
      outputRange: [0.55, 0.95],
    }),
  };

  return <Animated.View style={[styles.base, { width, height, borderRadius }, animatedStyle, style]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#E2E8F0',
  },
});
