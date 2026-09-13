import type { CSSProperties, FC } from 'react';
import { Text } from '../../base';
import { Avatar } from '../avatar/Avatar';
import type { User } from '@jira-clone/shared';

export interface PublisherInfoProps {
  /** The user who created (published) the card */
  publisher: User;
  /** ISO-8601 creation timestamp, rendered as a relative/compact date */
  createdAt?: string;
  /** Attribution label prefix */
  label?: string;
  /** Show the attribution label prefix */
  showLabel?: boolean;
  /** Container style override */
  style?: CSSProperties;
}

const DEFAULT_LABEL = 'Created by';

/** Renders a compact, locale-friendly date from an ISO timestamp. */
function formatTimestamp(iso: string): string {
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

export const PublisherInfo: FC<PublisherInfoProps> = ({
  publisher,
  createdAt,
  label = DEFAULT_LABEL,
  showLabel = true,
  style,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...style }}>
      <Avatar name={publisher.name} imageUrl={publisher.avatarUrl} size="sm" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <Text variant="bodySmall" numberOfLines={1}>
          {showLabel && <Text variant="bodySmall" muted>{label} </Text>}
          <Text variant="bodySmall" bold>{publisher.name}</Text>
        </Text>

        {createdAt && (
          <Text variant="monoData" muted style={{ display: 'block', lineHeight: 16 }}>
            {formatTimestamp(createdAt)}
          </Text>
        )}
      </div>
    </div>
  );
};

export default PublisherInfo;