import type { CSSProperties, FC } from 'react';
import { Avatar } from '../avatar/Avatar';
import type { User } from '@jira-clone/shared';
import styles from './PublisherInfo.module.css';

export type PublisherInfoSize = 'sm' | 'md' | 'lg';
export type PublisherInfoVariant = 'default' | 'card' | 'subtle';

export interface PublisherInfoProps {
  /** The user who created (published) the card */
  publisher: User;
  /** ISO-8601 creation timestamp, rendered as a relative/compact date */
  createdAt?: string;
  /** Attribution label prefix (default: 'Created by') */
  label?: string;
  /** Show the attribution label prefix */
  showLabel?: boolean;
  /** Size tier: sm = compact, md = standard, lg = prominent */
  size?: PublisherInfoSize;
  /** Visual presentation variant: default (transparent), card (bordered container), subtle (pill) */
  variant?: PublisherInfoVariant;
  /** Whether to show a subtle border around the avatar */
  borderedAvatar?: boolean;
  /** Whether to show the clock icon next to the timestamp */
  showTimestampIcon?: boolean;
  /** Optional click handler */
  onClick?: () => void;
  /** Custom container class */
  className?: string;
  /** Container style override */
  style?: CSSProperties;
}

const DEFAULT_LABEL = 'Created by';

/** Renders a compact, human-readable date or relative time from an ISO timestamp. */
function formatTimestamp(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown date';

  const now = new Date();
  const deltaMs = now.getTime() - date.getTime();
  const minutes = Math.floor(deltaMs / 60_000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;

  try {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Unknown date';
  }
}

/** Formats a full tooltip date string. */
function formatFullDate(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

const ClockIcon: FC<{ size?: number }> = ({ size = 12 }) => (
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
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const PublisherInfo: FC<PublisherInfoProps> = ({
  publisher,
  createdAt,
  label = DEFAULT_LABEL,
  showLabel = true,
  size = 'md',
  variant = 'default',
  borderedAvatar = true,
  showTimestampIcon = true,
  onClick,
  className,
  style,
}) => {
  const avatarSize = size === 'lg' ? 'md' : size === 'sm' ? 'xs' : 'sm';
  const timeIconSize = size === 'sm' ? 11 : size === 'lg' ? 13 : 12;
  const relativeDate = formatTimestamp(createdAt);
  const fullDate = formatFullDate(createdAt);

  const variantClass =
    variant === 'card'
      ? styles.variantCard
      : variant === 'subtle'
      ? styles.variantSubtle
      : styles.variantDefault;

  const sizeClass =
    size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;

  const containerClasses = [
    styles.container,
    variantClass,
    sizeClass,
    onClick ? styles.clickable : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={containerClasses}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.avatarWrapper}>
        <Avatar
          name={publisher?.name || 'Unknown'}
          imageUrl={publisher?.avatarUrl}
          size={avatarSize}
          bordered={borderedAvatar}
        />
      </div>

      <div className={styles.content}>
        {showLabel && <div className={styles.headerLabel}>{label}</div>}

        <div className={styles.userRow}>
          <span className={styles.userName} title={publisher?.name}>
            {publisher?.name || 'Unknown'}
          </span>
        </div>

        {relativeDate && (
          <div className={styles.metaRow} title={fullDate}>
            {showTimestampIcon && (
              <span className={styles.clockIcon}>
                <ClockIcon size={timeIconSize} />
              </span>
            )}
            <span>{relativeDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublisherInfo;