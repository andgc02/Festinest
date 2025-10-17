import { Redirect, Tabs, usePathname } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/styles/colors';
import { useAuth } from '@/providers/AuthProvider';

export default function TabLayout() {
  const pathname = usePathname();
  const { user, initializing } = useAuth();

  // Gate tabs behind auth without side-effect navigation to avoid render loops
  if (!initializing && !user) {
    return <Redirect href="/login" />;
  }

  if (!initializing && user && (pathname === '/(tabs)' || pathname === '/(tabs)/')) {
    return <Redirect href="/(tabs)/festivals" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top', 'bottom']}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#5A67D8',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: '#E2E8F0',
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="festivals/index"
          options={{
            title: 'Festivals',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="sparkles" color={color} />,
          }}
        />
        <Tabs.Screen
          name="artists/index"
          options={{
            title: 'Artists',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="music.mic" color={color} />,
          }}
        />
        <Tabs.Screen
          name="schedule/index"
          options={{
            title: 'Schedule',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="groups/index"
          options={{
            title: 'Groups',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.3.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings/index"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
