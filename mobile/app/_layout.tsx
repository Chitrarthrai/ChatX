import React from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { colors } from '@chatx/config';

const queryClient = new QueryClient();

const primary = colors.primitives.primary[500];
const bg = colors.semantic.dark.background;
const card = colors.semantic.dark.card;
const muted = colors.semantic.dark.mutedForeground;

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: card,
            borderTopColor: '#1f2937',
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: primary,
          tabBarInactiveTintColor: muted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'Home', tabBarIcon: ({ color }) => <TabIcon label="🏠" color={color} /> }}
        />
        <Tabs.Screen
          name="chats"
          options={{ title: 'Chats', tabBarIcon: ({ color }) => <TabIcon label="💬" color={color} /> }}
        />
        <Tabs.Screen
          name="meetings"
          options={{ title: 'Meetings', tabBarIcon: ({ color }) => <TabIcon label="📹" color={color} /> }}
        />
        <Tabs.Screen
          name="calls"
          options={{ title: 'Calls', tabBarIcon: ({ color }) => <TabIcon label="📞" color={color} /> }}
        />
        <Tabs.Screen
          name="profile"
          options={{ title: 'Profile', tabBarIcon: ({ color }) => <TabIcon label="👤" color={color} /> }}
        />
      </Tabs>
    </QueryClientProvider>
  );
}

function TabIcon({ label, color }: { label: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 22, opacity: color === muted ? 0.5 : 1 }}>{label}</Text>;
}
