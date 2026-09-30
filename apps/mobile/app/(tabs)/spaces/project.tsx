import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Alert, ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronBackIcon, SunnyIcon, MoonIcon } from '../../../assets/icon';
import {
  type Card as CardType,
  useSpaceDetail,
  isStatusAllowedForUser,
  getStatusPermissionHint,
  userService,
  type User,
} from '@jira-clone/shared';
import { Text, Button, Dropdown } from '../../../src/components/base';
import { Board } from '../../../src/components/shared/board';
import { ProjectHeader } from '../../../src/components/shared/project-header';
import { CardMoveMenu, CardPosition } from '../../../src/components/shared/card-move-menu';
import { EmptyState } from '../../../src/components/shared/empty-state';
import { CreateCardModal, type CreateCardInput } from '../../../src/components/shared/create-card-modal';
import { AddMembersModal } from '../../../src/components/shared/add-members-modal';
import { useTheme, spacing, radius } from '../../../src/tokens';

/**
 * SpacesProjectScreen — Project Detail / Kanban Board view.
 * Reads `projectId` from URL params and loads project data and tasks via useSpaceDetail,
 * and embeds the Kanban Board with quick card actions.
 */
export default function SpacesProjectScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const { projectId, from } = useLocalSearchParams<{ projectId?: string; from?: string }>();
  const {
    space,
    project,
    boardUsers,
    currentUserId,
    projectLoading,
    projectError,
    retryProject,
    boardSearch,
    setBoardSearch,
    assignedToMeFilter,
    setAssignedToMeFilter,
    createdByMeFilter,
    setCreatedByMeFilter,
    selectedTypeFilter,
    setSelectedTypeFilter,
    filterableTypeOptions,
    selectedUserIdsFilter,
    clearBoardFilters,
    toggleUserIdFilter,
    cards,
    columns,
    cardTypeOptions,
    createTaskType,
    isLoading: isTasksLoading,
    error: tasksError,
    fetchTasks,
    statusError,
    createTask,
    updateTask,
    updateTaskStatus,
    addMembers,
  } = useSpaceDetail(projectId);

  // Users for adding members
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    userService
      .getUsers()
      .then((data) => {
        if (isMounted) setAllUsers(data);
      })
      .catch((err) => {
        console.error('Failed to load users for add members modal:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Show status error alert when permission is denied on status transition
  useEffect(() => {
    if (statusError) {
      Alert.alert('Status Transition', statusError);
    }
  }, [statusError]);

  // Quick move menu state
  const [moveMenuCard, setMoveMenuCard] = useState<CardType | null>(null);
  const [moveMenuVisible, setMoveMenuVisible] = useState(false);

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
    if (!project) throw new Error('Project is not loaded.');
    await createTask({ title, columnId });
  };

  // Create Card Modal state & handlers
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string>('');

  const handleOpenCreateCard = (columnId?: string) => {
    setTargetColumnId(columnId || columns[0]?.id || 'col-todo');
    setIsCreateCardOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateCardOpen(false);
  };

  const handleCreateCardSubmit = async (input: CreateCardInput) => {
    if (!project) throw new Error('Project is not loaded.');
    await createTask({
      title: input.title,
      type: input.type,
      typeId: input.typeId,
      description: input.description,
      assigneeId: input.assigneeId ? Number(input.assigneeId) : null,
      dueDate: input.dueDate || null,
      columnId: input.columnId,
    });
  };

  const handleAddMembersSubmit = async (userIds: string[]) => {
    await addMembers(userIds);
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
          title={projectLoading ? 'Loading project...' : projectError ? 'Could not load project' : 'Project Not Found'}
          description={projectError || (projectId ? `Could not locate a workspace project with ID "${projectId}".` : 'Choose a space to open its board.')}
          actionLabel={projectError ? 'Retry' : projectLoading ? undefined : 'Back to Spaces'}
          onAction={projectError ? retryProject : () => router.replace('/(tabs)/spaces')}
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isTasksLoading}
            onRefresh={() => { void fetchTasks().catch(() => {}); }}
            tintColor={colors.accent}
          />
        }
      >
        {projectError && (
          <View style={{ paddingHorizontal: spacing[4], paddingTop: spacing[2] }}>
            <Text variant="caption" color={colors.warn}>{projectError}</Text>
            <Button label="Retry project" variant="secondary" size="sm" onPress={retryProject} />
          </View>
        )}

        {tasksError && !isTasksLoading && (
          <EmptyState
            title="Could not load cards"
            description={tasksError}
            actionLabel="Retry"
            onAction={() => { void fetchTasks().catch(() => {}); }}
          />
        )}

        <View style={{ paddingHorizontal: spacing[4], paddingTop: spacing[2] }}>
          <Dropdown
            label="Type"
            value={selectedTypeFilter}
            options={[{ label: 'All types', value: 'all' }, ...filterableTypeOptions.map((type) => ({ label: type.label, value: type.id }))]}
            onSelect={setSelectedTypeFilter}
          />
        </View>

        {/* Kanban Board with Project Header */}
        <Board
          columns={columns}
          cards={cards}
          refreshing={isTasksLoading}
          users={boardUsers}
          currentUserId={currentUserId}
          searchQuery={boardSearch}
          onSearchChange={setBoardSearch}
          assignedToMe={assignedToMeFilter}
          onToggleAssignedToMe={() => setAssignedToMeFilter((v) => !v)}
          createdByMe={createdByMeFilter}
          onToggleCreatedByMe={() => setCreatedByMeFilter((v) => !v)}
          selectedUserIds={selectedUserIdsFilter}
          onToggleUserId={toggleUserIdFilter}
          onClearFilters={clearBoardFilters}
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
                members={boardUsers}
                onCreateCard={() => handleOpenCreateCard()}
                onAddMember={() => setIsAddMembersModalOpen(true)}
              />
            </View>
          )}
          style={styles.board}
        />
      </ScrollView>

      {/* Add Members Modal */}
      <AddMembersModal
        visible={isAddMembersModalOpen}
        onClose={() => setIsAddMembersModalOpen(false)}
        onAddMembers={handleAddMembersSubmit}
        spaceName={project.name}
        existingMemberIds={space?.members?.map((m) => m.id) || boardUsers.map((u) => u.id)}
        users={allUsers.length > 0 ? allUsers : boardUsers}
      />

      {/* Create Card Modal */}
      <CreateCardModal
        visible={isCreateCardOpen}
        onClose={handleCloseCreateModal}
        onCreate={handleCreateCardSubmit}
        targetColumnId={targetColumnId}
        projectKey={project.key}
        columns={columns}
        users={boardUsers}
        cardTypes={cardTypeOptions}
        onAddType={async (name: string) => {
          const created = await createTaskType(name);
          return { id: String(created.id), label: created.name };
        }}
      />

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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing[8],
  },
  board: {
    flex: 1,
  },
});
