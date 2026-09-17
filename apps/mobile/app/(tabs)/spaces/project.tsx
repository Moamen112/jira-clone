import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronBackIcon, SunnyIcon, MoonIcon } from '../../../assets/icon';
import {
  mockProjects,
  mockColumns,
  mockCards,
  mockUsers,
  mockCurrentUser,
  Card as CardType,
} from '@jira-clone/shared';
import { Text } from '../../../src/components/base';
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
    setCards((prev) =>
      prev.map((c) =>
        c.id === targetCard.id
          ? { ...c, columnId, updatedAt: new Date().toISOString() }
          : c
      )
    );
  };

  // Inline card creation callback
  const handleCreateCard = (title: string, columnId: string) => {
    if (!project) return;
    const newCard: CardType = {
      id: `card-${Date.now()}`,
      key: `${project.key}-${cards.length + 1}`,
      title: title.trim(),
      projectId: project.id,
      columnId,
      publisherId: mockCurrentUser.id,
      priority: 'medium',
      order: cards.filter((c) => c.columnId === columnId).length,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCards((prev) => [...prev, newCard]);
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

      {/* Kanban Board with Project Header */}
      <Board
        columns={projectColumns}
        cards={projectCards}
        users={mockUsers}
        currentUserId={mockCurrentUser.id}
        onCardPress={handleCardPress}
        onCardMove={handleCardMove}
        onCreateCard={handleCreateCard}
        renderHeader={() => (
          <View style={styles.headerWrapper}>
            <ProjectHeader project={project} members={members} />
          </View>
        )}
        style={styles.board}
      />

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
});