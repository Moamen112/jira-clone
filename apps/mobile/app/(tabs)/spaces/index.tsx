import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../../src/components/base';
import { useTheme, spacing } from '../../../src/tokens';

/**
 * TODO(SPACES): Implement the project list per SPACES_TAB_TASK.md (repo root).
 * Router contract is protected — this file must keep existing as a route at
 * `/(tabs)/spaces`.
 */
export default function SpacesIndexScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.paper }]}>
      <Text variant="heading" bold>
        Spaces
      </Text>
      <Text
        variant="body"
        muted
        style={{ marginTop: spacing[2], textAlign: 'center' }}
      >
        Task pending — see SPACES_TAB_TASK.md
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