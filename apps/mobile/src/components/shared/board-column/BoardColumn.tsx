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
import { CreateCardInline } from '../create-card-inline';
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
  /** Callback fired when the '+' add card button is clicked */
  onAddCardPress?: (columnId: string) => void;
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
  onAddCardPress,
  onCreateCard,
  canCreateCard = true,
  columnWidth = DEFAULT_COLUMN_WIDTH,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const [isCreating, setIsCreating] = useState(false);

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

        {canCreateCard && (onAddCardPress || onCreateCard) && (
          <IconButton
            variant="ghost"
            size="sm"
            icon={<AddIcon size={18} color={colors.ink} />}
            accessibilityLabel={`Add card to ${column.title}`}
            onPress={() => {
              if (onAddCardPress) {
                onAddCardPress(column.id);
              } else {
                setIsCreating(true);
              }
            }}
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
          </View>
        )}

        {/* Inline Card Creation */}
        {canCreateCard && (onAddCardPress || onCreateCard) && (
          <CreateCardInline
            columnId={column.id}
            placeholder="What needs to be done?"
            autoExpand={isCreating}
            onTriggerPress={onAddCardPress ? () => onAddCardPress(column.id) : undefined}
            onCreate={async ({ title }) => {
              if (onCreateCard) {
                await onCreateCard(title, column.id);
              }
              setIsCreating(false);
            }}
          />
        )}
      </View>
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
});

export default BoardColumn;
