import type { CSSProperties, FC, ReactNode } from 'react';
import { Badge, Button } from '../../base';
import type { ButtonVariant } from '../../base';
import { AvatarGroup } from '../avatar-group/AvatarGroup';
import type { AvatarGroupUser } from '../avatar-group/AvatarGroup';
import type { Project } from '@jira-clone/shared';
import styles from './ProjectHeader.module.css';

// Subtle Settings gear icon for action button
const SettingsIcon: FC<{ size?: number }> = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const PlusIcon: FC<{ size?: number }> = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export interface ProjectHeaderProps {
  /** Project to display */
  project: Project;
  /** Team members shown as overlapping avatars */
  members?: AvatarGroupUser[];
  /** Optional action button label */
  actionLabel?: string;
  /** Fired when the action button is pressed */
  onAction?: () => void;
  /** Visual variant for the action button (defaults to 'secondary') */
  actionVariant?: ButtonVariant;
  /** Optional icon to render inside the action button */
  actionIcon?: ReactNode;
  /** Fired when the Create card button is pressed */
  onCreateCard?: () => void;
  /** Custom label for the create card button (defaults to 'Create card') */
  createCardLabel?: string;
  /** Custom action slot or extra buttons */
  extraActions?: ReactNode;
  /** Custom icon or avatar element to override default monogram */
  icon?: ReactNode;
  /** Maximum number of avatars shown before truncation (default: 3) */
  maxMembers?: number;
  /** Optional space or project category tag (e.g. "Software", "Core") */
  category?: string;
  /** Additional CSS class */
  className?: string;
  /** Container style override */
  style?: CSSProperties;
}

export const ProjectHeader: FC<ProjectHeaderProps> = ({
  project,
  members,
  actionLabel,
  onAction,
  actionVariant = 'secondary',
  actionIcon,
  onCreateCard,
  createCardLabel = 'Create card',
  extraActions,
  icon,
  maxMembers = 3,
  category,
  className = '',
  style,
}) => {
  const hasAction = Boolean(actionLabel && onAction);
  const hasMembers = Boolean(members && members.length > 0);
  const showActionsSection = hasMembers || hasAction || extraActions || Boolean(onCreateCard);

  // Derive monogram (e.g. first 2-3 characters of the project key)
  const monogram = project.key
    ? project.key.length <= 4
      ? project.key
      : project.key.slice(0, 3)
    : 'PRJ';

  // Automatically supply SettingsIcon if action is settings-related and no icon provided
  const resolvedActionIcon =
    actionIcon ??
    (actionLabel && /setting/i.test(actionLabel) ? <SettingsIcon size={14} /> : undefined);

  return (
    <div className={`${styles.container} ${className}`} style={style}>
      {/* Left: Project Icon Badge + Title & Description */}
      <div className={styles.leftSection}>
        {icon ? (
          <div className={styles.iconBadge}>{icon}</div>
        ) : (
          <div className={styles.iconBadge} aria-hidden="true">
            {monogram}
          </div>
        )}

        <div className={styles.details}>
          <div className={styles.titleRow}>
            <h1 className={styles.projectName} title={project.name}>
              {project.name}
            </h1>
            <Badge label={project.key} variant="mono" size="sm" />
            {category && (
              <span className={styles.categoryTag}>· {category}</span>
            )}
          </div>

          {project.description && (
            <p className={styles.description} title={project.description}>
              {project.description}
            </p>
          )}
        </div>
      </div>

      {/* Right: Team Avatars + Action Button */}
      {showActionsSection && (
        <div className={styles.rightSection}>
          {hasMembers && (
            <div className={styles.membersWrapper}>
              <AvatarGroup users={members} max={maxMembers} size="sm" />
            </div>
          )}

          {hasMembers && (hasAction || extraActions || onCreateCard) && (
            <div className={styles.divider} aria-hidden="true" />
          )}

          <div className={styles.actionsWrapper}>
            {extraActions}
            {onCreateCard && (
              <Button
                label={createCardLabel}
                variant="primary"
                size="sm"
                leftIcon={<PlusIcon size={14} />}
                onPress={onCreateCard}
              />
            )}
            {hasAction && (
              <Button
                label={actionLabel}
                variant={actionVariant}
                size="sm"
                leftIcon={resolvedActionIcon}
                onPress={onAction}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectHeader;