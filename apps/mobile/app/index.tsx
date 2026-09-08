import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Badge, Avatar } from '../src/components/base';
import { colors } from '../src/tokens/colors';
import { spacing } from '../src/tokens/spacing';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Avatar name="Alex Morgan" size="lg" />
        <View style={styles.headerInfo}>
          <Text variant="heading" bold>
            Welcome to Fieldnotes
          </Text>
          <Text variant="caption" muted>
            Jira Clone Mobile App
          </Text>
        </View>
      </View>

      <View style={styles.badgesRow}>
        <Badge label="FIELD-1" variant="mono" />
        <Badge label="In Progress" variant="accent" />
        <Badge label="Publisher" variant="default" />
      </View>

      <View style={styles.cardPreview}>
        <Text variant="issueTitle" bold>
          Design System & Base Components
        </Text>
        <Text variant="bodySmall" muted style={{ marginTop: spacing[1] }}>
          Reusable React Native components styled with Fieldnotes design tokens.
        </Text>
      </View>

      <Button
        label="Explore Board"
        variant="primary"
        fullWidth
        style={{ marginTop: spacing[4] }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.paper,
  },
  content: {
    padding: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  headerInfo: {
    marginLeft: spacing[3],
    flex: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  cardPreview: {
    backgroundColor: colors.light.surface,
    padding: spacing[4],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.line,
  },
});
