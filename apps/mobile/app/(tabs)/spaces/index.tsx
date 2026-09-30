import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { TimeIcon, GridIcon, SearchIcon, SunnyIcon, MoonIcon, AddIcon } from '../../../assets/icon';
import {
  useProjects,
  useDebounce,
  filterSpaces,
  sortSpaces,
  userService,
  useAuth,
  mockUsers,
  type User,
} from '@jira-clone/shared';

import { Text, Badge, Input, Button } from '../../../src/components/base';
import { ProjectCard } from '../../../src/components/shared/project-card';
import { EmptyState } from '../../../src/components/shared/empty-state';
import { CreateProjectModal, type CreateProjectInput } from '../../../src/components/shared/create-project-modal';
import { useTheme, spacing, radius } from '../../../src/tokens';

/**
 * SpacesIndexScreen — First page of the Spaces Stack navigator.
 * Contains:
 *   1. Recently Viewed Spaces container
 *   2. All Spaces container (with search filter)
 */
export default function SpacesIndexScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const currentMember: User | undefined = useMemo(() => {
    if (!currentUser) return undefined;
    const name = currentUser.full_name || currentUser.email;
    const initials = name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
    return {
      id: String(currentUser.id),
      name,
      email: currentUser.email,
      avatarUrl: currentUser.avatar || undefined,
      initials,
    };
  }, [currentUser]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch users for space creation member picker
  useEffect(() => {
    userService
      .getUsers()
      .then((users) => {
        if (users && users.length > 0) {
          setAvailableUsers(users);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch projects from the API
  const { spaces, isLoading, error, refetch, createProject } = useProjects({
    search: debouncedSearchQuery.trim() || undefined,
    status: selectedStatus !== 'all' ? (selectedStatus as 'active' | 'done' | 'archived') : undefined,
  });
  const retry = () => { void refetch().catch(() => {}); };

  // Recently viewed space IDs from this session.
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);

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

  // Create space handler
  const handleCreateSpace = async (input: CreateProjectInput) => {
    const memberIds = input.members
      ?.map((m) => Number(m.id))
      .filter((id) => !Number.isNaN(id) && id > 0);

    const created = await createProject({
      name: input.name,
      key: input.key,
      description: input.description,
      members: memberIds && memberIds.length > 0 ? memberIds : undefined,
    });
    if (created?.id) {
      handleOpenSpace(String(created.id));
    }
  };

  // Resolve recently viewed projects in order
  const recentlyViewedSpaces = useMemo(() => {
    return recentlyViewedIds.flatMap((id) => {
      const space = spaces.find((item) => item.project.id === id);
      return space ? [space] : [];
    });
  }, [recentlyViewedIds, spaces]);

  const isFilterActive = Boolean(debouncedSearchQuery.trim()) || selectedStatus !== 'all';

  // Filtered list for "All Spaces" container (default sorted by updated / latest)
  const filteredSpaces = useMemo(() => {
    let filtered = filterSpaces(spaces, debouncedSearchQuery);
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((space) => space.project.status === selectedStatus);
    }
    return sortSpaces(filtered, 'updated');
  }, [spaces, debouncedSearchQuery, selectedStatus]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.paper }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={retry}
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
            <View style={styles.headerActions}>
              <Button
                label="Create Space"
                variant="primary"
                size="sm"
                leftIcon={<AddIcon size={16} color="#FFFFFF" />}
                onPress={() => setIsCreateModalOpen(true)}
              />
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
              label={String(recentlyViewedSpaces.length)}
              variant="neutral"
              size="sm"
            />
          </View>

          {recentlyViewedSpaces.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollList}
            >
              {recentlyViewedSpaces.map((space) => (
                <View key={space.project.id} style={styles.horizontalCardWrapper}>
                  <ProjectCard
                    project={space.project}
                    members={space.members}
                    issueCounts={space.issueCounts}
                    onPress={() => handleOpenSpace(space.project.id)}
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
              label={String(filteredSpaces.length)}
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

          {error && filteredSpaces.length > 0 && (
            <View style={{ gap: spacing[2] }}>
              <Text variant="caption" color={colors.warn}>{error}</Text>
              <Button label="Retry" variant="secondary" size="sm" onPress={retry} />
            </View>
          )}

          {isLoading && filteredSpaces.length === 0 ? (
            <Text variant="caption" muted>Loading spaces...</Text>
          ) : filteredSpaces.length > 0 ? (
            <View style={styles.verticalCardList}>
              {filteredSpaces.map((space) => (
                <ProjectCard
                  key={space.project.id}
                  project={space.project}
                  members={space.members}
                  issueCounts={space.issueCounts}
                  onPress={() => handleOpenSpace(space.project.id)}
                  style={{ backgroundColor: colors.paper }}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              title={error ? 'Could not load spaces' : isFilterActive ? 'No spaces found' : 'No spaces yet'}
              description={
                error
                  ? 'Try again when the connection is available.'
                  : isFilterActive
                  ? 'No spaces match your active search or status filters.'
                  : 'Spaces help you track and organize your team Kanban projects.'
              }
              actionLabel={error ? 'Retry' : isFilterActive ? 'Clear Filters' : 'Create Space'}
              onAction={() => {
                if (error) {
                  retry();
                } else if (isFilterActive) {
                  setSearchQuery('');
                  setSelectedStatus('all');
                } else {
                  setIsCreateModalOpen(true);
                }
              }}
              icon={<GridIcon size={30} color={colors.accent} />}
            />
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button for Space Creation */}
      <Pressable
        onPress={() => setIsCreateModalOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Create space"
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.accent,
            opacity: pressed ? 0.88 : 1,
            shadowColor: '#000',
          },
        ]}
      >
        <AddIcon size={24} color="#FFFFFF" />
      </Pressable>

      {/* Create Space Dialog Modal */}
      <CreateProjectModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateSpace}
        title="Create Space"
        subtitle="SPACE"
        confirmLabel="Create Space"
        users={availableUsers}
        initialMembers={currentMember ? [currentMember] : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[8],
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
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
  fab: {
    position: 'absolute',
    bottom: spacing[6],
    right: spacing[4],
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
