import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronBackIcon, SunnyIcon, MoonIcon } from '../../../assets/icon';
import {
  type BoardColumn,
  type Card as CardType,
  type CardTypeOption,
  type Comment,
  type ActivityLog,
  type User,
  mockCards,
  mockColumns,
  mockUsers,
  taskService,
  backendTaskToCard,
  backendCommentToComment,
  backendActivityToActivityLog,
  columnIdToStatus,
  createDefaultBoardColumns,
  taskTypeToCardTypeOption,
  useAuth,
  useProjects,
} from '@jira-clone/shared';
import { CardDetail } from '../../../src/components/shared/card-detail';
import { EmptyState } from '../../../src/components/shared/empty-state';
import { Text } from '../../../src/components/base';
import { useTheme, spacing, radius } from '../../../src/tokens';

/**
 * SpacesCardScreen — Full-screen issue inspector and editor.
 * Reads `cardId` via useLocalSearchParams(), loads task details, comments,
 * and activity logs directly from backend API endpoints.
 */
export default function SpacesCardScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const { cardId, projectId, from } = useLocalSearchParams<{
    cardId?: string;
    projectId?: string;
    from?: string;
  }>();
  const { user } = useAuth();
  const { spaces } = useProjects();

  const [card, setCard] = useState<CardType | null>(() => {
    if (!cardId) return null;
    return mockCards.find((c) => c.id === cardId) || null;
  });
  const [columns, setColumns] = useState<BoardColumn[]>(() => {
    return createDefaultBoardColumns(projectId || 'default');
  });
  const [comments, setComments] = useState<Comment[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [taskTypes, setTaskTypes] = useState<CardTypeOption[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch task types for project
  useEffect(() => {
    const projId = card?.projectId || projectId;
    const numProjId = Number(projId);
    if (!isNaN(numProjId) && numProjId > 0) {
      taskService
        .getTaskTypes(numProjId)
        .then((types) => {
          if (types && types.length > 0) {
            setTaskTypes(types.map(taskTypeToCardTypeOption));
          }
        })
        .catch((err) => console.warn('Failed to load task types:', err));
    }
  }, [card?.projectId, projectId]);

  // Fetch task detail, comments, and activity from API
  useEffect(() => {
    if (!cardId) return;

    let isMounted = true;
    const numericCardId = Number(cardId);

    // If cardId is numeric, fetch from live backend API
    if (!isNaN(numericCardId)) {
      setLoading(true);
      taskService
        .getTask(numericCardId)
        .then((backendTask) => {
          if (!isMounted) return;
          const convertedCard = backendTaskToCard(backendTask);
          setCard(convertedCard);
          if (backendTask.project?.id) {
            setColumns(createDefaultBoardColumns(backendTask.project.id));
          }
        })
        .catch((err) => {
          console.warn('Failed to load card from backend:', err);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      // Load comments
      taskService
        .getComments(numericCardId)
        .then((backendComments) => {
          if (!isMounted) return;
          setComments(
            backendComments.map((bc) => backendCommentToComment(bc, cardId))
          );
        })
        .catch((err) => console.warn('Failed to load comments:', err));

      // Load activity
      taskService
        .getActivity(numericCardId, { tab: 'all' })
        .then((entries) => {
          if (!isMounted) return;
          setActivityLogs(
            entries.map((entry) => backendActivityToActivityLog(entry, cardId))
          );
        })
        .catch((err) => console.warn('Failed to load activity:', err));
    }

    return () => {
      isMounted = false;
    };
  }, [cardId]);

  // Derive users from project members or current user
  const users = useMemo<User[]>(() => {
    const currentProjectId = card?.projectId || projectId;
    const space = spaces.find(
      (s) => String(s.project.id) === String(currentProjectId)
    );
    if (space?.members && space.members.length > 0) {
      return space.members.map((m) => ({
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
    return mockUsers;
  }, [card?.projectId, projectId, spaces, user]);

  // Back navigation handler
  const handleBack = () => {
    const currentProjectId = card?.projectId || projectId;
    if (from === 'home') {
      router.replace('/(tabs)');
    } else if (from === 'project' && currentProjectId) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace({
          pathname: '/(tabs)/spaces/project',
          params: { projectId: currentProjectId },
        });
      }
    } else if (router.canGoBack()) {
      router.back();
    } else if (currentProjectId) {
      router.replace({
        pathname: '/(tabs)/spaces/project',
        params: { projectId: currentProjectId },
      });
    } else {
      router.replace('/(tabs)/spaces');
    }
  };

  // Save changes callback
  const handleSaveCard = async (updatedCard: CardType) => {
    const numericCardId = Number(updatedCard.id);
    if (!isNaN(numericCardId)) {
      try {
        const targetStatus = columnIdToStatus(updatedCard.columnId);
        let resolvedTypeId: number | undefined = updatedCard.typeId;
        if (!resolvedTypeId && updatedCard.type) {
          const num = Number(updatedCard.type);
          if (!isNaN(num) && num > 0) {
            resolvedTypeId = num;
          } else {
            const found = taskTypes.find(
              (t) =>
                t.label.toLowerCase() === updatedCard.type?.toLowerCase() ||
                t.id === updatedCard.type
            );
            if (found && !isNaN(Number(found.id))) {
              resolvedTypeId = Number(found.id);
            }
          }
        }

        await taskService.updateTask(numericCardId, {
          title: updatedCard.title,
          description: updatedCard.description,
          assignee: updatedCard.assigneeId ? Number(updatedCard.assigneeId) : null,
          due_date: updatedCard.dueDate || null,
          status: targetStatus,
          type: resolvedTypeId,
        });
      } catch (err: unknown) {
        Alert.alert(
          'Save Failed',
          err instanceof Error ? err.message : 'Could not update task on backend.'
        );
        return;
      }
    }
    setCard(updatedCard);
    handleBack();
  };

  // Delete card callback
  const handleDeleteCard = async (deletedCardId: string) => {
    const numericCardId = Number(deletedCardId);
    if (!isNaN(numericCardId)) {
      try {
        await taskService.deleteTask(numericCardId);
      } catch (err: unknown) {
        Alert.alert(
          'Delete Failed',
          err instanceof Error ? err.message : 'Could not delete task on backend.'
        );
        return;
      }
    }
    handleBack();
  };

  // Add comment callback
  const handleAddComment = async (content: string, targetCardId?: string) => {
    const id = targetCardId || card?.id;
    if (!id) return;
    const numericCardId = Number(id);

    if (!isNaN(numericCardId)) {
      try {
        const backendComment = await taskService.addComment(numericCardId, {
          body: content.trim(),
        });
        const converted = backendCommentToComment(backendComment, id);
        setComments((prev) => [...prev, converted]);
        return;
      } catch (err: unknown) {
        Alert.alert(
          'Comment Failed',
          err instanceof Error ? err.message : 'Failed to post comment.'
        );
        return;
      }
    }

    const fallbackComment: Comment = {
      id: `comment-${Date.now()}`,
      cardId: id,
      authorId: user ? String(user.id) : 'user-1',
      content,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, fallbackComment]);
  };

  // Delete comment callback
  const handleDeleteComment = async (commentId: string) => {
    const numericCardId = Number(card?.id);
    const numericCommentId = Number(commentId);

    if (!isNaN(numericCardId) && !isNaN(numericCommentId)) {
      try {
        await taskService.deleteComment(numericCardId, numericCommentId);
      } catch (err: unknown) {
        Alert.alert(
          'Delete Comment Failed',
          err instanceof Error ? err.message : 'Failed to delete comment.'
        );
        return;
      }
    }
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const currentUserId = user ? String(user.id) : undefined;

  if (!card) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.paper }]}>
        <View style={[styles.topBar, { borderBottomColor: colors.line }]}>
          <Pressable
            onPress={() => router.replace('/(tabs)/spaces')}
            accessibilityRole="button"
            accessibilityLabel="Back to spaces"
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: pressed ? colors.surface : 'transparent' },
            ]}
          >
            <ChevronBackIcon size={20} color={colors.ink} />
            <Text variant="bodySmall" bold style={{ color: colors.ink }}>
              Back
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
          title="Card Not Found"
          description={`Could not find an issue with ID "${cardId}".`}
          actionLabel="Back to Spaces"
          onAction={() => router.replace('/(tabs)/spaces')}
        />
      </View>
    );
  }

  return (
    <CardDetail
      card={card}
      columns={columns}
      users={users}
      currentUserId={currentUserId}
      comments={comments}
      activityLogs={activityLogs}
      cardTypes={taskTypes}
      onAddComment={handleAddComment}
      onDeleteComment={handleDeleteComment}
      onClose={handleBack}
      onSave={handleSaveCard}
      onDelete={handleDeleteCard}
      onAddStatus={(newCol) => setColumns((prev) => [...prev, newCol])}
      fullScreen={true}
      loading={loading}
    />
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
});