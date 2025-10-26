import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { ForwardedRef, forwardRef } from 'react';
import { View } from 'react-native';

export const HapticTab = forwardRef<View, BottomTabBarButtonProps>(function HapticTabInner(
  { onPress, onPressIn, children, ...rest }: BottomTabBarButtonProps,
  ref: ForwardedRef<View>,
) {
  return (
    <PlatformPressable
      ref={ref}
      {...rest}
      onPressIn={(event) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
            // Ignore simulator/runtime haptic failures.
          });
        }
        onPressIn?.(event);
      }}
      onPress={(event) => {
        onPress?.(event);
      }}>
      {children}
    </PlatformPressable>
  );
});
