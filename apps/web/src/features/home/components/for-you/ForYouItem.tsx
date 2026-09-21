import type { CSSProperties, FC } from 'react';
import type { Card, BoardColumn, Project, User } from '@jira-clone/shared';
import { Badge } from '../../../../components/base';
import { PriorityBadge } from '../../../../components/shared/priority-badge';
import { StatusBar } from '../../../../components/shared/status-bar';
import { Avatar } from '../../../../components/shared/avatar';
import styles from './ForYouItem.module.css';

export interface ForYouItemProps {
  card: Card;
  project?: Project;
  statusColumn?: BoardColumn;
  assignee?: User | null;
  starred?: boolean;
  onToggleStar?: () => void;
  onPress?: () => void;
  style?: CSSProperties;
  className?: string;
}

export const ForYouItem: FC<ForYouItemProps> = ({
  card,
  project,
  statusColumn,
  assignee,
  starred = false,
  onToggleStar,
  onPress,
  style,
  className = '',
}) => {
  const isOverdue = (() => {
    if (!card.dueDate) return false;
    try {
      const d = new Date(card.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !isNaN(d.getTime()) && d < today;
    } catch {
      return false;
    }
  })();

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const defaultStatus: BoardColumn = statusColumn ?? {
    id: card.columnId,
    projectId: card.projectId,
    title: card.columnId.includes('done')
      ? 'Done'
      : card.columnId.includes('progress')
        ? 'In Progress'
        : 'To Do',
    order: 0,
  };

  return (
    <div
      className={`${styles.row} ${className}`}
      style={style}
      onClick={onPress}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPress?.();
        }
      }}
    >
      {/* Left side: Star, Key, Type, Title, Project */}
      <div className={styles.leftGroup}>
        <button
          type="button"
          className={`${styles.starBtn} ${starred ? styles.starActive : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar?.();
          }}
          title={starred ? 'Unstar issue' : 'Star issue'}
          aria-label={starred ? 'Unstar issue' : 'Star issue'}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={starred ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>

        <div className={styles.keyArea}>
          <Badge label={card.key} variant="mono" size="sm" />
        </div>

        <div className={styles.titleInfo}>
          <span className={styles.cardTitle} title={card.title}>
            {card.title}
          </span>
          {project && (
            <span className={styles.projectName} title={project.name}>
              {project.name}
            </span>
          )}
        </div>
      </div>

      {/* Right side: Status, Priority, Due Date, Assignee */}
      <div className={styles.rightGroup}>
        <div className={styles.statusWrap}>
          <StatusBar status={defaultStatus} size="sm" />
        </div>

        <div className={styles.priorityWrap}>
          <PriorityBadge priority={card.priority} size="sm" showLabel={false} />
        </div>

        {card.dueDate && (
          <span
            className={`${styles.dueBadge} ${isOverdue ? styles.dueOverdue : ''}`}
            title={isOverdue ? 'Overdue' : 'Due date'}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {formatDueDate(card.dueDate)}
          </span>
        )}

        <div className={styles.avatarWrap} title={assignee ? assignee.name : 'Unassigned'}>
          {assignee ? (
            <Avatar name={assignee.name} imageUrl={assignee.avatarUrl} size="xs" />
          ) : (
            <div className={styles.unassignedAvatar}>?</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForYouItem;
