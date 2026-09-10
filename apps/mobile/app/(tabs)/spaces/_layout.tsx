import React from 'react';
import { Stack } from 'expo-router';

/**
 * Spaces section — a Stack navigator nested inside the Tabs group:
 *   index   → project list
 *   project → project detail (board)
 *   card    → card detail
 */
export default function SpacesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="project" options={{ headerShown: false }} />
      <Stack.Screen name="card" options={{ headerShown: false }} />
    </Stack>
  );
}