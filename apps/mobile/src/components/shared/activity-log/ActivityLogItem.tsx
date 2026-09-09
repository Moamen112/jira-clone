import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityLog, User, formatActivityMessage } from '@jira-clone/shared';
import { Text } from '../../base/typography/Text';
import { Avatar } from '../../base/avatar/Avatar';
import { Badge } from '../../base/badge/Badge';
import { useTheme } from '../../../tokens';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';

export interface ActivityLogItemProps {
  /** The activity log record */
  log: ActivityLog;
  /** The actor user who performed the action */
  actor?: User | null;
  /** Whether this is the final item in the timeline (hides bottom connector) */
  isLast?: boolean;
  /** Custom container style */
  style?: ViewStyle;
}

export const ActivityLogItem: React.FC<ActivityLogItemProps> = ({
  log,
  actor,
  isLast = false,
  style,
}) => {
  const { colors } = useTheme();
  const actorName = actor?.name || 'Unknown user';

  const formattedDate = new Date(log.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.container, style]}>
      {/* Left Timeline Column */}
      <View style={styles.timelineColumn}>
        <Avatar
          name={actorName}
          imageUrl={actor?.avatarUrl}
          size="xs"
        />
        {!isLast && <View style={[styles.timelineConnector, { backgroundColor: colors.line }]} />}
      </View>

      {/* Event Details */}
      <View style={[styles.content, isLast && styles.contentLast]}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text variant="bodySmall" style={styles.actorText}>
            <Text variant="bodySmall" bold>
              {actorName}
            </Text>{' '}
            <Text variant="bodySmall" muted>
              {log.action === 'CARD_CREATED' && 'created this card'}
              {log.action === 'STATUS_CHANGED' && 'changed status'}
              {log.action === 'ASSIGNEE_CHANGED' && 'updated assignment'}
              {log.action === 'TITLE_UPDATED' && 'renamed this card'}
              {log.action === 'DESCRIPTION_UPDATED' && 'updated the description'}
              {log.action === 'COMMENT_ADDED' && 'commented'}
            </Text>
          </Text>

          <Text variant="caption" muted style={styles.timestamp}>
            {formattedDate}
          </Text>
        </View>

        {/* Transition Details / Chips */}
        {log.action === 'STATUS_CHANGED' && log.details.from && log.details.to && (
          <View style={styles.transitionRow}>
            <Badge label={log.details.from} variant="neutral" size="sm" />
            <Ionicons
              name="arrow-forward"
              size={12}
              color={colors.inkMuted}
              style={{ marginHorizontal: 4 }}
            />
            <Badge label={log.details.to} variant="accent" size="sm" />
          </View>
        )}

        {log.action === 'ASSIGNEE_CHANGED' && log.details.to && (
          <View style={styles.transitionRow}>
            <Text variant="caption" muted>
              Assigned to:
            </Text>
            <Badge
              label={log.details.to}
              variant="neutral"
              size="sm"
              style={{ marginLeft: 6 }}
            />
          </View>
        )}

        {log.action === 'CARD_CREATED' && log.details.to && (
          <View style={styles.transitionRow}>
            <Text variant="caption" muted>
              Initial column:
            </Text>
            <Badge
              label={log.details.to}
              variant="accent"
              size="sm"
              style={{ marginLeft: 6 }}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineColumn: {
    alignItems: 'center',
    marginRight: spacing[3],
    width: 24,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    minHeight: 28,
    marginVertical: 4,
  },
  content: {
    flex: 1,
    paddingBottom: spacing[4],
  },
  contentLast: {
    paddingBottom: spacing[1],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  actorText: {
    flex: 1,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 11,
  },
  transitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
  },
});

export default ActivityLogItem;
