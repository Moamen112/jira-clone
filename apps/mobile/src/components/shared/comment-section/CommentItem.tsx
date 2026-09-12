import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Comment, User } from '@jira-clone/shared';
import { TrashIcon } from '../../../../assets/icon';
import { Text } from '../../base/typography/Text';
import { Avatar } from '../../base/avatar/Avatar';
import { IconButton } from '../../base/icon-button/IconButton';
import { useTheme } from '../../../tokens';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';

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
  style?: ViewStyle;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  author,
  canDelete = false,
  onDelete,
  style,
}) => {
  const { colors } = useTheme();
  const authorName = author?.name || 'Team Member';

  const formattedTime = new Date(comment.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.container, style]}>
      {/* Author Avatar */}
      <Avatar
        name={authorName}
        imageUrl={author?.avatarUrl}
        size="sm"
      />

      {/* Comment Body */}
      <View style={[styles.bubble, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        {/* Header: Author Name, Timestamp & Actions */}
        <View style={styles.bubbleHeader}>
          <View style={styles.authorMeta}>
            <Text variant="bodySmall" bold style={[styles.authorName, { color: colors.ink }]}>
              {authorName}
            </Text>
            <Text variant="caption" muted style={styles.timestamp}>
              {formattedTime}
            </Text>
          </View>

          {canDelete && onDelete && (
            <IconButton
              variant="ghost"
              size="sm"
              icon={
                <TrashIcon
                  size={14}
                  color={colors.inkMuted}
                />
              }
              accessibilityLabel="Delete comment"
              onPress={() => onDelete(comment.id)}
            />
          )}
        </View>

        {/* Text Content */}
        <Text variant="bodySmall" style={[styles.content, { color: colors.ink }]}>
          {comment.content}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  bubble: {
    flex: 1,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing[3],
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  authorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  authorName: {},
  timestamp: {
    fontSize: 11,
  },
  content: {
    lineHeight: 20,
  },
});

export default CommentItem;
