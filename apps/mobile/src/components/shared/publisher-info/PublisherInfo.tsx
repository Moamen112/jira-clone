import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Text, Avatar } from '../../base';
import { TimeIcon } from '../../../../assets/icon';
import { useTheme, spacing, radius } from '../../../tokens';
import { User } from '@jira-clone/shared';

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
  /** Optional press handler */
  onPress?: () => void;
  /** Container style override */
  style?: StyleProp<ViewStyle>;
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

export const PublisherInfo: React.FC<PublisherInfoProps> = ({
  publisher,
  createdAt,
  label = DEFAULT_LABEL,
  showLabel = true,
  size = 'md',
  variant = 'default',
  borderedAvatar = true,
  showTimestampIcon = true,
  onPress,
  style,
}) => {
  const { colors, isDark } = useTheme();

  // Avatar sizing: xs (20px) for sm, sm (28px) for md, md (36px) for lg
  const avatarSize = size === 'lg' ? 'md' : size === 'sm' ? 'xs' : 'sm';

  // Layout spacing values
  const gap = size === 'sm' ? spacing[2] : size === 'lg' ? spacing[3] : 10;
  const timeIconSize = size === 'sm' ? 11 : 12;

  const formattedDate = formatTimestamp(createdAt);

  const containerVariantStyle: ViewStyle = {
    gap,
    ...(variant === 'card'
      ? {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.line,
          borderRadius: radius.card,
          paddingHorizontal: spacing[3],
          paddingVertical: size === 'sm' ? spacing[2] : spacing[3],
        }
      : variant === 'subtle'
      ? {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.line,
          borderRadius: radius.pill,
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[1] + 2,
        }
      : {}),
  };

  const content = (
    <>
      <Avatar
        name={publisher?.name || 'Unknown'}
        imageUrl={publisher?.avatarUrl}
        size={avatarSize}
        bordered={borderedAvatar}
        borderColor={isDark ? colors.line : '#EAE8E3'}
      />

      <View style={styles.textArea}>
        <Text
          variant={size === 'lg' ? 'body' : 'bodySmall'}
          numberOfLines={1}
          style={styles.authorLine}
        >
          {showLabel && (
            <Text
              variant={
                size === 'lg'
                  ? 'bodySmall'
                  : size === 'sm'
                  ? 'caption'
                  : 'bodySmall'
              }
              muted
              style={styles.labelPrefix}
            >
              {label}{' '}
            </Text>
          )}
          <Text
            variant={size === 'lg' ? 'body' : 'bodySmall'}
            bold
            style={{ color: colors.ink }}
          >
            {publisher?.name || 'Unknown'}
          </Text>
        </Text>

        {formattedDate ? (
          <View
            style={[
              styles.metaRow,
              { marginTop: size === 'sm' ? 1 : size === 'lg' ? 3 : 2 },
            ]}
          >
            {showTimestampIcon && (
              <TimeIcon
                size={timeIconSize}
                color={colors.inkMuted}
                style={styles.timeIcon}
              />
            )}
            <Text
              variant="caption"
              muted
              numberOfLines={1}
              style={[styles.timestampText, { color: colors.inkMuted }]}
            >
              {formattedDate}
            </Text>
          </View>
        ) : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label} ${publisher?.name || 'Unknown'}`}
        style={({ pressed }) => [
          styles.container,
          containerVariantStyle,
          pressed && styles.pressed,
          style,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, containerVariantStyle, style]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textArea: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  authorLine: {
    lineHeight: 18,
  },
  labelPrefix: {
    fontWeight: '400',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeIcon: {
    marginRight: 1,
  },
  timestampText: {
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.75,
  },
});

export default PublisherInfo;