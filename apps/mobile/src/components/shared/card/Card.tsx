import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { EllipsisHorizontalIcon, ChatEllipsesIcon } from '../../../../assets/icon';
import { Card as CardType, CardRole, User } from '@jira-clone/shared';
import { Text } from '../../base/typography/Text';
import { Badge } from '../../base/badge/Badge';
import { Avatar } from '../../base/avatar/Avatar';
import { AvatarGroup } from '../../base/avatar-group/AvatarGroup';
import { IconButton } from '../../base/icon-button/IconButton';
import { AssigneeSelect } from '../assignee-select/AssigneeSelect';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';
import { useTheme } from '../../../tokens';

export interface CardProps {
  /** The card entity */
  card: CardType;
  /** Optional assigned user details (single) */
  assignee?: User | null;
  /** Optional list of assigned users (multi-assignee support) */
  assignees?: User[];
  /** Workspace members available for in-card reassignment */
  users?: User[];
  /** The role of the viewing user for this card */
  currentUserRole?: CardRole;
  /** Whether to show role badge in the header (default: false) */
  showRoleBadge?: boolean;
  /** Whether to render description snippet if available (default: true) */
  showDescription?: boolean;
  /** Press handler to inspect or open card details */
  onPress?: (card: CardType) => void;
  /** Quick move/action callback */
  onMove?: (card: CardType) => void;
  /** Callback fired when an assignee is changed directly from the card */
  onAssigneeChange?: (userId: string | null, card: CardType) => void;
  /** Callback fired when multiple assignees are changed directly from the card */
  onAssigneesChange?: (userIds: string[], card: CardType) => void;
  /** Custom container style */
  style?: ViewStyle;
  /** Optional test identifier */
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  card,
  assignee,
  assignees,
  users,
  currentUserRole,
  showRoleBadge = false,
  showDescription = true,
  onPress,
  onMove,
  onAssigneeChange,
  onAssigneesChange,
  style,
  testID,
}) => {
  const handlePress = () => {
    onPress?.(card);
  };

  const handleMovePress = () => {
    onMove?.(card);
  };

  const { colors } = useTheme();

  const roleLabel =
    currentUserRole === 'publisher'
      ? 'Publisher'
      : currentUserRole === 'assignee'
      ? 'Assignee'
      : undefined;

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.line },
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Card ${card.key}: ${card.title}`}
    >
      {/* Top Meta Bar */}
      <View style={styles.headerRow}>
        <Text variant="monoKey" bold muted style={styles.keyText}>
          {card.key}
        </Text>

        <View style={styles.headerActions}>
          {showRoleBadge && roleLabel && (
            <Badge
              label={roleLabel}
              variant={currentUserRole === 'publisher' ? 'accent' : 'neutral'}
              size="sm"
            />
          )}

          {onMove && (
            <IconButton
              icon={<EllipsisHorizontalIcon size={16} color={colors.inkMuted} />}
              size="sm"
              variant="ghost"
              accessibilityLabel="Card actions"
              onPress={handleMovePress}
            />
          )}
        </View>
      </View>

      {/* Card Title */}
      <Text variant="bodySmall" bold numberOfLines={3} style={[styles.title, { color: colors.ink }]}>
        {card.title}
      </Text>

      {/* Optional Description */}
      {showDescription && !!card.description && (
        <Text variant="caption" muted numberOfLines={2} style={styles.description}>
          {card.description}
        </Text>
      )}

      {/* Footer Attributes Bar */}
      <View style={[styles.footerRow, { borderTopColor: colors.line }]}>
        <View style={styles.footerLeft}>
          {/* TODO: Integrate PriorityBadge once implemented */}

          {/* Comment Count Pill */}
          {card.commentCount > 0 && (
            <View style={[styles.commentChip, { backgroundColor: colors.paper }]}>
              <ChatEllipsesIcon
                size={12}
                color={colors.inkMuted}
                style={{ marginRight: 3 }}
              />
              <Text variant="caption" muted style={{ fontWeight: '600', fontSize: 11 }}>
                {card.commentCount}
              </Text>
            </View>
          )}
        </View>

        {/* In-Card AssigneeSelect */}
        <View style={styles.footerRight}>
          <AssigneeSelect
            variant="avatarOnly"
            avatarSize="xs"
            multiple={true}
            selectedUserId={card.assigneeId}
            selectedUserIds={
              card.assigneeIds ||
              (assignees ? assignees.map((u) => u.id) : card.assigneeId ? [card.assigneeId] : [])
            }
            users={
              users && users.length > 0
                ? users
                : assignees || (assignee ? [assignee] : [])
            }
            disabled={
              currentUserRole
                ? currentUserRole !== 'publisher'
                : !onAssigneeChange && !onAssigneesChange
            }
            onSelect={(userId) => {
              if (onAssigneesChange) {
                onAssigneesChange(userId ? [userId] : [], card);
              } else {
                onAssigneeChange?.(userId, card);
              }
            }}
            onSelectMultiple={(userIds) => {
              if (onAssigneesChange) {
                onAssigneesChange(userIds, card);
              } else if (onAssigneeChange) {
                onAssigneeChange(userIds[0] || null, card);
              }
            }}
          />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing[3],
    marginBottom: spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.995 }],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  keyText: {
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  title: {
    lineHeight: 20,
  },
  description: {
    marginTop: spacing[1],
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[3],
    paddingTop: spacing[2],
    borderTopWidth: 1,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  commentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unassignedAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Card;
