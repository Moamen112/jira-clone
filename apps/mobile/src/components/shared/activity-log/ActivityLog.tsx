import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ActivityLog as ActivityLogType, User } from '@jira-clone/shared';
import { Text } from '../../base/typography/Text';
import { ActivityLogItem } from './ActivityLogItem';
import { useTheme } from '../../../tokens';
import { spacing } from '../../../tokens/spacing';

export interface ActivityLogProps {
  /** Array of activity log events */
  logs: ActivityLogType[];
  /** Available workspace members to resolve actor profile */
  users?: User[];
  /** Optional filter for a specific card */
  cardId?: string;
  /** Optional header title (default: 'ACTIVITY') */
  title?: string;
  /** Maximum number of items to display */
  maxItems?: number;
  /** Custom container style */
  style?: ViewStyle;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({
  logs,
  users = [],
  cardId,
  title = 'ACTIVITY',
  maxItems,
  style,
}) => {
  const { colors } = useTheme();

  // Filter by cardId if specified
  const filteredLogs = cardId
    ? logs.filter((log) => log.cardId === cardId)
    : logs;

  // Sort descending (newest first)
  const sortedLogs = [...filteredLogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const displayedLogs = maxItems ? sortedLogs.slice(0, maxItems) : sortedLogs;

  const getUser = (userId: string) => users.find((u) => u.id === userId) || null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.line }, style]}>
      {title ? (
        <Text variant="sectionLabel" muted style={styles.title}>
          {title} ({displayedLogs.length})
        </Text>
      ) : null}

      {displayedLogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="bodySmall" muted style={{ fontStyle: 'italic' }}>
            No activity recorded yet.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {displayedLogs.map((log, index) => {
            const isLast = index === displayedLogs.length - 1;
            const actor = getUser(log.actorId);

            return (
              <ActivityLogItem
                key={log.id}
                log={log}
                actor={actor}
                isLast={isLast}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing[3],
    borderRadius: spacing[2],
    borderWidth: 1,
  },
  title: {
    letterSpacing: 0.8,
    marginBottom: spacing[3],
  },
  list: {
    marginTop: spacing[1],
  },
  emptyContainer: {
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ActivityLog;
