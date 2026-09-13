import type { CSSProperties, FC } from 'react';
import type { Comment, User } from '@jira-clone/shared';
import { Text, IconButton } from '../../base';
import { Avatar } from '../avatar';

export interface CommentItemProps {
  /** The comment object */
  comment: Comment;
  /** Resolved author user details */
  author?: User | null;
  /** Whether the current user can delete this comment */
  canDelete?: boolean;
  /** Callback fired when user clicks delete */
  onDelete?: (commentId: string) => void;
  /** Custom container style */
  style?: CSSProperties;
}

const TrashIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const CommentItem: FC<CommentItemProps> = ({
  comment,
  author,
  canDelete = false,
  onDelete,
  style,
}) => {
  const authorName = author?.name || 'Team Member';

  const formattedTime = new Date(comment.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        ...style,
      }}
    >
      <Avatar name={authorName} imageUrl={author?.avatarUrl} size="sm" />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          backgroundColor: 'var(--color-paper)',
          border: '1px solid var(--color-line)',
          borderRadius: 'var(--radius-card)',
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text variant="bodySmall" bold>
              {authorName}
            </Text>
            <Text variant="caption" muted>
              {formattedTime}
            </Text>
          </div>

          {canDelete && onDelete && (
            <IconButton
              variant="ghost"
              size="sm"
              label="Delete comment"
              icon={<TrashIcon size={14} />}
              onPress={() => onDelete(comment.id)}
            />
          )}
        </div>

        <Text variant="bodySmall" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {comment.content}
        </Text>
      </div>
    </div>
  );
};

export default CommentItem;
