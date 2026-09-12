import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronBackIcon } from '../../../assets/icon';
import {
  mockCards,
  mockColumns,
  mockUsers,
  mockCurrentUser,
  mockComments,
  mockActivityLogs,
  Card as CardType,
  Comment,
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
  const { colors } = useTheme();
  const router = useRouter();
  const { cardId } = useLocalSearchParams<{ cardId?: string }>();

  const [cards, setCards] = useState<CardType[]>(mockCards);
  const [comments, setComments] = useState<Comment[]>(mockComments);

  // Find active card from route parameter
  const card = useMemo(() => {
    if (!cardId) return null;
    return cards.find((c) => c.id === cardId) || null;
  }, [cards, cardId]);

  // Save changes callback
  const handleSaveCard = (updatedCard: CardType) => {
    setCards((prev) =>
      prev.map((c) => (c.id === updatedCard.id ? updatedCard : c))
    );
    router.back();
  };

  // Delete card callback
  const handleDeleteCard = (deletedCardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== deletedCardId));
    router.back();
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
            onPress={() => router.back()}
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
        </View>
        <EmptyState
          title="Card Not Found"
          description={`Could not find an issue with ID "${cardId}".`}
          actionLabel="Back to Spaces"
          onAction={() => router.back()}
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
      onClose={() => router.back()}
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
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
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