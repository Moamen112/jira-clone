import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Card as CardType,
  BoardColumn,
  User,
  DashboardStats,
  ActivityLog as ActivityLogType,
  useAuth,
  useProjects,
  userService,
  taskService,
  backendTaskToCard,
  backendActivityToActivityLog,
  createDefaultBoardColumns,
} from '@jira-clone/shared';
import { Text, Badge, Avatar } from '../../src/components/base';
import { StatusBar } from '../../src/components/shared/status-bar';
import { PriorityBadge } from '../../src/components/shared/priority-badge';
import { ActivityLog } from '../../src/components/shared/activity-log';
import { EmptyState } from '../../src/components/shared/empty-state';
import { useTheme, spacing, radius } from '../../src/tokens';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getStatus(card: CardType): BoardColumn {
  const cols = createDefaultBoardColumns(card.projectId || 'default');
  return (
    cols.find((c) => c.id === card.columnId) ?? {
      id: card.columnId,
      projectId: card.projectId || '',
      title: card.columnId.includes('done')
        ? 'Done'
        : card.columnId.includes('review')
          ? 'In Review'
          : card.columnId.includes('qa')
            ? 'QA Review'
            : card.columnId.includes('progress')
              ? 'In Progress'
              : 'To Do',
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
 * Home dashboard — greeting, live KPIs, my work tasks, project shortcuts,
 * and recent activity. Deep-links into the Spaces stack.
 */
export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { plainProjects, fetchProjects, isLoading: projectsLoading, error: projectsError } = useProjects({ autoFetch: false });

  const [liveCards, setLiveCards] = useState<CardType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [liveActivityLogs, setLiveActivityLogs] = useState<ActivityLogType[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      // 1. Fetch dashboard stats
      userService
        .getDashboard()
        .then((res) => {
          if (res?.stats) {
            setDashboardStats(res.stats);
          }
        })
        .catch(() => {});

      // 2. Fetch all user accessible tasks, newest first
      setTasksLoading(true);
      setTasksError(null);
      try {
        const tasks = await taskService.getTasks({ ordering: '-updated_at' });
        const converted = tasks.map(backendTaskToCard);
        setLiveCards(converted);
        setLiveActivityLogs([]);

        // Fetch activity for top 5 tasks
        const topTasks = converted.slice(0, 5);
        Promise.all(
          topTasks.map((c) =>
            taskService
              .getActivity(c.id)
              .then((entries) =>
                entries.map((entry) => backendActivityToActivityLog(entry, c.id))
              )
              .catch(() => [])
          )
        ).then((logGroups) => {
          const merged = logGroups.flat().sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setLiveActivityLogs(merged);
        });
      } catch (err: unknown) {
        setLiveCards([]);
        setLiveActivityLogs([]);
        setTasksError(err instanceof Error ? err.message : 'Could not load tasks.');
      } finally {
        setTasksLoading(false);
      }

      // 3. Fetch user directory
      userService
        .getUsers()
        .then((u) => {
          setUsers(u);
        })
        .catch(() => {});

      // 4. Refresh projects list
      await fetchProjects().catch(() => {});
    } catch (err) {
      console.warn('Could not load dashboard:', err);
    }
  }, [fetchProjects]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const currentUserId = user ? String(user.id) : '';
  const currentUserName = user?.full_name || user?.email || 'there';

  const displayCards = liveCards;
  const displayProjects = plainProjects;

  const assignedCount =
    dashboardStats?.assigned_tasks !== undefined
      ? dashboardStats.assigned_tasks
      : displayCards.filter((c) => isAssignedToUser(c, currentUserId)).length;

  const createdCount =
    dashboardStats?.reported_tasks !== undefined
      ? dashboardStats.reported_tasks
      : displayCards.filter((c) => c.publisherId === currentUserId).length;

  const projectCount =
    dashboardStats?.active_projects !== undefined
      ? dashboardStats.active_projects
      : displayProjects.length;

  const myWork = useMemo(() => {
    return displayCards
      .filter(
        (c) =>
          isAssignedToUser(c, currentUserId) ||
          c.publisherId === currentUserId
      )
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [displayCards, currentUserId]);

  const openCard = (card: CardType) => {
    router.push({
      pathname: '/(tabs)/spaces/card',
      params: { cardId: card.id, projectId: card.projectId, from: 'home' },
    });
  };

  const openProject = (projectId: string) => {
    router.push({
      pathname: '/(tabs)/spaces/project',
      params: { projectId: String(projectId), from: 'home' },
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.paper }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text variant="heading" bold>
              {getGreeting()}, {currentUserName.split(' ')[0]} 👋
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
              name={currentUserName}
              imageUrl={user?.avatar || undefined}
              size="md"
              bordered
              borderColor={colors.paper}
            />
          </Pressable>
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Assigned', count: assignedCount },
            { label: 'Created', count: createdCount },
            { label: 'Projects', count: projectCount },
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
        {tasksError ? (
          <EmptyState
            title="Could not load tasks"
            description={tasksError}
            actionLabel="Retry"
            onAction={() => { void loadData(); }}
            style={{ paddingVertical: spacing[3] }}
          />
        ) : tasksLoading ? (
          <Text variant="bodySmall" muted>Loading tasks...</Text>
        ) : myWork.length > 0 ? (
          myWork.map((card) => (
            <Pressable
              key={card.id}
              onPress={() => openCard(card)}
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
                <StatusBar status={getStatus(card)} size="sm" />
                <PriorityBadge
                  priority={card.priority}
                  size="sm"
                  showLabel={false}
                />
              </View>
            </Pressable>
          ))
        ) : (
          <EmptyState
            title="No active tasks"
            description="You currently have no tasks assigned to you or authored by you."
            actionLabel="Explore Projects"
            onAction={() => router.push('/(tabs)/spaces')}
            style={{ paddingVertical: spacing[3] }}
          />
        )}

        {/* Projects */}
        <Text variant="sectionLabel" muted style={styles.sectionTitle}>
          YOUR PROJECTS ({displayProjects.length})
        </Text>
        {projectsError && displayProjects.length === 0 ? (
          <EmptyState
            title="Could not load projects"
            description={projectsError}
            actionLabel="Retry"
            onAction={() => { void fetchProjects().catch(() => {}); }}
            style={{ paddingVertical: spacing[3] }}
          />
        ) : projectsLoading && displayProjects.length === 0 ? (
          <Text variant="bodySmall" muted>Loading projects...</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.projectsScroll}
          >
            {displayProjects.map((project) => (
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
        )}

        {/* Recent activity */}
        <ActivityLog
          logs={liveActivityLogs}
          users={users}
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
