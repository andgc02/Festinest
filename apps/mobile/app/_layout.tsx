import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/styles/colors';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { SavedFestivalsProvider } from '@/providers/SavedFestivalsProvider';

export default function RootLayout() {
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(Colors.background);
    // Navigation bar styling requires a dev build when edge-to-edge is enabled in Expo Go.
  }, []);

  return (
    <AuthProvider>
      <SavedFestivalsProvider>
        <SafeAreaProvider>
          <ThemeProvider value={DefaultTheme}>
            <RootNavigator />
            <StatusBar style="dark" backgroundColor={Colors.background} translucent={false} />
          </ThemeProvider>
        </SafeAreaProvider>
      </SavedFestivalsProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { initializing, user } = useAuth();

  if (initializing) {
    return null;
  }

  if (!user) {
    return (
      <Stack screenOptions={{ headerTitleAlign: 'center' }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
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
    </Stack>
  );
}
