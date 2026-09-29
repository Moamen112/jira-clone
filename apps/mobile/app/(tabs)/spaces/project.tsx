import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronBackIcon, SunnyIcon, MoonIcon, AddIcon } from '../../../assets/icon';
import {
  mockProjects,
  type Card as CardType,
  type User,
  type BackendProject,
  useProjects,
  useTasks,
  useAuth,
  useDebounce,
  isStatusAllowedForUser,
  getStatusPermissionHint,
  projectService,
} from '@jira-clone/shared';
import { Text, Modal, Button, Input, Dropdown } from '../../../src/components/base';
import { Board } from '../../../src/components/shared/board';
import { ProjectHeader } from '../../../src/components/shared/project-header';
import { CardMoveMenu, CardPosition } from '../../../src/components/shared/card-move-menu';
import { EmptyState } from '../../../src/components/shared/empty-state';
import { useTheme, spacing, radius } from '../../../src/tokens';

/**
 * SpacesProjectScreen — Project Detail / Kanban Board view.
 * Reads `projectId` from URL params, loads live project data & tasks via useTasks,
 * and embeds the Kanban Board with quick card actions.
 */
export default function SpacesProjectScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const { projectId, from } = useLocalSearchParams<{ projectId?: string; from?: string }>();
  const { user } = useAuth();
  const currentUserId = user?.id ? String(user.id) : undefined;
  const { spaces, projects } = useProjects();

  const [directProject, setDirectProject] = useState<BackendProject | null>(null);

  // Match project from spaces or projects
  const matchedProject = useMemo(() => {
    if (!projectId) return null;
    const fromSpaces = spaces.find(
      (s) =>
        String(s.project.id) === String(projectId) ||
        s.project.key.toLowerCase() === projectId.toLowerCase()
    )?.project;
    if (fromSpaces) return fromSpaces;

    const fromProjects = projects.find(
      (p) =>
        String(p.id) === String(projectId) ||
        p.key.toLowerCase() === projectId.toLowerCase()
    );
    if (fromProjects) {
      return {
        id: String(fromProjects.id),
        name: fromProjects.name,
        key: fromProjects.key,
        description: fromProjects.description,
        ownerId: String(fromProjects.owner?.id || ''),
        createdAt: fromProjects.created_at,
        updatedAt: fromProjects.updated_at,
        taskCount: fromProjects.task_count,
        openTaskCount: fromProjects.open_task_count,
        status: fromProjects.status,
      };
    }
    return null;
  }, [spaces, projects, projectId]);

  // If not found in store, fetch single project directly by ID
  useEffect(() => {
    if (!matchedProject && projectId) {
      projectService
        .getProject(projectId)
        .then((p) => setDirectProject(p))
        .catch(() => {});
    }
  }, [matchedProject, projectId]);

  // Resolved project entity
  const project = useMemo(() => {
    if (matchedProject) return matchedProject;
    if (directProject) {
      return {
        id: String(directProject.id),
        name: directProject.name,
        key: directProject.key,
        description: directProject.description,
        ownerId: String(directProject.owner?.id || ''),
        createdAt: directProject.created_at,
        updatedAt: directProject.updated_at,
        taskCount: directProject.task_count,
        openTaskCount: directProject.open_task_count,
        status: directProject.status,
      };
    }
    if (!projectId) return mockProjects[0];
    return mockProjects.find((p) => p.id === projectId) || null;
  }, [matchedProject, directProject, projectId]);

  const activeProjectId = project?.id;
  const activeProjectKey = project?.key;

  // Board filter states (connected to backend API)
  const [boardSearch, setBoardSearch] = useState('');
  const debouncedBoardSearch = useDebounce(boardSearch, 300);
  const [assignedToMeFilter, setAssignedToMeFilter] = useState(false);
  const [createdByMeFilter, setCreatedByMeFilter] = useState(false);
  const [selectedUserIdsFilter, setSelectedUserIdsFilter] = useState<string[]>([]);

  // Derive server query params
  const serverAssignee = useMemo(() => {
    if (selectedUserIdsFilter.length === 1 && selectedUserIdsFilter[0] !== 'unassigned') {
      const parsed = Number(selectedUserIdsFilter[0]);
      return !isNaN(parsed) && parsed > 0 ? parsed : undefined;
    }
    return undefined;
  }, [selectedUserIdsFilter]);

  const serverUnassigned = useMemo(() => {
    return selectedUserIdsFilter.includes('unassigned') ? true : undefined;
  }, [selectedUserIdsFilter]);

  // Real backend tasks hook with query filters
  const {
    cards,
    columns,
    isLoading: isTasksLoading,
    statusError,
    createTask,
    updateTask,
    updateTaskStatus,
  } = useTasks({
    projectId: activeProjectId,
    projectKey: activeProjectKey,
    autoFetch: Boolean(activeProjectId),
    search: debouncedBoardSearch.trim() || undefined,
    mine: assignedToMeFilter ? true : undefined,
    assignee: serverAssignee,
    unassigned: serverUnassigned,
  });

  const handleClearBoardFilters = () => {
    setBoardSearch('');
    setAssignedToMeFilter(false);
    setCreatedByMeFilter(false);
    setSelectedUserIdsFilter([]);
  };

  const handleToggleUserIdFilter = (userId: string) => {
    setSelectedUserIdsFilter((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Show status error alert when permission is denied on status transition
  useEffect(() => {
    if (statusError) {
      Alert.alert('Status Transition', statusError);
    }
  }, [statusError]);

  // Quick move menu state
  const [moveMenuCard, setMoveMenuCard] = useState<CardType | null>(null);
  const [moveMenuVisible, setMoveMenuVisible] = useState(false);

  // Derive project team members
  const members = useMemo<User[]>(() => {
    if (directProject?.members && directProject.members.length > 0) {
      return directProject.members.map((m) => ({
        id: String(m.user.id),
        name: m.user.full_name || m.user.email,
        email: m.user.email,
        initials: (m.user.full_name || m.user.email).slice(0, 2).toUpperCase(),
        avatarUrl: m.user.avatar || undefined,
      }));
    }
    const matchedSpace = spaces.find(
      (s) => String(s.project.id) === String(project?.id)
    );
    if (matchedSpace?.members && matchedSpace.members.length > 0) {
      return matchedSpace.members.map((m) => ({
        id: String(m.id),
        name: m.name,
        email: m.email || '',
        initials: (m.name || 'U').slice(0, 2).toUpperCase(),
        avatarUrl: m.avatarUrl,
      }));
    }
    if (user) {
      return [
        {
          id: String(user.id),
          name: user.full_name || user.email,
          email: user.email,
          initials: (user.full_name || user.email).slice(0, 2).toUpperCase(),
          avatarUrl: user.avatar || undefined,
        },
      ];
    }
    return [];
  }, [directProject?.members, spaces, project?.id, user]);

  // Back navigation handler
  const handleBack = () => {
    if (from === 'home') {
      router.replace('/(tabs)');
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/spaces');
    }
  };

  // Navigation callbacks
  const handleCardPress = (card: CardType) => {
    router.push({
      pathname: '/(tabs)/spaces/card',
      params: { cardId: card.id, projectId: project?.id, from: 'project' },
    });
  };

  // Card move callbacks
  const handleCardMove = (card: CardType) => {
    setMoveMenuCard(card);
    setMoveMenuVisible(true);
  };

  const handleMoveColumn = async (
    columnId: string,
    targetCard: CardType,
    _position?: CardPosition
  ) => {
    if (!isStatusAllowedForUser(currentUserId, targetCard, columnId)) {
      Alert.alert(
        'Permission Denied',
        getStatusPermissionHint(currentUserId, targetCard)
      );
      return;
    }
    try {
      await updateTaskStatus(targetCard.id, columnId);
    } catch (err: unknown) {
      Alert.alert(
        'Permission Denied',
        err instanceof Error ? err.message : 'You cannot move this task to this status.'
      );
    }
  };

  const handleCardAssigneeChange = async (userId: string | null, targetCard: CardType) => {
    try {
      await updateTask(targetCard.id, {
        assignee: userId ? Number(userId) : null,
      });
    } catch (err: unknown) {
      Alert.alert(
        'Reassignment Failed',
        err instanceof Error ? err.message : 'Could not reassign this card.'
      );
    }
  };

  // Inline card creation callback
  const handleCreateCard = async (title: string, columnId: string) => {
    if (!project) return;
    try {
      await createTask({
        title,
        columnId,
      });
    } catch (err: unknown) {
      Alert.alert(
        'Creation Failed',
        err instanceof Error ? err.message : 'Failed to create card.'
      );
    }
  };

  // Quick Create Card Modal state & handlers
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string>('');
  const [newCardTitle, setNewCardTitle] = useState('');
  const [cardTitleError, setCardTitleError] = useState<string | undefined>();

  const handleOpenCreateCard = (columnId?: string) => {
    setTargetColumnId(columnId || columns[0]?.id || 'col-todo');
    setNewCardTitle('');
    setCardTitleError(undefined);
    setIsCreateCardOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateCardOpen(false);
    setNewCardTitle('');
    setCardTitleError(undefined);
  };

  const handleConfirmCreateCard = async () => {
    const trimmed = newCardTitle.trim();
    if (!trimmed) {
      setCardTitleError('Card title cannot be empty.');
      return;
    }
    const chosenColumnId = targetColumnId || columns[0]?.id || 'col-todo';
    await handleCreateCard(trimmed, chosenColumnId);
    handleCloseCreateModal();
  };

  if (!project) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.paper }]}>
        <View style={[styles.topBar, { borderBottomColor: colors.line }]}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: pressed ? colors.surface : 'transparent' },
            ]}
          >
            <ChevronBackIcon size={20} color={colors.ink} />
            <Text variant="bodySmall" bold style={{ color: colors.ink }}>
              Spaces
            </Text>
          </Pressable>

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
              <SunnyIcon size={18} color={colors.accent} />
            ) : (
              <MoonIcon size={18} color={colors.ink} />
            )}
          </Pressable>
        </View>
        <EmptyState
          title="Project Not Found"
          description={`Could not locate a workspace project with ID "${projectId}".`}
          actionLabel="Back to Spaces"
          onAction={() => router.replace('/(tabs)/spaces')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.paper }]}>
      {/* Top Back Navigation Bar */}
      <View style={[styles.topBar, { borderBottomColor: colors.line }]}>
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Back to spaces"
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: pressed ? colors.surface : 'transparent' },
          ]}
        >
          <ChevronBackIcon size={20} color={colors.ink} />
          <Text variant="bodySmall" bold style={{ color: colors.ink }}>
            Spaces
          </Text>
        </Pressable>

        <View style={styles.topBarRight}>
          <Button
            label="+ Card"
            variant="primary"
            size="sm"
            onPress={() => handleOpenCreateCard()}
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
              <SunnyIcon size={18} color={colors.accent} />
            ) : (
              <MoonIcon size={18} color={colors.ink} />
            )}
          </Pressable>
        </View>
      </View>

      {/* Kanban Board with Project Header */}
      <Board
        columns={columns}
        cards={cards}
        users={members}
        currentUserId={currentUserId}
        searchQuery={boardSearch}
        onSearchChange={setBoardSearch}
        assignedToMe={assignedToMeFilter}
        onToggleAssignedToMe={() => setAssignedToMeFilter((v) => !v)}
        createdByMe={createdByMeFilter}
        onToggleCreatedByMe={() => setCreatedByMeFilter((v) => !v)}
        selectedUserIds={selectedUserIdsFilter}
        onToggleUserId={handleToggleUserIdFilter}
        onClearFilters={handleClearBoardFilters}
        isServerFiltered={true}
        totalCardsCount={project?.taskCount}
        onCardPress={handleCardPress}
        onCardMove={handleCardMove}
        onCardAssigneeChange={handleCardAssigneeChange}
        onAddCardPress={(colId) => handleOpenCreateCard(colId)}
        onCreateCard={handleCreateCard}
        renderHeader={() => (
          <View style={styles.headerWrapper}>
            <ProjectHeader
              project={project}
              members={members}
              onCreateCard={() => handleOpenCreateCard()}
            />
          </View>
        )}
        style={styles.board}
      />

      {/* Floating Action Button for Card Creation */}
      <Pressable
        onPress={() => handleOpenCreateCard()}
        accessibilityRole="button"
        accessibilityLabel="Create card"
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

      {/* Quick Create Card Dialog Modal */}
      <Modal
        visible={isCreateCardOpen}
        onClose={handleCloseCreateModal}
        title="Create Card"
        subtitle={
          targetColumnId
            ? `${project.key} · ${columns.find((c) => c.id === targetColumnId)?.title || targetColumnId}`
            : project.key
        }
        presentation="dialog"
        footer={
          <View style={styles.modalFooter}>
            <Button
              label="Cancel"
              variant="ghost"
              size="sm"
              onPress={handleCloseCreateModal}
            />
            <Button
              label="Create Card"
              variant="primary"
              size="sm"
              disabled={!newCardTitle.trim()}
              onPress={handleConfirmCreateCard}
            />
          </View>
        }
      >
        <View style={{ gap: spacing[3] }}>
          <Input
            label="Card name"
            placeholder="e.g. Implement user authentication"
            value={newCardTitle}
            onChangeText={(text) => {
              setNewCardTitle(text);
              if (cardTitleError) setCardTitleError(undefined);
            }}
            error={cardTitleError}
            autoFocus
          />

          {columns.length > 1 && (
            <Dropdown
              label="Status"
              value={targetColumnId}
              options={columns.map((c) => ({
                label: c.title,
                value: c.id,
              }))}
              onSelect={(val) => setTargetColumnId(val)}
              placeholder="Select column..."
            />
          )}
        </View>
      </Modal>

      {/* Card Quick Move Menu */}
      <CardMoveMenu
        visible={moveMenuVisible}
        card={moveMenuCard}
        columns={columns}
        currentUserId={currentUserId}
        onClose={() => {
          setMoveMenuVisible(false);
          setMoveMenuCard(null);
        }}
        onMoveColumn={handleMoveColumn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.pill,
    gap: 2,
  },
  headerWrapper: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[1],
  },
  board: {
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
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
    shadowRadius: 5,
    zIndex: 99,
  },
});