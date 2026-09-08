import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Badge,
  Avatar,
  AvatarGroup,
  Button,
  Input,
  Divider,
} from '../../src/components/base';
import { colors } from '../../src/tokens/colors';
import { spacing } from '../../src/tokens/spacing';
import { radius } from '../../src/tokens/radius';

interface SpaceItem {
  id: string;
  name: string;
  key: string;
  description: string;
  members: { name: string }[];
  issuesCount: { todo: number; inProgress: number; done: number };
}

export default function SpacesScreen() {
  const [search, setSearch] = useState('');

  const spaces: SpaceItem[] = [
    {
      id: 'space-1',
      name: 'Fieldnotes Core',
      key: 'FIELD',
      description: 'Core product roadmap and design system primitives.',
      members: [
        { name: 'Alex Morgan' },
        { name: 'Sarah Connor' },
        { name: 'David Kim' },
      ],
      issuesCount: { todo: 4, inProgress: 2, done: 12 },
    },
    {
      id: 'space-2',
      name: 'Jira Mobile Client',
      key: 'MOB',
      description: 'Expo React Native application and mobile workflows.',
      members: [
        { name: 'Sarah Connor' },
        { name: 'Elena Rostova' },
      ],
      issuesCount: { todo: 6, inProgress: 3, done: 5 },
    },
    {
      id: 'space-3',
      name: 'Cloud Infrastructure',
      key: 'OPS',
      description: 'Deployment pipelines, serverless functions, and monitoring.',
      members: [
        { name: 'David Kim' },
        { name: 'Marcus Brody' },
      ],
      issuesCount: { todo: 1, inProgress: 1, done: 18 },
    },
  ];

  const filteredSpaces = spaces.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Header Actions */}
      <View style={styles.topBar}>
        <Input
          placeholder="Search spaces..."
          value={search}
          onChangeText={setSearch}
          containerStyle={{ flex: 1, marginBottom: 0 }}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text variant="subheading" bold>
          All Spaces ({filteredSpaces.length})
        </Text>
        <Button label="+ New Space" size="sm" variant="primary" />
      </View>

      {/* Spaces List */}
      {filteredSpaces.map((space) => (
        <View key={space.id} style={styles.spaceCard}>
          <View style={styles.cardHeader}>
            <View style={styles.titleArea}>
              <Badge label={space.key} variant="mono" />
              <Text variant="heading" bold style={{ marginTop: 6 }}>
                {space.name}
              </Text>
            </View>
            <AvatarGroup users={space.members} max={2} size="sm" />
          </View>

          <Text variant="bodySmall" muted style={styles.description}>
            {space.description}
          </Text>

          <Divider margin={2} />

          {/* Counts */}
          <View style={styles.countsRow}>
            <View style={styles.countPill}>
              <Text variant="caption" muted>To Do: </Text>
              <Text variant="caption" bold>{space.issuesCount.todo}</Text>
            </View>
            <View style={styles.countPill}>
              <Text variant="caption" color={colors.light.accent} bold>
                Active: {space.issuesCount.inProgress}
              </Text>
            </View>
            <View style={styles.countPill}>
              <Text variant="caption" color={colors.light.inkMuted}>
                Done: {space.issuesCount.done}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light.paper,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[6],
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  spaceCard: {
    backgroundColor: colors.light.surface,
    padding: spacing[4],
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.light.line,
    marginBottom: spacing[3],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleArea: {
    flex: 1,
    marginRight: spacing[2],
  },
  description: {
    marginTop: spacing[2],
    lineHeight: 20,
  },
  countsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginTop: spacing[1],
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
