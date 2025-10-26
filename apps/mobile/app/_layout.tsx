import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors } from '@/styles/colors';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { SavedFestivalsProvider } from '@/providers/SavedFestivalsProvider';
import { OnboardingProvider, useOnboarding } from '@/providers/OnboardingProvider';

export default function RootLayout() {
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(Colors.background);
    // Navigation bar styling requires a dev build when edge-to-edge is enabled in Expo Go.
  }, []);

  return (
    <AuthProvider>
      <SavedFestivalsProvider>
        <OnboardingProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <ThemeProvider value={DefaultTheme}>
                <RootNavigator />
                <StatusBar style="dark" backgroundColor={Colors.background} translucent={false} />
              </ThemeProvider>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </OnboardingProvider>
      </SavedFestivalsProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { initializing, user } = useAuth();
  const { loading: onboardingLoading, completed: onboardingComplete } = useOnboarding();

  if (initializing) {
    return null;
  }

  if (!user) {
    return (
      <Stack screenOptions={{ headerTitleAlign: 'center' }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    );
  }

  if (onboardingLoading) {
    return null;
  }

  if (!onboardingComplete) {
    return (
      <Stack screenOptions={{ headerTitleAlign: 'center' }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="festival/[festivalId]"
        options={{
          title: 'Festival',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="schedule-builder"
        options={{
          title: 'Build Schedule',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
        }}
      />
      <Stack.Screen
        name="group/[groupId]"
        options={{
          title: 'Group',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
        }}
      />
      <Stack.Screen
        name="companion"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
    </Stack>
  );
}
