import type { CSSProperties, FC } from 'react';
import type { Project } from '@jira-clone/shared';
import { Badge } from '../../../../components/base';
import { AvatarGroup } from '../../../../components/shared/avatar-group';
import type { AvatarGroupUser } from '../../../../components/shared/avatar-group';
import styles from './SpaceCard.module.css';

export interface SpaceCardProps {
  project: Project;
  members?: AvatarGroupUser[];
  issueCounts?: { todo: number; inProgress: number; done: number };
  category?: string;
  onPress?: () => void;
  style?: CSSProperties;
  className?: string;
}

export const SpaceCard: FC<SpaceCardProps> = ({
  project,
  members = [],
  issueCounts,
  category,
  onPress,
  style,
  className = '',
}) => {
  const total =
    (issueCounts?.done ?? 0) +
    (issueCounts?.inProgress ?? 0) +
    (issueCounts?.todo ?? 0);

  const percentDone =
    total > 0 ? Math.round(((issueCounts?.done ?? 0) / total) * 100) : 0;
  const percentActive =
    total > 0 ? Math.round(((issueCounts?.inProgress ?? 0) / total) * 100) : 0;
  const percentTodo = Math.max(0, 100 - percentDone - percentActive);

  return (
    <div
      className={`${styles.card} ${onPress ? styles.cardClickable : ''} ${className}`}
      style={style}
      onClick={onPress}
      role={onPress ? 'button' : undefined}
      tabIndex={onPress ? 0 : undefined}
      onKeyDown={(e) => {
        if (onPress && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onPress();
        }
      }}
    >
      {/* Top Header: Icon, Titles, Key */}
      <div className={styles.topRow}>
        <div className={styles.identity}>
          <div className={styles.iconBadge} aria-hidden="true">
            {project.key.slice(0, 3)}
          </div>
          <div className={styles.nameCol}>
            <div className={styles.titleRow}>
              <span className={styles.projectName} title={project.name}>
                {project.name}
              </span>
              <Badge label={project.key} variant="mono" size="sm" />
            </div>
            {category && (
              <span className={styles.categoryLabel}>{category}</span>
            )}
          </div>
        </div>

        {members.length > 0 && (
          <AvatarGroup users={members} max={2} size="xs" />
        )}
      </div>

      {/* Progress specs */}
      {issueCounts && total > 0 ? (
        <div className={styles.progressArea}>
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-valuenow={percentDone}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${percentDone}% completed`}
          >
            <div
              className={styles.progressDone}
              style={{ width: `${percentDone}%` }}
              title={`Done: ${issueCounts.done}`}
            />
            <div
              className={styles.progressActive}
              style={{ width: `${percentActive}%` }}
              title={`In Progress: ${issueCounts.inProgress}`}
            />
            <div
              className={styles.progressTodo}
              style={{ width: `${percentTodo}%` }}
              title={`To Do: ${issueCounts.todo}`}
            />
          </div>

          <div className={styles.metaRow}>
            <span className={styles.countsText}>
              {issueCounts.done}/{total} done
            </span>
            <span className={styles.percentText}>{percentDone}%</span>
          </div>
        </div>
      ) : (
        <div className={styles.emptyMeta}>
          <span className={styles.countsText}>Ready for sprint planning</span>
        </div>
      )}
    </div>
  );
};

export default SpaceCard;
