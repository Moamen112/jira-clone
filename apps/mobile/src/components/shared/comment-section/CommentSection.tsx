import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Comment, User } from '@jira-clone/shared';
import { Text } from '../../base/typography/Text';
import { Avatar } from '../../base/avatar/Avatar';
import { Button } from '../../base/button/Button';
import { Badge } from '../../base/badge/Badge';
import { Textarea } from '../../base/textarea/Textarea';
import { ConfirmDialog } from '../confirm-dialog/ConfirmDialog';
import { CommentItem } from './CommentItem';
import { useTheme } from '../../../tokens';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';

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
  /** Custom section title (default: "COMMENTS") */
  title?: string;
  /** Callback fired when a new comment is posted */
  onAddComment?: (content: string, cardId?: string) => void | Promise<void>;
  /** Callback fired when a comment is deleted */
  onDeleteComment?: (commentId: string) => void;
  /** Custom container style */
  style?: ViewStyle;
  /** Test identifier */
  testID?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  cardId,
  comments = [],
  users = [],
  currentUser,
  canComment = true,
  loading = false,
  title = 'COMMENTS',
  onAddComment,
  onDeleteComment,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const [draft, setDraft] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const isComposerActive = isFocused || draft.trim().length > 0;

  const handlePostComment = async () => {
    const trimmed = draft.trim();
    if (!trimmed || submitting) return;

    try {
      setSubmitting(true);
      await onAddComment?.(trimmed, cardId);
      setDraft('');
      setIsFocused(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setDraft('');
    setIsFocused(false);
  };

  const handleConfirmDeleteComment = () => {
    if (commentToDelete && onDeleteComment) {
      onDeleteComment(commentToDelete);
    }
    setCommentToDelete(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.line }, style]} testID={testID}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <Text variant="sectionLabel" muted style={styles.headingText}>
          {title}
        </Text>
        {comments.length > 0 && (
          <Badge
            label={String(comments.length)}
            variant="neutral"
            size="sm"
            rounded
          />
        )}
      </View>

      {/* Comment List */}
      {comments.length > 0 ? (
        <View style={styles.list}>
          {comments.map((comment) => {
            const author = users.find((u) => u.id === comment.authorId);
            const isAuthor = currentUser ? comment.authorId === currentUser.id : false;

            return (
              <CommentItem
                key={comment.id}
                comment={comment}
                author={author}
                canDelete={isAuthor && Boolean(onDeleteComment)}
                onDelete={(commentId) => setCommentToDelete(commentId)}
              />
            );
          })}
        </View>
      ) : (
        /* Empty State */
        <View style={styles.emptyState}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={24}
            color={colors.inkMuted}
            style={{ marginBottom: spacing[1] }}
          />
          <Text variant="caption" muted style={{ textAlign: 'center' }}>
            No comments yet. Start the conversation below.
          </Text>
        </View>
      )}

      {/* Composer Row */}
      {canComment && onAddComment && (
        <View style={[styles.composerWrapper, { borderTopColor: colors.line }]}>
          <View style={styles.composerHeader}>
            {currentUser && (
              <Avatar
                name={currentUser.name}
                imageUrl={currentUser.avatarUrl}
                size="xs"
              />
            )}
            <Text variant="caption" muted style={{ fontWeight: '600' }}>
              Add a comment
            </Text>
          </View>

          <View style={styles.textareaContainer}>
            <Textarea
              value={draft}
              onChangeText={setDraft}
              onFocus={() => setIsFocused(true)}
              placeholder="Write a comment, share updates, or ask a question..."
              editable={!submitting && !loading}
              numberOfLines={isComposerActive ? 3 : 2}
              containerStyle={styles.textarea}
            />

            {isComposerActive && (
              <View style={styles.composerActions}>
                <Button
                  label="Cancel"
                  variant="ghost"
                  size="sm"
                  disabled={submitting || loading}
                  onPress={handleCancel}
                />
                <Button
                  label="Save"
                  variant="primary"
                  size="sm"
                  disabled={!draft.trim()}
                  loading={submitting || loading}
                  onPress={handlePostComment}
                />
              </View>
            )}
          </View>
        </View>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={Boolean(commentToDelete)}
        title="Delete Comment?"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Keep Comment"
        onConfirm={handleConfirmDeleteComment}
        onCancel={() => setCommentToDelete(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing[3],
    borderRadius: radius.card,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  headingText: {
    letterSpacing: 0.8,
  },
  list: {
    marginBottom: spacing[2],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    marginBottom: spacing[2],
  },
  composerWrapper: {
    borderTopWidth: 1,
    paddingTop: spacing[3],
  },
  composerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  textareaContainer: {
    width: '100%',
  },
  textarea: {
    marginBottom: spacing[2],
  },
  composerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
});

export default CommentSection;
