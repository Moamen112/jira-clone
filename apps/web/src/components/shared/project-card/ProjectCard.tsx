import type { CSSProperties, FC } from 'react';
import { Badge } from '../../base';
import { AvatarGroup } from '../avatar-group/AvatarGroup';
import type { AvatarGroupUser } from '../avatar-group/AvatarGroup';
import type { Project } from '@jira-clone/shared';
import styles from './ProjectCard.module.css';

export interface ProjectIssueCounts {
  /** Number of cards in the To Do column */
  todo: number;
  /** Number of cards in the In Progress column */
  inProgress: number;
  /** Number of cards in the Done column */
  done: number;
}

export interface ProjectCardProps {
  /** Project to display */
  project: Project;
  /** Team members shown as overlapping avatars */
  members?: AvatarGroupUser[];
  /** Issue counts displayed as todo / active / done specs */
  issueCounts?: ProjectIssueCounts;
  /** Space or project category tag (e.g. "Software", "Business") */
  category?: string;
  /** Fired when the card is pressed */
  onPress?: () => void;
  /** Container style override */
  style?: CSSProperties;
  /** Custom class name */
  className?: string;
  /** Test identifier */
  testID?: string;
}

export const ProjectCard: FC<ProjectCardProps> = ({
  project,
  members,
  issueCounts,
  category,
  onPress,
  style,
  className = '',
  testID,
}) => {
  const total =
    (issueCounts?.done ?? 0) +
    (issueCounts?.inProgress ?? 0) +
    (issueCounts?.todo ?? 0);

  const percentDone = total > 0 ? Math.round(((issueCounts?.done ?? 0) / total) * 100) : 0;
  const percentActive = total > 0 ? Math.round(((issueCounts?.inProgress ?? 0) / total) * 100) : 0;
  const percentTodo = Math.max(0, 100 - percentDone - percentActive);

  const cardClasses = `${styles.card} ${onPress ? styles.cardClickable : ''} ${className}`;

  const content = (
    <>
      {/* Top Header Row: Icon + Name/Key + Avatars */}
      <div className={styles.headerRow}>
        <div className={styles.identityArea}>
          {/* Project Key Monogram Icon */}
          <div className={styles.iconBadge} aria-hidden="true">
            {project.key.slice(0, 3)}
          </div>

          {/* Project Titles */}
          <div className={styles.titles}>
            <div className={styles.nameRow}>
              <h3 className={styles.projectName} title={project.name}>
                {project.name}
              </h3>
              <Badge label={project.key} variant="mono" size="sm" />
              {category && (
                <span className={styles.categoryTag}>· {category}</span>
              )}
            </div>

            {project.description ? (
              <p className={styles.description} title={project.description}>
                {project.description}
              </p>
            ) : (
              <p className={styles.description}>Software project workspace</p>
            )}
          </div>
        </div>

        {/* Compact Team Member Avatars */}
        {members && members.length > 0 && (
          <AvatarGroup users={members} max={2} size="xs" />
        )}
      </div>

      {/* Progress & Specifications Section */}
      {issueCounts && total > 0 && (
        <div className={styles.progressSection}>
          {/* Segmented Progress Bar */}
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-valuenow={percentDone}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${percentDone}% issues completed`}
          >
            <div
              className={styles.progressSegmentDone}
              style={{ width: `${percentDone}%` }}
              title={`Done: ${issueCounts.done}`}
            />
            <div
              className={styles.progressSegmentActive}
              style={{ width: `${percentActive}%` }}
              title={`In Progress: ${issueCounts.inProgress}`}
            />
            <div
              className={styles.progressSegmentTodo}
              style={{ width: `${percentTodo}%` }}
              title={`To Do: ${issueCounts.todo}`}
            />
          </div>

          {/* Specifications Meta Row */}
          <div className={styles.metaRow}>
            <div className={styles.statsLeft}>
              <span className={styles.statItem} title={`${issueCounts.done} Done`}>
                <span className={`${styles.statDot} ${styles.statDotDone}`} />
                {issueCounts.done} done
              </span>
              <span>·</span>
              <span className={styles.statItem} title={`${issueCounts.inProgress} In Progress`}>
                <span className={`${styles.statDot} ${styles.statDotActive}`} />
                {issueCounts.inProgress} active
              </span>
              <span>·</span>
              <span className={styles.statItem} title={`${issueCounts.todo} To Do`}>
                <span className={`${styles.statDot} ${styles.statDotTodo}`} />
                {issueCounts.todo} to do
              </span>
            </div>

            <span className={styles.completionRate}>
              {percentDone}%
            </span>
          </div>
        </div>
      )}
    </>
  );

  if (onPress) {
    return (
      <button
        type="button"
        data-testid={testID}
        onClick={onPress}
        className={cardClasses}
        style={style}
      >
        {content}
      </button>
    );
  }

  return (
    <div data-testid={testID} className={cardClasses} style={style}>
      {content}
    </div>
  );
};

export default ProjectCard;