import React from 'react';
import { Tabs, router } from 'expo-router';
import { HomeIcon, GridIcon, NotificationsIcon, PersonIcon } from '../../assets/icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/tokens';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom > 0 ? insets.bottom : 8;
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.ink,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      {/* 1. Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'Jira Clone',
          tabBarIcon: ({ color, focused }) => (
            <HomeIcon size={24} color={color} focused={focused} />
          ),
        }}
      />

      {/* 2. Spaces Tab */}
      <Tabs.Screen
        name="spaces"
        options={{
          title: 'Spaces',
          headerTitle: 'Spaces',
          tabBarIcon: ({ color, focused }) => (
            <GridIcon size={24} color={color} focused={focused} />
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            router.replace('/(tabs)/spaces');
          },
        })}
      />

      {/* 3. Notifications Tab */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          headerTitle: 'Notifications',
          tabBarIcon: ({ color, focused }) => (
            <NotificationsIcon size={24} color={color} focused={focused} />
          ),
        }}
      />

      {/* 4. Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <PersonIcon size={24} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
