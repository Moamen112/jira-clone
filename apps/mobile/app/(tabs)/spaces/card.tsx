import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronBackIcon, SunnyIcon, MoonIcon } from '../../../assets/icon';
import {
  mockCards,
  mockColumns,
  mockUsers,
  mockCurrentUser,
  mockComments,
  mockActivityLogs,
  Card as CardType,
  Comment,
  updateCardInList,
  deleteCardFromList,
} from '@jira-clone/shared';
import { CardDetail } from '../../../src/components/shared/card-detail';
import { EmptyState } from '../../../src/components/shared/empty-state';
import { Text } from '../../../src/components/base';
import { useTheme, spacing, radius } from '../../../src/tokens';

/**
 * SpacesCardScreen — Full-screen issue inspector and editor.
 * Reads `cardId` via useLocalSearchParams(), manages comments and card updates,
 * and renders the full-screen CardDetail interface.
 */
export default function SpacesCardScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const { cardId, from } = useLocalSearchParams<{ cardId?: string; from?: string }>();

  const [cards, setCards] = useState<CardType[]>(mockCards);
  const [comments, setComments] = useState<Comment[]>(mockComments);

  // Find active card from route parameter
  const card = useMemo(() => {
    if (!cardId) return null;
    return cards.find((c) => c.id === cardId) || null;
  }, [cards, cardId]);

  // Back navigation handler
  const handleBack = () => {
    if (from === 'home') {
      router.replace('/(tabs)');
    } else if (from === 'project' && card?.projectId) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace({
          pathname: '/(tabs)/spaces/project',
          params: { projectId: card.projectId },
        });
      }
    } else if (router.canGoBack()) {
      router.back();
    } else if (card?.projectId) {
      router.replace({
        pathname: '/(tabs)/spaces/project',
        params: { projectId: card.projectId },
      });
    } else {
      router.replace('/(tabs)/spaces');
    }
  };

  // Save changes callback
  const handleSaveCard = (updatedCard: CardType) => {
    setCards((prev) => updateCardInList(prev, updatedCard));
    handleBack();
  };

  // Delete card callback
  const handleDeleteCard = (deletedCardId: string) => {
    setCards((prev) => deleteCardFromList(prev, deletedCardId));
    handleBack();
  };

  // Add comment callback
  const handleAddComment = (content: string, targetCardId?: string) => {
    const id = targetCardId || card?.id;
    if (!id) return;
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      cardId: id,
      authorId: mockCurrentUser.id,
      content,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [newComment, ...prev]);
  };

  // Delete comment callback
  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

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

  const cardComments = comments.filter((c) => c.cardId === card.id);
  const cardActivityLogs = mockActivityLogs.filter((l) => l.cardId === card.id);

  return (
    <CardDetail
      card={card}
      columns={mockColumns}
      users={mockUsers}
      currentUserId={mockCurrentUser.id}
      comments={cardComments}
      activityLogs={cardActivityLogs.length > 0 ? cardActivityLogs : mockActivityLogs}
      onAddComment={handleAddComment}
      onDeleteComment={handleDeleteComment}
      onClose={handleBack}
      onSave={handleSaveCard}
      onDelete={handleDeleteCard}
      fullScreen={true}
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