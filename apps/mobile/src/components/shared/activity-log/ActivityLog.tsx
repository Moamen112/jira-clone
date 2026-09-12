import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { ActivityLog as ActivityLogType, User } from '@jira-clone/shared';
import { Text } from '../../base/typography/Text';
import { ActivityLogItem } from './ActivityLogItem';
import { useTheme } from '../../../tokens';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';

export type ActivityLogFilter = 'all' | 'history' | 'working';

export interface ActivityLogFilterOption {
  label: string;
  value: ActivityLogFilter;
}

export const ACTIVITY_LOG_FILTERS: ActivityLogFilterOption[] = [
  { label: 'All', value: 'all' },
  { label: 'History', value: 'history' },
  { label: 'Working', value: 'working' },
];

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
  /** Controlled active filter */
  filter?: ActivityLogFilter;
  /** Default filter if uncontrolled (default: 'all') */
  defaultFilter?: ActivityLogFilter;
  /** Callback fired when filter tab changes */
  onFilterChange?: (filter: ActivityLogFilter) => void;
  /** Whether to show the filter pills (default: true) */
  showFilters?: boolean;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({
  logs,
  users = [],
  cardId,
  title = 'ACTIVITY',
  maxItems,
  style,
  filter,
  defaultFilter = 'all',
  onFilterChange,
  showFilters = true,
}) => {
  const { colors } = useTheme();

  const [internalFilter, setInternalFilter] = useState<ActivityLogFilter>(defaultFilter);
  const activeFilter = filter !== undefined ? filter : internalFilter;

  const handleFilterSelect = (newFilter: ActivityLogFilter) => {
    setInternalFilter(newFilter);
    onFilterChange?.(newFilter);
  };

  // 1. Filter by cardId if specified
  const cardLogs = useMemo(() => {
    return cardId ? logs.filter((log) => log.cardId === cardId) : logs;
  }, [logs, cardId]);

  // 2. Count for each filter option
  const counts = useMemo(() => {
    const historyCount = cardLogs.filter((log) =>
      ['CARD_CREATED', 'STATUS_CHANGED', 'ASSIGNEE_CHANGED', 'TITLE_UPDATED', 'DESCRIPTION_UPDATED'].includes(
        log.action
      )
    ).length;

    const workingCount = cardLogs.filter(
      (log) =>
        ['STATUS_CHANGED', 'WORK_LOGGED', 'COMMENT_ADDED'].includes(log.action) ||
        (log.details &&
          (log.details.message?.toLowerCase().includes('work') ||
            log.details.to?.toLowerCase().includes('progress')))
    ).length;

    return {
      all: cardLogs.length,
      history: historyCount,
      working: workingCount,
    };
  }, [cardLogs]);

  // 3. Filter by active category
  const filteredLogs = useMemo(() => {
    if (activeFilter === 'history') {
      return cardLogs.filter((log) =>
        ['CARD_CREATED', 'STATUS_CHANGED', 'ASSIGNEE_CHANGED', 'TITLE_UPDATED', 'DESCRIPTION_UPDATED'].includes(
          log.action
        )
      );
    }
    if (activeFilter === 'working') {
      return cardLogs.filter(
        (log) =>
          ['STATUS_CHANGED', 'WORK_LOGGED', 'COMMENT_ADDED'].includes(log.action) ||
          (log.details &&
            (log.details.message?.toLowerCase().includes('work') ||
              log.details.to?.toLowerCase().includes('progress')))
      );
    }
    return cardLogs;
  }, [cardLogs, activeFilter]);

  // 4. Sort descending (newest first)
  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredLogs]);

  const displayedLogs = maxItems ? sortedLogs.slice(0, maxItems) : sortedLogs;

  const getUser = (userId: string) => users.find((u) => u.id === userId) || null;

  const emptyMessage = useMemo(() => {
    switch (activeFilter) {
      case 'history':
        return 'No history changes recorded yet.';
      case 'working':
        return 'No work logs or status transitions recorded yet.';
      default:
        return 'No activity recorded yet.';
    }
  }, [activeFilter]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.line }, style]}>
      {title ? (
        <Text variant="sectionLabel" muted style={styles.title}>
          {title} ({displayedLogs.length})
        </Text>
      ) : null}

      {/* Filter Tabs / Pills */}
      {showFilters && (
        <View style={styles.filterRow}>
          {ACTIVITY_LOG_FILTERS.map((f) => {
            const isSelected = f.value === activeFilter;
            const count = counts[f.value];
            return (
              <Pressable
                key={f.value}
                onPress={() => handleFilterSelect(f.value)}
                accessibilityRole="button"
                accessibilityLabel={`Filter activity logs by ${f.label}`}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.line,
                  },
                ]}
              >
                <Text
                  variant="caption"
                  bold={isSelected}
                  style={{
                    color: isSelected ? colors.paper : colors.ink,
                  }}
                >
                  {f.label}
                </Text>
                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor: isSelected
                        ? 'rgba(255, 255, 255, 0.25)'
                        : colors.line,
                    },
                  ]}
                >
                  <Text
                    variant="caption"
                    style={[
                      styles.countText,
                      { color: isSelected ? colors.paper : colors.inkMuted },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {displayedLogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="bodySmall" muted style={{ fontStyle: 'italic' }}>
            {emptyMessage}
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
    borderRadius: radius.card,
    borderWidth: 1,
  },
  title: {
    letterSpacing: 0.8,
    marginBottom: spacing[2],
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[3],
    marginTop: spacing[1],
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 1,
    borderRadius: radius.pill,
    borderWidth: 1,
    gap: 6,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 10,
    fontWeight: '600',
  },
  list: {
    marginTop: spacing[1],
  },
  emptyContainer: {
    paddingVertical: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ActivityLog;
