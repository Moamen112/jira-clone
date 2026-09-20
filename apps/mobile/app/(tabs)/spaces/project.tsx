import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronBackIcon, SunnyIcon, MoonIcon, AddIcon } from '../../../assets/icon';
import {
  mockProjects,
  mockColumns,
  mockCards,
  mockUsers,
  mockCurrentUser,
  Card as CardType,
  createCard,
  moveCardToColumn,
} from '@jira-clone/shared';
import { Text, Modal, Button, Input, Dropdown } from '../../../src/components/base';
import { Board } from '../../../src/components/shared/board';
import { ProjectHeader } from '../../../src/components/shared/project-header';
import { CardMoveMenu, CardPosition } from '../../../src/components/shared/card-move-menu';
import { EmptyState } from '../../../src/components/shared/empty-state';
import { useTheme, spacing, radius } from '../../../src/tokens';

/**
 * SpacesProjectScreen — Project Detail / Kanban Board view.
 * Reads `projectId` from URL params, filters columns and cards,
 * and embeds the Kanban Board with quick card actions.
 */
export default function SpacesProjectScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const { projectId, from } = useLocalSearchParams<{ projectId?: string; from?: string }>();

  // Resolve project entity (fall back to first project if unprovided)
  const project = useMemo(() => {
    if (!projectId) return mockProjects[0];
    return mockProjects.find((p) => p.id === projectId) || null;
  }, [projectId]);

  // Project cards state
  const [cards, setCards] = useState<CardType[]>(mockCards);

  // Quick move menu state
  const [moveMenuCard, setMoveMenuCard] = useState<CardType | null>(null);
  const [moveMenuVisible, setMoveMenuVisible] = useState(false);

  // Derive columns belonging to this project
  const projectColumns = useMemo(() => {
    if (!project) return [];
    return mockColumns.filter((col) => col.projectId === project.id);
  }, [project]);

  // Derive cards belonging to this project
  const projectCards = useMemo(() => {
    if (!project) return [];
    return cards.filter((card) => card.projectId === project.id);
  }, [cards, project]);

  // Derive project team members
  const members = useMemo(() => {
    if (!project) return [];
    const pCards = mockCards.filter((c) => c.projectId === project.id);
    const memberIdSet = new Set<string>();

    if (project.ownerId) memberIdSet.add(project.ownerId);

    pCards.forEach((c) => {
      if (c.publisherId) memberIdSet.add(c.publisherId);
      if (c.assigneeId) memberIdSet.add(c.assigneeId);
      c.assigneeIds?.forEach((id) => memberIdSet.add(id));
    });

    if (memberIdSet.size === 0) {
      return mockUsers.slice(0, 2);
    }

    return mockUsers.filter((u) => memberIdSet.has(u.id));
  }, [project]);

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
      params: { cardId: card.id, from: 'project' },
    });
  };

  // Card move callbacks
  const handleCardMove = (card: CardType) => {
    setMoveMenuCard(card);
    setMoveMenuVisible(true);
  };

  const handleMoveColumn = (
    columnId: string,
    targetCard: CardType,
    _position?: CardPosition
  ) => {
    setCards((prev) => moveCardToColumn(prev, targetCard.id, columnId));
  };

  // Inline card creation callback
  const handleCreateCard = (title: string, columnId: string) => {
    if (!project) return;
    const newCard = createCard({
      title,
      projectId: project.id,
      projectKey: project.key,
      columnId,
      cardIndex: cards.length + 1,
      order: cards.filter((c) => c.columnId === columnId).length,
    });
    setCards((prev) => [...prev, newCard]);
  };

  // Quick Create Card Modal state & handlers
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string>('');
  const [newCardTitle, setNewCardTitle] = useState('');
  const [cardTitleError, setCardTitleError] = useState<string | undefined>();

  const handleOpenCreateCard = (columnId?: string) => {
    setTargetColumnId(columnId || projectColumns[0]?.id || '');
    setNewCardTitle('');
    setCardTitleError(undefined);
    setIsCreateCardOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateCardOpen(false);
    setNewCardTitle('');
    setCardTitleError(undefined);
  };

  const handleConfirmCreateCard = () => {
    const trimmed = newCardTitle.trim();
    if (!trimmed) {
      setCardTitleError('Card title cannot be empty.');
      return;
    }
    const chosenColumnId = targetColumnId || projectColumns[0]?.id || '';
    handleCreateCard(trimmed, chosenColumnId);
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
        columns={projectColumns}
        cards={projectCards}
        users={mockUsers}
        currentUserId={mockCurrentUser.id}
        onCardPress={handleCardPress}
        onCardMove={handleCardMove}
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
            ? `${project.key} · ${projectColumns.find((c) => c.id === targetColumnId)?.title || targetColumnId}`
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

          {projectColumns.length > 1 && (
            <Dropdown
              label="Status"
              value={targetColumnId}
              options={projectColumns.map((c) => ({
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
        columns={projectColumns}
        currentUserId={mockCurrentUser.id}
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