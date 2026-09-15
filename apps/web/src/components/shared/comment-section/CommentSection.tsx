import { useState } from 'react';
import type { CSSProperties, FC } from 'react';
import type { Comment, User } from '@jira-clone/shared';
import { Text, Button, Badge, Textarea } from '../../base';
import { Avatar } from '../avatar';
import { ConfirmDialog } from '../confirm-dialog';
import { CommentItem } from './CommentItem';

export interface CommentSectionProps {
  /** Target card ID */
  cardId?: string;
  /** List of comments */
  comments?: Comment[];
  /** Workspace users for resolving author profiles */
  users?: User[];
  /** Currently logged in user */
  currentUser?: User | null;
  /** Permission to post comments (default: true) */
  canComment?: boolean;
  /** Async loading state while adding a comment */
  loading?: boolean;
  /** Custom section title (default: "Comments") */
  title?: string;
  /** Callback fired when a new comment is posted */
  onAddComment?: (content: string, cardId?: string) => void | Promise<void>;
  /** Callback fired when a comment is deleted */
  onDeleteComment?: (commentId: string) => void;
  /** Custom container style */
  style?: CSSProperties;
  /** Test identifier */
  testID?: string;
}

export const CommentSection: FC<CommentSectionProps> = ({
  cardId,
  comments = [],
  users = [],
  currentUser,
  canComment = true,
  loading = false,
  title = 'Comments',
  onAddComment,
  onDeleteComment,
  style,
  testID,
}) => {
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const handlePostComment = async () => {
    const trimmed = draft.trim();
    if (!trimmed || submitting) return;

    try {
      setSubmitting(true);
      await onAddComment?.(trimmed, cardId);
      setDraft('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = () => {
    if (commentToDelete && onDeleteComment) {
      onDeleteComment(commentToDelete);
    }
    setCommentToDelete(null);
  };

  return (
    <div
      data-testid={testID}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        ...style,
      }}
    >
      {/* Section Header */}
      {title ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text variant="subheading" bold>
              {title}
            </Text>
            <Badge label={String(comments.length)} variant="neutral" size="sm" />
          </div>
        </div>
      ) : null}

      {/* Composer */}
      {canComment && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-line)',
            borderRadius: 'var(--radius-card)',
            padding: 12,
          }}
        >
          {currentUser && (
            <Avatar name={currentUser.name} imageUrl={currentUser.avatarUrl} size="sm" />
          )}

          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Textarea
              value={draft}
              onChangeText={setDraft}
              placeholder="Add a comment or feedback..."
              style={{ minHeight: 60 }}
              containerStyle={{ marginBottom: 0 }}
            />

            {draft.trim().length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button
                  label="Cancel"
                  variant="ghost"
                  size="sm"
                  disabled={submitting}
                  onPress={() => setDraft('')}
                />
                <Button
                  label="Post Comment"
                  variant="primary"
                  size="sm"
                  loading={submitting || loading}
                  onPress={handlePostComment}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comment List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {comments.map((comment) => {
          const author = users.find((u) => u.id === comment.authorId);
          const isOwnComment = currentUser?.id === comment.authorId;

          return (
            <CommentItem
              key={comment.id}
              comment={comment}
              author={author}
              canDelete={isOwnComment || Boolean(onDeleteComment)}
              onDelete={(id) => setCommentToDelete(id)}
            />
          );
        })}

        {comments.length === 0 && (
          <div style={{ padding: '16px 0', textAlign: 'center' }}>
            <Text variant="caption" muted>
              No comments yet. Start the conversation!
            </Text>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={Boolean(commentToDelete)}
        title="Delete Comment"
        message="Are you sure you want to permanently delete this comment? This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setCommentToDelete(null)}
      />
    </div>
  );
};

export default CommentSection;
