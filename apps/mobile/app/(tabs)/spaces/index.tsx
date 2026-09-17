import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { TimeIcon, GridIcon, SearchIcon, SunnyIcon, MoonIcon } from '../../../assets/icon';
import {
  mockProjects,
  mockCards,
  mockColumns,
  mockUsers,
  Project,
} from '@jira-clone/shared';
import { Text, Badge, Input } from '../../../src/components/base';
import { ProjectCard, ProjectIssueCounts } from '../../../src/components/shared/project-card';
import { EmptyState } from '../../../src/components/shared/empty-state';
import { useTheme, spacing, radius } from '../../../src/tokens';

/**
 * Derives project members from the card assignments and project owner.
 */
function getProjectMembers(projectId: string) {
  const projectCards = mockCards.filter((c) => c.projectId === projectId);
  const memberIdSet = new Set<string>();

  const project = mockProjects.find((p) => p.id === projectId);
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
 * Computes issue counts (To Do, Active, Done) for a project.
 */
function getProjectIssueCounts(projectId: string): ProjectIssueCounts {
  const projectCards = mockCards.filter((c) => c.projectId === projectId);
  const projectColumns = mockColumns.filter((col) => col.projectId === projectId);

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

  // Recently viewed space IDs (seeded with popular active spaces)
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([
    'proj-1',
    'proj-2',
  ]);
  const [searchQuery, setSearchQuery] = useState('');

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
      .map((id) => mockProjects.find((p) => p.id === id))
      .filter((p): p is Project => Boolean(p));
  }, [recentlyViewedIds]);

  // Filtered list for "All Spaces" container
  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return mockProjects;
    return mockProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.key.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.paper }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
                    members={getProjectMembers(project.id)}
                    issueCounts={getProjectIssueCounts(project.id)}
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

          {filteredProjects.length > 0 ? (
            <View style={styles.verticalCardList}>
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  members={getProjectMembers(project.id)}
                  issueCounts={getProjectIssueCounts(project.id)}
                  onPress={() => handleOpenSpace(project.id)}
                  style={{ backgroundColor: colors.paper }}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              title="No spaces found"
              description={`No spaces match "${searchQuery}".`}
              actionLabel="Clear Filter"
              onAction={() => setSearchQuery('')}
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