import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  mockCards,
  mockColumns,
  mockProjects,
  mockUsers,
  mockCurrentUser,
  mockActivityLogs,
  Card as CardType,
  BoardColumn,
} from '@jira-clone/shared';
import { Text, Badge, Avatar } from '../../src/components/base';
import { StatusBar } from '../../src/components/shared/status-bar';
import { PriorityBadge } from '../../src/components/shared/priority-badge';
import { ActivityLog } from '../../src/components/shared/activity-log';
import { useTheme, spacing, radius, ThemeMode } from '../../src/tokens';

const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system'];
const THEME_MODE_LABELS: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getStatus(columnId: string): BoardColumn {
  return (
    mockColumns.find((c) => c.id === columnId) ?? {
      id: columnId,
      projectId: '',
      title: 'Unknown',
      order: 0,
    }
  );
}

function isAssignedToUser(card: CardType, userId: string): boolean {
  return (
    card.assigneeId === userId ||
    (card.assigneeIds !== undefined && card.assigneeIds.includes(userId))
  );
}

/**
 * Home dashboard — greeting, theme switcher, quick stats, my work,
 * project shortcuts, and recent activity. Deep-links into the Spaces stack.
 */
export default function HomeScreen() {
  const { colors, mode, setThemeMode } = useTheme();
  const router = useRouter();

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const assignedCount = mockCards.filter((c) =>
    isAssignedToUser(c, mockCurrentUser.id)
  ).length;
  const createdCount = mockCards.filter(
    (c) => c.publisherId === mockCurrentUser.id
  ).length;

  const myWork = mockCards
    .filter(
      (c) =>
        isAssignedToUser(c, mockCurrentUser.id) ||
        c.publisherId === mockCurrentUser.id
    )
    .sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  const openCard = (cardId: string) => {
    router.push({
      pathname: '/(tabs)/spaces/card',
      params: { cardId },
    });
  };

  const openProject = (projectId: string) => {
    router.push({
      pathname: '/(tabs)/spaces/project',
      params: { projectId },
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.paper }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text variant="heading" bold>
              {getGreeting()}, {mockCurrentUser.name.split(' ')[0]} 👋
            </Text>
            <Text variant="caption" muted style={styles.dateLabel}>
              {todayLabel}
            </Text>
          </View>

          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            style={({ pressed }) => [
              styles.avatarButton,
              pressed && styles.avatarButtonPressed,
            ]}
          >
            <Avatar
              name={mockCurrentUser.name}
              imageUrl={mockCurrentUser.avatarUrl}
              size="md"
              bordered
              borderColor={colors.paper}
            />
          </Pressable>
        </View>

        {/* Theme switcher */}
        <View style={[styles.themeSwitcher, { backgroundColor: colors.paper }]}>
          {THEME_MODES.map((m) => {
            const active = mode === m;
            return (
              <Pressable
                key={m}
                onPress={() => setThemeMode(m)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${THEME_MODE_LABELS[m]} theme`}
                style={({ pressed }) => [
                  styles.themeChip,
                  active
                    ? { backgroundColor: colors.accentSoft }
                    : pressed
                    ? { backgroundColor: colors.line }
                    : undefined,
                ]}
              >
                <Text
                  variant="caption"
                  bold
                  color={active ? colors.accent : colors.inkMuted}
                >
                  {THEME_MODE_LABELS[m]}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {/* Quick stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Assigned', count: assignedCount },
            { label: 'Created', count: createdCount },
            { label: 'Projects', count: mockProjects.length },
          ].map((stat) => (
            <View
              key={stat.label}
              style={[
                styles.statChip,
                { backgroundColor: colors.surface, borderColor: colors.line },
              ]}
            >
              <Text variant="heading" bold>
                {stat.count}
              </Text>
              <Text variant="caption" muted>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* My work */}
        <Text variant="sectionLabel" muted style={styles.sectionTitle}>
          MY WORK ({myWork.length})
        </Text>
        {myWork.map((card) => (
          <Pressable
            key={card.id}
            onPress={() => openCard(card.id)}
            accessibilityRole="button"
            accessibilityLabel={`Open card ${card.key}: ${card.title}`}
            style={({ pressed }) => [
              styles.workRow,
              {
                backgroundColor: pressed ? colors.paper : colors.surface,
                borderColor: pressed ? colors.accent : colors.line,
              },
            ]}
          >
            <View style={styles.workText}>
              <Text variant="monoKey" muted>
                {card.key}
              </Text>
              <Text
                variant="bodySmall"
                bold
                numberOfLines={2}
                style={styles.workTitle}
              >
                {card.title}
              </Text>
            </View>

            <View style={styles.workMeta}>
              <StatusBar status={getStatus(card.columnId)} size="sm" />
              <PriorityBadge
                priority={card.priority}
                size="sm"
                showLabel={false}
              />
            </View>
          </Pressable>
        ))}
        {/* Projects */}
        <Text variant="sectionLabel" muted style={styles.sectionTitle}>
          YOUR PROJECTS ({mockProjects.length})
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.projectsScroll}
        >
          {mockProjects.map((project) => (
            <Pressable
              key={project.id}
              onPress={() => openProject(project.id)}
              accessibilityRole="button"
              accessibilityLabel={`Open project ${project.name}`}
              style={({ pressed }) => [
                styles.projectChip,
                {
                  backgroundColor: colors.surface,
                  borderColor: pressed ? colors.accent : colors.line,
                },
              ]}
            >
              <Badge label={project.key} variant="mono" />
              <Text
                variant="caption"
                bold
                numberOfLines={1}
                style={styles.projectChipName}
              >
                {project.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Recent activity */}
        <ActivityLog
          logs={mockActivityLogs}
          users={mockUsers}
          title="RECENT ACTIVITY"
          maxItems={6}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[6],
    gap: spacing[4],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  headerText: {
    flex: 1,
  },
  dateLabel: {
    marginTop: spacing[1],
  },
  avatarButton: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButtonPressed: {
    opacity: 0.8,
  },
  themeSwitcher: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    padding: 2,
    gap: 2,
    alignItems: 'center',
  },
  themeChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
    borderRadius: radius.pill - 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  statChip: {
    flex: 1,
    borderRadius: radius.card,
    borderWidth: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    gap: spacing[1],
  },
  sectionTitle: {
    letterSpacing: 0.8,
    marginBottom: spacing[1],
  },
  workRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing[3],
  },
  workText: {
    flex: 1,
  },
  workTitle: {
    marginTop: 2,
    lineHeight: 18,
  },
  workMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  projectsScroll: {
    gap: spacing[2],
    paddingBottom: spacing[1],
    alignItems: 'center',
  },
  projectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  projectChipName: {
    maxWidth: 130,
    color: '#1C1E1B',
  },
});