import type { CSSProperties, FC } from 'react';
import type { ActivityLog, User } from '@jira-clone/shared';
import { Text, Badge } from '../../base';
import { Avatar } from '../avatar';

export interface ActivityLogItemProps {
  /** The activity log record */
  log: ActivityLog;
  /** The actor user who performed the action */
  actor?: User | null;
  /** Whether this is the final item in the timeline (hides bottom connector) */
  isLast?: boolean;
  /** Custom container style */
  style?: CSSProperties;
  /** Custom CSS class */
  className?: string;
}

const ArrowForwardIcon: FC<{ size?: number }> = ({ size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ClockIcon: FC<{ size?: number }> = ({ size = 13 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const ActivityLogItem: FC<ActivityLogItemProps> = ({
  log,
  actor,
  isLast = false,
  style,
  className,
}) => {
  const actorName = actor?.name || 'Unknown user';

  const formattedDate = new Date(log.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getActionDescription = () => {
    switch (log.action) {
      case 'CARD_CREATED':
        return 'created this card';
      case 'STATUS_CHANGED':
        return 'changed status';
      case 'ASSIGNEE_CHANGED':
        return log.details?.to ? 'updated assignment' : 'removed assignment';
      case 'TITLE_UPDATED':
        return 'renamed this card';
      case 'DESCRIPTION_UPDATED':
        return 'updated the description';
      case 'COMMENT_ADDED':
        return 'commented';
      case 'WORK_LOGGED':
        return 'logged work';
      default:
        return 'updated this card';
    }
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        position: 'relative',
        ...style,
      }}
    >
      {/* Left Timeline Column */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginRight: 12,
          width: 24,
          flexShrink: 0,
        }}
      >
        <Avatar name={actorName} imageUrl={actor?.avatarUrl} size="xs" />
        {!isLast && (
          <div
            style={{
              width: 2,
              minHeight: 28,
              backgroundColor: 'var(--color-line)',
              margin: '4px 0',
              flex: 1,
              borderRadius: 1,
            }}
          />
        )}
      </div>

      {/* Event Details */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          paddingBottom: isLast ? 4 : 16,
        }}
      >
        {/* Header Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ lineHeight: '1.4' }}>
            <Text variant="bodySmall" bold color="var(--color-ink)">
              {actorName}
            </Text>{' '}
            <Text variant="bodySmall" muted>
              {getActionDescription()}
            </Text>
          </div>

          <Text variant="caption" muted style={{ fontSize: 11, flexShrink: 0 }}>
            {formattedDate}
          </Text>
        </div>

        {/* Transition Details / Badges */}
        {log.action === 'STATUS_CHANGED' && log.details?.from && log.details?.to && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 6,
              flexWrap: 'wrap',
            }}
          >
            <Badge label={log.details.from} variant="neutral" size="sm" />
            <span style={{ color: 'var(--color-ink-muted)', display: 'inline-flex' }}>
              <ArrowForwardIcon size={12} />
            </span>
            <Badge label={log.details.to} variant="accent" size="sm" />
          </div>
        )}

        {log.action === 'ASSIGNEE_CHANGED' && log.details?.to && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 6,
              flexWrap: 'wrap',
            }}
          >
            <Text variant="caption" muted>
              Assigned to:
            </Text>
            <Badge label={log.details.to} variant="neutral" size="sm" />
          </div>
        )}

        {log.action === 'CARD_CREATED' && log.details?.to && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 6,
              flexWrap: 'wrap',
            }}
          >
            <Text variant="caption" muted>
              Initial column:
            </Text>
            <Badge label={log.details.to} variant="accent" size="sm" />
          </div>
        )}

        {log.action === 'WORK_LOGGED' && log.details?.message && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 6,
              color: 'var(--color-accent)',
            }}
          >
            <ClockIcon size={13} />
            <Text variant="caption" muted>
              {log.details.message}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogItem;
