import { useMemo } from 'react';
import type { FC } from 'react';
import { Text } from '../../base';
import { ActivityLogItem } from './ActivityLogItem';
import type { ActivityLogProps } from './types';

const HISTORY_ACTIONS = [
  'CARD_CREATED',
  'STATUS_CHANGED',
  'ASSIGNEE_CHANGED',
  'TITLE_UPDATED',
  'DESCRIPTION_UPDATED',
];

export const ActivityLog: FC<ActivityLogProps> = ({
  logs,
  users = [],
  cardId,
  title = 'ACTIVITY',
  maxItems,
  style,
  className,
  filter: _filter,
  defaultFilter: _defaultFilter = 'history',
  onFilterChange: _onFilterChange,
  showFilters: _showFilters,
  bordered = true,
  testID,
}) => {
  // 1. Filter by cardId if specified
  const cardLogs = useMemo(() => {
    return cardId ? logs.filter((log) => log.cardId === cardId) : logs;
  }, [logs, cardId]);

  // 2. Filter to history changes only
  const historyLogs = useMemo(() => {
    return cardLogs.filter((log) => HISTORY_ACTIONS.includes(log.action));
  }, [cardLogs]);

  // 3. Sort descending (newest first)
  const sortedLogs = useMemo(() => {
    return [...historyLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [historyLogs]);

  const displayedLogs = maxItems ? sortedLogs.slice(0, maxItems) : sortedLogs;

  const getUser = (userId: string) => users.find((u) => u.id === userId) || null;

  const emptyMessage = 'No history changes recorded yet.';

  return (
    <div
      data-testid={testID}
      className={className}
      style={{
        ...(bordered
          ? {
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-line)',
              borderRadius: 'var(--radius-card)',
              padding: 16,
            }
          : {}),
        ...style,
      }}
    >
      {/* Title */}
      {title ? (
        <div style={{ marginBottom: 12 }}>
          <Text
            variant="sectionLabel"
            muted
            style={{
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {title} ({displayedLogs.length})
          </Text>
        </div>
      ) : null}

      {/* List or Empty State */}
      {displayedLogs.length === 0 ? (
        <div
          style={{
            padding: '24px 0',
            textAlign: 'center',
          }}
        >
          <Text variant="bodySmall" muted style={{ fontStyle: 'italic' }}>
            {emptyMessage}
          </Text>
        </div>
      ) : (
        <div style={{ marginTop: 8 }}>
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
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
