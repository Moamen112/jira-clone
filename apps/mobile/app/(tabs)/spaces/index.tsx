import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { TimeIcon, GridIcon, SearchIcon, SunnyIcon, MoonIcon } from '../../../assets/icon';
import {
  mockProjects,
  mockCards,
  mockColumns,
  mockUsers,
  type Project,
  useProjects,
  useDebounce,
  filterProjects,
  sortProjects,
  getInitials,
} from '@jira-clone/shared';

import { Text, Badge, Input } from '../../../src/components/base';
import { ProjectCard, ProjectIssueCounts } from '../../../src/components/shared/project-card';
import { EmptyState } from '../../../src/components/shared/empty-state';
import { useTheme, spacing, radius } from '../../../src/tokens';

/**
 * Derives project members from the backend owner or legacy card assignments.
 */
function getProjectMembers(project: Project) {
  if (project.owner) {
    return [
      {
        id: String(project.owner.id),
        name: project.owner.full_name || project.owner.email,
        avatarUrl: project.owner.avatar ?? undefined,
        initials: getInitials(project.owner.full_name || project.owner.email),
      },
    ];
  }

  const projectCards = mockCards.filter((c) => c.projectId === project.id);
  const memberIdSet = new Set<string>();

  if (project?.ownerId) memberIdSet.add(project.ownerId);

  projectCards.forEach((c) => {
    if (c.publisherId) memberIdSet.add(c.publisherId);
    if (c.assigneeId) memberIdSet.add(c.assigneeId);
    c.assigneeIds?.forEach((id) => memberIdSet.add(id));
  });

  if (memberIdSet.size === 0) {
    return mockUsers.slice(0, 2);
  }

  return mockUsers.filter((u) => memberIdSet.has(u.id));
}

/**
 * Computes issue counts (To Do, Active, Done) for a project from backend fields or column cards.
 */
function getProjectIssueCounts(project: Project): ProjectIssueCounts {
  if (project.taskCount !== undefined || project.openTaskCount !== undefined) {
    const total = project.taskCount ?? 0;
    const open = project.openTaskCount ?? 0;
    return {
      todo: open,
      inProgress: 0,
      done: Math.max(0, total - open),
    };
  }

  const projectCards = mockCards.filter((c) => c.projectId === project.id);
  const projectColumns = mockColumns.filter((col) => col.projectId === project.id);

  const todoColIds = new Set(
    projectColumns
      .filter((col) => col.title.toLowerCase().includes('to do'))
      .map((c) => c.id)
  );
  const inProgressColIds = new Set(
    projectColumns
      .filter(
        (col) =>
          col.title.toLowerCase().includes('progress') ||
          col.title.toLowerCase().includes('review')
      )
      .map((c) => c.id)
  );
  const doneColIds = new Set(
    projectColumns
      .filter((col) => col.title.toLowerCase().includes('done'))
      .map((c) => c.id)
  );

  return {
    todo: projectCards.filter((c) => todoColIds.has(c.columnId)).length,
    inProgress: projectCards.filter((c) => inProgressColIds.has(c.columnId)).length,
    done: projectCards.filter((c) => doneColIds.has(c.columnId)).length,
  };
}

/**
 * SpacesIndexScreen — First page of the Spaces Stack navigator.
 * Contains:
 *   1. Recently Viewed Spaces container
 *   2. All Spaces container (with search filter)
 */
export default function SpacesIndexScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch projects from the API
  const {
    plainProjects: apiProjects,
    isLoading,
    refetch,
  } = useProjects({
    search: debouncedSearchQuery.trim() || undefined,
    status: selectedStatus !== 'all' ? (selectedStatus as 'active' | 'done' | 'archived') : undefined,
  });

  // Use API projects if available; fallback to mockProjects when offline or empty during dev
  const projects = apiProjects.length > 0 ? apiProjects : mockProjects;

  // Recently viewed space IDs (seeded with popular active spaces)
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([
    'proj-1',
    'proj-2',
  ]);

  // Open project board and bump to front of recently viewed
  const handleOpenSpace = (projectId: string) => {
    setRecentlyViewedIds((prev) => [
      projectId,
      ...prev.filter((id) => id !== projectId),
    ]);
    router.push({
      pathname: '/(tabs)/spaces/project',
      params: { projectId },
    });
  };

  // Resolve recently viewed projects in order
  const recentlyViewedProjects = useMemo(() => {
    return recentlyViewedIds
      .map((id) => projects.find((p) => p.id === id))
      .filter((p): p is Project => Boolean(p));
  }, [recentlyViewedIds, projects]);

  const isFilterActive = Boolean(debouncedSearchQuery.trim()) || selectedStatus !== 'all';

  // Filtered list for "All Spaces" container (default sorted by updated / latest)
  const filteredProjects = useMemo(() => {
    let filtered = filterProjects(projects, debouncedSearchQuery);
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((p) => p.status === selectedStatus);
    }
    return sortProjects(filtered, 'updated');
  }, [projects, debouncedSearchQuery, selectedStatus]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.paper }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.accent}
          />
        }
      >
        {/* Page Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text variant="display" bold style={{ color: colors.ink }}>
              Spaces
            </Text>
            <Pressable
              onPress={toggleTheme}
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              style={({ pressed }) => [
                styles.themeToggleBtn,
                {
                  backgroundColor: pressed ? colors.paper : colors.surface,
                  borderColor: colors.line,
                },
              ]}
            >
              {isDark ? (
                <SunnyIcon size={20} color={colors.accent} />
              ) : (
                <MoonIcon size={20} color={colors.ink} />
              )}
            </Pressable>
          </View>
          <Text variant="bodySmall" muted style={styles.headerSubtitle}>
            Browse your team workspaces and project Kanban boards.
          </Text>
        </View>

        {/* 1. Container: Recently Viewed Spaces */}
        <View
          style={[
            styles.containerBox,
            { backgroundColor: colors.surface, borderColor: colors.line },
          ]}
        >
          <View style={styles.containerHeader}>
            <View style={styles.containerHeaderTitle}>
              <TimeIcon size={18} color={colors.accent} />
              <Text variant="sectionLabel" bold style={{ color: colors.ink }}>
                RECENTLY VIEWED SPACES
              </Text>
            </View>
            <Badge
              label={String(recentlyViewedProjects.length)}
              variant="neutral"
              size="sm"
            />
          </View>

          {recentlyViewedProjects.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollList}
            >
              {recentlyViewedProjects.map((project) => (
                <View key={project.id} style={styles.horizontalCardWrapper}>
                  <ProjectCard
                    project={project}
                    members={getProjectMembers(project)}
                    issueCounts={getProjectIssueCounts(project)}
                    onPress={() => handleOpenSpace(project.id)}
                    style={{ backgroundColor: colors.paper }}
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.emptyPrompt, { borderColor: colors.line }]}>
              <TimeIcon size={24} color={colors.inkMuted} />
              <Text
                variant="caption"
                muted
                style={{ marginTop: spacing[1], textAlign: 'center' }}
              >
                Spaces you visit will appear here for quick access.
              </Text>
            </View>
          )}
        </View>

        {/* 2. Container: All Spaces */}
        <View
          style={[
            styles.containerBox,
            { backgroundColor: colors.surface, borderColor: colors.line },
          ]}
        >
          <View style={styles.containerHeader}>
            <View style={styles.containerHeaderTitle}>
              <GridIcon size={18} color={colors.accent} />
              <Text variant="sectionLabel" bold style={{ color: colors.ink }}>
                ALL SPACES
              </Text>
            </View>
            <Badge
              label={String(filteredProjects.length)}
              variant="neutral"
              size="sm"
            />
          </View>

          {/* Quick Search */}
          <Input
            placeholder="Search spaces by name or key..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={
              <SearchIcon size={16} color={colors.inkMuted} />
            }
            containerStyle={styles.searchInput}
          />

          {/* Status Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusPillsContainer}
          >
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'done', label: 'Done' },
              { id: 'archived', label: 'Archived' },
            ].map((st) => {
              const isSelected = selectedStatus === st.id;
              return (
                <Pressable
                  key={st.id}
                  onPress={() => setSelectedStatus(st.id)}
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: isSelected ? colors.accent : colors.paper,
                      borderColor: isSelected ? colors.accent : colors.line,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    variant="caption"
                    bold={isSelected}
                    style={{
                      color: isSelected ? '#FFFFFF' : colors.inkMuted,
                    }}
                  >
                    {st.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {filteredProjects.length > 0 ? (
            <View style={styles.verticalCardList}>
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  members={getProjectMembers(project)}
                  issueCounts={getProjectIssueCounts(project)}
                  onPress={() => handleOpenSpace(project.id)}
                  style={{ backgroundColor: colors.paper }}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              title={isFilterActive ? 'No spaces found' : 'No spaces yet'}
              description={
                isFilterActive
                  ? 'No spaces match your active search or status filters.'
                  : 'Spaces help you track and organize your team Kanban projects.'
              }
              actionLabel={isFilterActive ? 'Clear Filters' : 'Refresh Spaces'}
              onAction={() => {
                if (isFilterActive) {
                  setSearchQuery('');
                  setSelectedStatus('all');
                } else {
                  refetch();
                }
              }}
              icon={<GridIcon size={30} color={colors.accent} />}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[6],
    gap: spacing[4],
  },
  header: {
    marginBottom: spacing[1],
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSubtitle: {
    marginTop: spacing[1],
  },
  containerBox: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing[4],
    gap: spacing[3],
  },
  containerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  containerHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  horizontalScrollList: {
    gap: spacing[3],
    paddingVertical: 2,
  },
  horizontalCardWrapper: {
    width: 280,
  },
  searchInput: {
    marginBottom: 0,
  },
  statusPillsContainer: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingTop: spacing[1],
    paddingBottom: spacing[1],
  },
  statusPill: {
    paddingHorizontal: spacing[3],
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  verticalCardList: {
    gap: spacing[3],
  },
  emptyPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.card,
  },
});