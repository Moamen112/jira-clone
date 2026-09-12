import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { AddIcon, LayersIcon } from '../../../../assets/icon';
import {
  BoardColumn as BoardColumnType,
  Card as CardType,
  User,
  getCardRole,
} from '@jira-clone/shared';
import { Text } from '../../base/typography/Text';
import { Badge } from '../../base/badge/Badge';
import { Button } from '../../base/button/Button';
import { IconButton } from '../../base/icon-button/IconButton';
import { Input } from '../../base/input/Input';
import { Card } from '../card/Card';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';
import { useTheme } from '../../../tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const DEFAULT_COLUMN_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 330);

export interface BoardColumnProps {
  /** The board column metadata */
  column: BoardColumnType;
  /** Cards belonging to this column */
  cards: CardType[];
  /** Available workspace members */
  users?: User[];
  /** Current viewing user ID */
  currentUserId?: string;
  /** Card press handler (opens detail) */
  onCardPress?: (card: CardType) => void;
  /** Quick move handler */
  onCardMove?: (card: CardType) => void;
  /** Card single assignee change callback */
  onCardAssigneeChange?: (userId: string | null, card: CardType) => void;
  /** Card multi-assignees change callback */
  onCardAssigneesChange?: (userIds: string[], card: CardType) => void;
  /** Quick inline card creation callback */
  onCreateCard?: (title: string, columnId: string) => void | Promise<void>;
  /** Whether card creation is allowed (default: true) */
  canCreateCard?: boolean;
  /** Custom column width (default: 82% screen width, capped at 330px) */
  columnWidth?: number;
  /** Custom container style */
  style?: ViewStyle;
  /** Test identifier */
  testID?: string;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  column,
  cards = [],
  users = [],
  currentUserId,
  onCardPress,
  onCardMove,
  onCardAssigneeChange,
  onCardAssigneesChange,
  onCreateCard,
  canCreateCard = true,
  columnWidth = DEFAULT_COLUMN_WIDTH,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Column accent colors matching Fieldnotes status semantics
  const columnColor =
    column.color ||
    (column.id.includes('done')
      ? '#10B981'
      : column.id.includes('review')
      ? colors.accent
      : column.id.includes('progress')
      ? '#3B82F6'
      : colors.inkMuted);

  const handleCreateSubmit = async () => {
    const trimmed = newTitle.trim();
    if (!trimmed || submitting || !onCreateCard) return;

    try {
      setSubmitting(true);
      await onCreateCard(trimmed, column.id);
      setNewTitle('');
      setIsCreating(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelCreate = () => {
    setNewTitle('');
    setIsCreating(false);
  };

  // Helper to resolve card assignees for each card
  const getCardAssignees = (card: CardType): User[] => {
    if (card.assigneeIds && card.assigneeIds.length > 0) {
      return card.assigneeIds
        .map((id) => users.find((u) => u.id === id))
        .filter((u): u is User => Boolean(u));
    }
    if (card.assigneeId) {
      const single = users.find((u) => u.id === card.assigneeId);
      return single ? [single] : [];
    }
    return [];
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: columnWidth,
          backgroundColor: colors.surface,
          borderColor: colors.line,
        },
        style,
      ]}
      testID={testID}
    >
      {/* Column Header */}
      <View style={[styles.header, { borderBottomColor: colors.line }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.statusIndicator, { backgroundColor: columnColor }]} />
          <Text
            variant="body"
            bold
            style={[styles.columnTitle, { color: colors.ink }]}
            numberOfLines={1}
          >
            {column.title}
          </Text>
          <Badge
            label={String(cards.length)}
            variant="neutral"
            size="sm"
            rounded
          />
        </View>

        {canCreateCard && onCreateCard && !isCreating && (
          <IconButton
            variant="ghost"
            size="sm"
            icon={<AddIcon size={18} color={colors.ink} />}
            accessibilityLabel={`Add card to ${column.title}`}
            onPress={() => setIsCreating(true)}
          />
        )}
      </View>

      {/* Cards List Body */}
      <View style={styles.cardList}>
        {cards.map((card) => {
          const role = currentUserId
            ? getCardRole(currentUserId, card)
            : 'viewer';
          const cardAssignees = getCardAssignees(card);
          const singleAssignee = cardAssignees[0] || null;

          return (
            <Card
              key={card.id}
              card={card}
              assignee={singleAssignee}
              assignees={cardAssignees}
              users={users}
              currentUserRole={role}
              showRoleBadge={false}
              onPress={onCardPress}
              onMove={onCardMove}
              onAssigneeChange={onCardAssigneeChange}
              onAssigneesChange={onCardAssigneesChange}
            />
          );
        })}

        {/* Empty Column State */}
        {cards.length === 0 && !isCreating && (
          <View
            style={[
              styles.emptyContainer,
              { borderColor: colors.line, backgroundColor: colors.paper },
            ]}
          >
            <LayersIcon
              size={24}
              color={colors.inkMuted}
              style={{ marginBottom: spacing[1] }}
            />
            <Text variant="caption" muted style={{ textAlign: 'center' }}>
              No cards in {column.title}
            </Text>
            {canCreateCard && onCreateCard && (
              <Button
                variant="ghost"
                size="sm"
                label="+ Add a card"
                onPress={() => setIsCreating(true)}
                style={{ marginTop: spacing[1] }}
              />
            )}
          </View>
        )}

        {/* Inline Card Creation Form */}
        {isCreating && (
          <View
            style={[
              styles.createCardBox,
              { backgroundColor: colors.paper, borderColor: colors.line },
            ]}
          >
            <Input
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="What needs to be done?"
              autoFocus
              editable={!submitting}
              containerStyle={styles.createInput}
              onSubmitEditing={handleCreateSubmit}
              returnKeyType="done"
            />
            <View style={styles.createActions}>
              <Button
                label="Cancel"
                variant="ghost"
                size="sm"
                disabled={submitting}
                onPress={handleCancelCreate}
              />
              <Button
                label="Add Card"
                variant="primary"
                size="sm"
                disabled={!newTitle.trim()}
                loading={submitting}
                onPress={handleCreateSubmit}
              />
            </View>
          </View>
        )}
      </View>

      {/* Quick Add Footer Trigger (when not creating and column has cards) */}
      {canCreateCard && onCreateCard && !isCreating && cards.length > 0 && (
        <Pressable
          onPress={() => setIsCreating(true)}
          style={({ pressed }) => [
            styles.addCardButton,
            pressed && {
              backgroundColor: colors.paper,
              borderColor: colors.line,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Add card to ${column.title}`}
        >
          <AddIcon size={16} color={colors.inkMuted} />
          <Text variant="caption" bold muted style={{ marginLeft: spacing[1] }}>
            Add card
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing[3],
    marginRight: spacing[3],
    alignSelf: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  columnTitle: {
    fontSize: 14,
  },
  cardList: {
    gap: spacing[2],
  },
  emptyContainer: {
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.card,
  },
  createCardBox: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing[2],
    marginBottom: spacing[2],
  },
  createInput: {
    marginBottom: spacing[2],
  },
  createActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
    borderRadius: radius.input,
    marginTop: spacing[2],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  addCardButtonPressed: {},
});

export default BoardColumn;
