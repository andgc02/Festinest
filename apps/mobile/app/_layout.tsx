import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { initializing, user } = useAuth();

  if (initializing) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      {!user ? (
        <Stack.Screen name="login" options={{ headerShown: false }} />
      ) : (
        <>
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
              headerStyle: { backgroundColor: '#050914' },
              headerTintColor: '#f8fafc',
            }}
          />
          <Stack.Screen
            name="group/[groupId]"
            options={{
              title: 'Group',
              headerStyle: { backgroundColor: '#050914' },
              headerTintColor: '#f8fafc',
            }}
          />
        </>
      )}
    </Stack>
  );
}
