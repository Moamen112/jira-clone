import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { Text } from '../../base';
import { ActivityLogItem } from './ActivityLogItem';
import { ACTIVITY_LOG_FILTERS } from './types';
import type { ActivityLogProps, ActivityLogFilter } from './types';

export const ActivityLog: FC<ActivityLogProps> = ({
  logs,
  users = [],
  cardId,
  title = 'ACTIVITY',
  maxItems,
  style,
  className,
  filter,
  defaultFilter = 'all',
  onFilterChange,
  showFilters = true,
  bordered = true,
  testID,
}) => {
  const [internalFilter, setInternalFilter] = useState<ActivityLogFilter>(defaultFilter);
  const activeFilter = filter !== undefined ? filter : internalFilter;

  const handleFilterSelect = (newFilter: ActivityLogFilter) => {
    if (filter === undefined) {
      setInternalFilter(newFilter);
    }
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
        Boolean(
          log.details &&
            (log.details.message?.toLowerCase().includes('work') ||
              log.details.to?.toLowerCase().includes('progress'))
        )
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
          Boolean(
            log.details &&
              (log.details.message?.toLowerCase().includes('work') ||
                log.details.to?.toLowerCase().includes('progress'))
          )
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

      {/* Filter Tabs / Pills */}
      {showFilters && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 16,
            marginTop: 4,
          }}
        >
          {ACTIVITY_LOG_FILTERS.map((f) => {
            const isSelected = f.value === activeFilter;
            const count = counts[f.value];
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => handleFilterSelect(f.value)}
                aria-pressed={isSelected}
                aria-label={`Filter activity logs by ${f.label}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-pill)',
                  border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-line)'}`,
                  backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: isSelected ? '#ffffff' : 'var(--color-ink)',
                  fontSize: 12,
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease',
                }}
              >
                <span>{f.label}</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-pill)',
                    minWidth: 18,
                    fontSize: 10,
                    fontWeight: 600,
                    backgroundColor: isSelected
                      ? 'rgba(255, 255, 255, 0.25)'
                      : 'var(--color-line)',
                    color: isSelected ? '#ffffff' : 'var(--color-ink-muted)',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

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
