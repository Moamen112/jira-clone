import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../../src/components/base';
import { useTheme, spacing } from '../../../src/tokens';

/**
 * TODO(SPACES): Implement the project board per SPACES_TAB_TASK.md (repo root).
 * Reads `projectId` via useLocalSearchParams(). Router contract is protected —
 * this file must keep existing as a route at `/(tabs)/spaces/project`.
 */
export default function SpacesProjectScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.paper }]}>
      <Text variant="heading" bold>
        Project
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