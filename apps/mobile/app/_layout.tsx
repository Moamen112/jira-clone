import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#EDEBE4',
          },
          headerTintColor: '#1C1E1B',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#EDEBE4',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Jira Clone',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
