import type { CSSProperties, FC } from 'react';
import type { Card as CardType, CardRole, User } from '@jira-clone/shared';
import { Text, Badge, IconButton } from '../../base';
import { AssigneeSelect } from '../assignee-select';
import { Avatar } from '../avatar';
import { AvatarGroup } from '../avatar-group';

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
  style?: CSSProperties;
  /** Optional test identifier */
  testID?: string;
}

const MessageSquareIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const MoveIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const Card: FC<CardProps> = ({
  card,
  assignee,
  assignees,
  users = [],
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
  const roleLabel =
    currentUserRole === 'publisher'
      ? 'Publisher'
      : currentUserRole === 'assignee'
        ? 'Assignee'
        : undefined;

  const resolvedAssignees =
    assignees ||
    (card.assigneeIds && card.assigneeIds.length > 0
      ? card.assigneeIds.map((id) => users.find((u) => u.id === id)).filter((u): u is User => Boolean(u))
      : card.assigneeId
        ? users.filter((u) => u.id === card.assigneeId)
        : assignee
          ? [assignee]
          : []);

  return (
    <div
      data-testid={testID}
      onClick={() => onPress?.(card)}
      style={{
        backgroundColor: 'var(--color-paper)',
        border: '1px solid var(--color-line)',
        borderRadius: 'var(--radius-card)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        cursor: onPress ? 'pointer' : 'default',
        boxSizing: 'border-box',
        transition: 'box-shadow 150ms ease, border-color 150ms ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-ink-muted)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-line)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top Meta Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text variant="monoKey" bold muted>
            {card.key}
          </Text>
          {showRoleBadge && roleLabel && (
            <Badge
              label={roleLabel}
              variant={currentUserRole === 'publisher' ? 'accent' : 'neutral'}
              size="sm"
            />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {onMove && (
            <span onClick={(e) => e.stopPropagation()}>
              <IconButton
                icon={<MoveIcon size={14} />}
                size="sm"
                variant="ghost"
                label="Move card"
                onPress={() => onMove(card)}
              />
            </span>
          )}
        </div>
      </div>

      {/* Card Title */}
      <Text variant="bodySmall" bold numberOfLines={2}>
        {card.title}
      </Text>

      {/* Card Description Snippet */}
      {showDescription && !!card.description && (
        <Text variant="caption" muted numberOfLines={2}>
          {card.description}
        </Text>
      )}

      {/* Footer Attributes Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--color-line)',
          paddingTop: '6px',
          marginTop: '2px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* In-Card AssigneeSlot */}
        <div>
          {onAssigneeChange || onAssigneesChange ? (
            <AssigneeSelect
              variant="avatarOnly"
              avatarSize="xs"
              multiple
              users={users}
              selectedUserId={card.assigneeId}
              selectedUserIds={
                card.assigneeIds || (card.assigneeId ? [card.assigneeId] : [])
              }
              onSelect={(uid) => {
                if (onAssigneesChange) {
                  onAssigneesChange(uid ? [uid] : [], card);
                } else {
                  onAssigneeChange?.(uid, card);
                }
              }}
              onSelectMultiple={(uids) => {
                if (onAssigneesChange) {
                  onAssigneesChange(uids, card);
                } else if (onAssigneeChange) {
                  onAssigneeChange(uids[0] || null, card);
                }
              }}
            />
          ) : resolvedAssignees.length > 1 ? (
            <AvatarGroup users={resolvedAssignees} size="xs" max={2} />
          ) : resolvedAssignees.length === 1 ? (
            <Avatar
              name={resolvedAssignees[0].name}
              imageUrl={resolvedAssignees[0].avatarUrl}
              size="xs"
            />
          ) : (
            <Avatar unassigned size="xs" />
          )}
        </div>

        {/* Comment Count Pill */}
        {card.commentCount > 0 && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-pill)',
              padding: '2px 6px',
              border: '1px solid var(--color-line)',
              color: 'var(--color-ink-muted)',
            }}
          >
            <MessageSquareIcon size={12} />
            <Text variant="caption" bold style={{ fontSize: 11 }}>
              {card.commentCount}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
