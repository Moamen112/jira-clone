import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  mockCards,
  mockColumns,
  mockUsers,
  mockCurrentUser,
  mockComments,
  mockActivityLogs,
  getCardRole,
  Card as CardType,
  User,
  Comment,
} from '@jira-clone/shared';
import { Text, Toast, Button } from '../../src/components/base';
import {
  Card,
  CardDetail,
  AssigneeSelect,
  ConfirmDialog,
  ConfirmDialogVariant,
  CommentSection,
  CardMoveMenu,
  CardPosition,
  BoardFilterBar,
  filterCards,
  BoardColumn,
  Board,
} from '../../src/components/shared';
import { spacing } from '../../src/tokens/spacing';
import { useTheme, ThemeMode } from '../../src/tokens';

export default function HomeScreen() {
  const { mode, isDark, colors, setThemeMode } = useTheme();
  const [cards, setCards] = useState<CardType[]>(mockCards);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [demoAssigneeId, setDemoAssigneeId] = useState<string | null>(mockUsers[1].id);
  const [demoMultiAssigneeIds, setDemoMultiAssigneeIds] = useState<string[]>([
    mockUsers[0].id,
    mockUsers[1].id,
  ]);
  const [demoConfirmVisible, setDemoConfirmVisible] = useState(false);
  const [demoConfirmVariant, setDemoConfirmVariant] = useState<ConfirmDialogVariant>('danger');
  const [moveMenuCard, setMoveMenuCard] = useState<CardType | null>(null);
  const [moveMenuVisible, setMoveMenuVisible] = useState(false);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [detailVisible, setDetailVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Board Filter Bar state
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [createdByMe, setCreatedByMe] = useState(false);
  const [hasCommentsFilter, setHasCommentsFilter] = useState(false);
  const [selectedFilterUserIds, setSelectedFilterUserIds] = useState<string[]>([]);

  const handleToggleFilterUserId = (userId: string) => {
    setSelectedFilterUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setAssignedToMe(false);
    setCreatedByMe(false);
    setHasCommentsFilter(false);
    setSelectedFilterUserIds([]);
  };

  const filteredCards = filterCards(cards, {
    searchQuery,
    assignedToMe,
    createdByMe,
    hasComments: hasCommentsFilter,
    selectedUserIds: selectedFilterUserIds,
    currentUserId: mockCurrentUser.id,
  });

  const handleCardPress = (card: CardType) => {
    setSelectedCard(card);
    setDetailVisible(true);
  };

  const handleCardMovePress = (card: CardType) => {
    setMoveMenuCard(card);
    setMoveMenuVisible(true);
  };

  const handleMoveColumn = (
    columnId: string,
    targetCard: CardType,
    position?: CardPosition
  ) => {
    const targetColumn = mockColumns.find((c) => c.id === columnId);
    setCards((prev) =>
      prev.map((c) => (c.id === targetCard.id ? { ...c, columnId } : c))
    );
    if (selectedCard && selectedCard.id === targetCard.id) {
      setSelectedCard((prev) => (prev ? { ...prev, columnId } : null));
    }
    setToastMessage(
      `Moved ${targetCard.key} to ${targetColumn?.title || 'column'}${
        position === 'top' ? ' (top)' : ''
      }`
    );
    setToastVisible(true);
  };

  const handleCardSave = (updatedCard: CardType) => {
    setCards((prev) =>
      prev.map((c) => (c.id === updatedCard.id ? updatedCard : c))
    );
    setSelectedCard(updatedCard);
    setDetailVisible(false);
    setToastMessage(`Card ${updatedCard.key} updated successfully.`);
    setToastVisible(true);
  };

  const handleCardDelete = (cardId: string) => {
    const key = selectedCard?.key || '';
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setDetailVisible(false);
    setSelectedCard(null);
    setToastMessage(`Card ${key} deleted.`);
    setToastVisible(true);
  };

  const handleCreateCard = (title: string, columnId: string) => {
    const columnCards = cards.filter((c) => c.columnId === columnId);
    const newCard: CardType = {
      id: `card-${Date.now()}`,
      key: `FIELD-${cards.length + 1}`,
      title,
      projectId: 'project-1',
      columnId,
      order: columnCards.length,
      publisherId: mockCurrentUser.id,
      assigneeId: null,
      assigneeIds: [],
      priority: 'medium',
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCards((prev) => [...prev, newCard]);
    setToastMessage(`Created ${newCard.key}: "${title}"`);
    setToastVisible(true);
  };

  const handleAddComment = (content: string, cardId?: string) => {
    const targetCardId = cardId || selectedCard?.id;
    if (!targetCardId) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      cardId: targetCardId,
      authorId: mockCurrentUser.id,
      content,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [...prev, newComment]);
    setCards((prev) =>
      prev.map((c) =>
        c.id === targetCardId
          ? { ...c, commentCount: (c.commentCount || 0) + 1 }
          : c
      )
    );
    setToastMessage('Comment posted');
    setToastVisible(true);
  };

  const handleDeleteComment = (commentId: string) => {
    const comment = comments.find((c) => c.id === commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    if (comment) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === comment.cardId
            ? { ...c, commentCount: Math.max(0, (c.commentCount || 1) - 1) }
            : c
        )
      );
    }
    setToastMessage('Comment deleted');
    setToastVisible(true);
  };

  // Helper to find assignee by user ID
  const getAssignee = (assigneeId?: string | null) => {
    return mockUsers.find((u) => u.id === assigneeId) || null;
  };

  // Helper to resolve card assignees from assigneeIds or fallback to assigneeId
  const getCardAssignees = (card: CardType): User[] => {
    if (card.assigneeIds && card.assigneeIds.length > 0) {
      return card.assigneeIds
        .map((id) => mockUsers.find((u) => u.id === id))
        .filter((u): u is User => Boolean(u));
    }
    if (card.assigneeId) {
      const single = mockUsers.find((u) => u.id === card.assigneeId);
      return single ? [single] : [];
    }
    return [];
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.paper }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Theme Mode Switcher */}
        <View style={styles.header}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing[2],
            }}
          >
            <View style={{ flex: 1, marginRight: spacing[2] }}>
              <Text variant="heading" bold>
                Fieldnotes Issues
              </Text>
              <Text variant="caption" muted style={{ marginTop: 2 }}>
                Logged in as {mockCurrentUser.name}
              </Text>
            </View>

            {/* Theme Mode Selector Pills */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors.surface,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.line,
                padding: 3,
                gap: 2,
              }}
            >
              {(['light', 'dark', 'system'] as ThemeMode[]).map((themeOption) => {
                const isSelected = mode === themeOption;
                const iconName =
                  themeOption === 'light'
                    ? 'sunny'
                    : themeOption === 'dark'
                    ? 'moon'
                    : 'phone-portrait-outline';
                const label =
                  themeOption === 'light'
                    ? 'Light'
                    : themeOption === 'dark'
                    ? 'Dark'
                    : 'System';

                return (
                  <Pressable
                    key={themeOption}
                    onPress={() => setThemeMode(themeOption)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 16,
                      backgroundColor: isSelected ? colors.accent : 'transparent',
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Switch to ${label} theme`}
                  >
                    <Ionicons
                      name={iconName as any}
                      size={12}
                      color={isSelected ? '#FFFFFF' : colors.inkMuted}
                    />
                    <Text
                      variant="caption"
                      bold={isSelected}
                      style={{
                        fontSize: 11,
                        color: isSelected ? '#FFFFFF' : colors.inkMuted,
                      }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* AssigneeSelect Design Showcase */}
        <View style={[styles.showcaseCard, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <AssigneeSelect
            label="Multi-Assignee Select (Design Preview)"
            placeholder="No one assigned"
            multiple={true}
            selectedUserIds={demoMultiAssigneeIds}
            users={mockUsers}
            onSelectMultiple={(userIds) => {
              setDemoMultiAssigneeIds(userIds);
              setToastMessage(`Updated to ${userIds.length} assignees`);
              setToastVisible(true);
            }}
          />
        </View>

        {/* ConfirmDialog Design Showcase */}
        <View style={[styles.showcaseCard, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <Text variant="label" style={{ marginBottom: spacing[1] }}>
            Confirm Dialog (Design Preview)
          </Text>
          <Text variant="caption" muted style={{ marginBottom: spacing[3] }}>
            Preview modal confirmation variants for destructive & critical workflows
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
            <Button
              size="sm"
              variant="danger"
              label="Test Danger"
              onPress={() => {
                setDemoConfirmVariant('danger');
                setDemoConfirmVisible(true);
              }}
            />
            <Button
              size="sm"
              variant="secondary"
              label="Test Warning"
              onPress={() => {
                setDemoConfirmVariant('warning');
                setDemoConfirmVisible(true);
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              label="Test Info"
              onPress={() => {
                setDemoConfirmVariant('info');
                setDemoConfirmVisible(true);
              }}
            />
          </View>
        </View>

        {/* CommentSection Design Showcase */}
        <View style={[styles.showcaseCard, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <CommentSection
            title="Discussion Thread (Design Preview)"
            comments={comments.slice(0, 2)}
            users={mockUsers}
            currentUser={mockCurrentUser}
            onAddComment={(content) => handleAddComment(content, 'card-1')}
            onDeleteComment={handleDeleteComment}
          />
        </View>

        {/* Full Kanban Board Component Showcase */}
        <View style={{ marginBottom: spacing[4] }}>
          <Text variant="label" style={{ marginBottom: spacing[1] }}>
            Full Kanban Board Component
          </Text>
          <Text variant="caption" muted style={{ marginBottom: spacing[3] }}>
            Unified board with column snapping, column jump tabs, and inline card creation
          </Text>
          <Board
            columns={mockColumns}
            cards={cards}
            users={mockUsers}
            currentUserId={mockCurrentUser.id}
            boardTitle="Sprint 14 Kanban"
            projectKey="FIELD"
            showFilterBar={false}
            showColumnTabs={true}
            onCardPress={handleCardPress}
            onCardMove={handleCardMovePress}
            onCreateCard={handleCreateCard}
            onCardAssigneeChange={(userId, targetCard) => {
              setCards((prev) =>
                prev.map((c) =>
                  c.id === targetCard.id
                    ? {
                        ...c,
                        assigneeId: userId,
                        assigneeIds: userId ? [userId] : [],
                      }
                    : c
                )
              );
              const user = mockUsers.find((u) => u.id === userId);
              setToastMessage(
                user
                  ? `Reassigned ${targetCard.key} to ${user.name}`
                  : `Unassigned ${targetCard.key}`
              );
              setToastVisible(true);
            }}
            onCardAssigneesChange={(userIds, targetCard) => {
              setCards((prev) =>
                prev.map((c) =>
                  c.id === targetCard.id
                    ? {
                        ...c,
                        assigneeId: userIds[0] || null,
                        assigneeIds: userIds,
                      }
                    : c
                )
              );
              setToastMessage(
                `Updated ${targetCard.key} to ${userIds.length} assignees`
              );
              setToastVisible(true);
            }}
          />
        </View>

        {/* Cards Section */}
        <BoardFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          assignedToMe={assignedToMe}
          onToggleAssignedToMe={() => setAssignedToMe((prev) => !prev)}
          createdByMe={createdByMe}
          onToggleCreatedByMe={() => setCreatedByMe((prev) => !prev)}
          hasComments={hasCommentsFilter}
          onToggleHasComments={() => setHasCommentsFilter((prev) => !prev)}
          selectedUserIds={selectedFilterUserIds}
          onToggleUserId={handleToggleFilterUserId}
          users={mockUsers}
          currentUser={mockCurrentUser}
          matchCount={filteredCards.length}
          totalCount={cards.length}
          onClearFilters={handleClearFilters}
        />

        <View style={styles.cardList}>
          {filteredCards.map((card) => {
            const role = getCardRole(mockCurrentUser.id, card);
            const cardAssignees = getCardAssignees(card);
            const assignee = cardAssignees[0] || null;

            return (
              <Card
                key={card.id}
                card={card}
                assignee={assignee}
                assignees={cardAssignees}
                users={mockUsers}
                currentUserRole={role}
                showRoleBadge
                onPress={handleCardPress}
                onMove={handleCardMovePress}
                onAssigneeChange={(userId, targetCard) => {
                  setCards((prev) =>
                    prev.map((c) =>
                      c.id === targetCard.id
                        ? {
                            ...c,
                            assigneeId: userId,
                            assigneeIds: userId ? [userId] : [],
                          }
                        : c
                    )
                  );
                  const user = mockUsers.find((u) => u.id === userId);
                  setToastMessage(
                    user
                      ? `Reassigned ${targetCard.key} to ${user.name}`
                      : `Unassigned ${targetCard.key}`
                  );
                  setToastVisible(true);
                }}
                onAssigneesChange={(userIds, targetCard) => {
                  setCards((prev) =>
                    prev.map((c) =>
                      c.id === targetCard.id
                        ? {
                            ...c,
                            assigneeId: userIds[0] || null,
                            assigneeIds: userIds,
                          }
                        : c
                    )
                  );
                  setToastMessage(
                    `Updated ${targetCard.key} to ${userIds.length} assignees`
                  );
                  setToastVisible(true);
                }}
              />
            );
          })}

          {filteredCards.length === 0 && (
            <View
              style={[
                styles.filterEmptyState,
                { backgroundColor: colors.surface, borderColor: colors.line },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={32}
                color={colors.inkMuted}
                style={{ marginBottom: spacing[1] }}
              />
              <Text variant="bodySmall" bold style={{ color: colors.ink }}>
                No cards match your filters
              </Text>
              <Text
                variant="caption"
                muted
                style={{ textAlign: 'center', marginTop: 2, marginBottom: spacing[2] }}
              >
                Try adjusting your search terms or clearing active filters.
              </Text>
              <Button
                variant="ghost"
                size="sm"
                label="Reset Filters"
                onPress={handleClearFilters}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Card Detail Modal Sheet */}
      <CardDetail
        visible={detailVisible}
        card={selectedCard}
        columns={mockColumns}
        users={mockUsers}
        activityLogs={mockActivityLogs}
        comments={selectedCard ? comments.filter((c) => c.cardId === selectedCard.id) : []}
        currentUserId={mockCurrentUser.id}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onClose={() => setDetailVisible(false)}
        onSave={handleCardSave}
        onDelete={handleCardDelete}
      />

      {/* Card Quick Move Menu */}
      <CardMoveMenu
        visible={moveMenuVisible}
        card={moveMenuCard}
        columns={mockColumns}
        currentUserId={mockCurrentUser.id}
        onClose={() => {
          setMoveMenuVisible(false);
          setMoveMenuCard(null);
        }}
        onMoveColumn={handleMoveColumn}
      />

      {/* Demo Confirm Dialog */}
      <ConfirmDialog
        visible={demoConfirmVisible}
        title={
          demoConfirmVariant === 'danger'
            ? 'Delete Issue?'
            : demoConfirmVariant === 'warning'
            ? 'Discard Unsaved Changes?'
            : 'Archive Completed Sprint?'
        }
        itemKey="FIELD-42"
        message={
          demoConfirmVariant === 'danger'
            ? 'Are you sure you want to delete this issue? All comments, attachments, and activity logs will be permanently removed.'
            : demoConfirmVariant === 'warning'
            ? 'You have unsaved changes in this card description. Leaving now will discard any unsaved text.'
            : 'Archiving will move all completed tasks to the project historical archive.'
        }
        variant={demoConfirmVariant}
        confirmLabel={
          demoConfirmVariant === 'danger'
            ? 'Delete Issue'
            : demoConfirmVariant === 'warning'
            ? 'Discard'
            : 'Archive'
        }
        cancelLabel={demoConfirmVariant === 'warning' ? 'Keep Editing' : 'Cancel'}
        onConfirm={() => {
          setDemoConfirmVisible(false);
          setToastMessage(`Confirmed ${demoConfirmVariant} action`);
          setToastVisible(true);
        }}
        onCancel={() => setDemoConfirmVisible(false)}
      />

      {/* Toast Feedback */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        variant="success"
        duration={2500}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[6],
  },
  header: {
    marginBottom: spacing[4],
  },
  showcaseCard: {
    marginBottom: spacing[4],
    padding: spacing[3],
    borderRadius: 12,
    borderWidth: 1,
  },
  cardList: {
    gap: spacing[1],
  },
  filterEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[4],
    borderRadius: 12,
    borderWidth: 1,
  },
});
