import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../src/components/base';
import { useTheme, spacing } from '../../src/tokens';

export default function NotificationsScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.paper }]}>
      <Text variant="display" bold>
        Notifications
      </Text>
      <Text variant="body" muted style={{ marginTop: spacing[2], textAlign: 'center' }}>
        Welcome to Notifications
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
});
