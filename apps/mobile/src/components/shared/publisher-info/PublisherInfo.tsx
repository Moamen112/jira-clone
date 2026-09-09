import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, Avatar } from '../../base';
import { spacing } from '../../../tokens/spacing';
import { User } from '@jira-clone/shared';

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
  style?: ViewStyle;
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

export const PublisherInfo: React.FC<PublisherInfoProps> = ({
  publisher,
  createdAt,
  label = DEFAULT_LABEL,
  showLabel = true,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Avatar name={publisher.name} imageUrl={publisher.avatarUrl} size="sm" />

      <View style={styles.textArea}>
        <Text variant="bodySmall" numberOfLines={1}>
          {showLabel ? (
            <Text variant="bodySmall" muted>
              {label}{' '}
            </Text>
          ) : null}
          <Text variant="bodySmall" bold>
            {publisher.name}
          </Text>
        </Text>

        {createdAt && (
          <Text variant="monoData" muted style={styles.timestamp}>
            {formatTimestamp(createdAt)}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  textArea: {
    flex: 1,
  },
  timestamp: {
    lineHeight: 16,
  },
});

export default PublisherInfo;