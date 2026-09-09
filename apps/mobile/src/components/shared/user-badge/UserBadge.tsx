import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Text, Avatar } from '../../base';
import { colors } from '../../../tokens/colors';
import { spacing } from '../../../tokens/spacing';
import { User } from '@jira-clone/shared';

export type UserBadgeSize = 'sm' | 'md' | 'lg';

export interface UserBadgeProps {
  /** User to display */
  user: User;
  /** Size tier: sm = compact, md = standard, lg = prominent */
  size?: UserBadgeSize;
  /** Show the user's email as a subtitle */
  showEmail?: boolean;
  /** Custom subtitle text (overrides email) */
  subtitle?: string;
  /** Fired when the badge is pressed */
  onPress?: () => void;
  /** Container style override */
  style?: ViewStyle;
}

const AVATAR_SIZE_BY_SIZE: Record<UserBadgeSize, 'xs' | 'sm' | 'md'> = {
  sm: 'xs',
  md: 'sm',
  lg: 'md',
};

export const UserBadge: React.FC<UserBadgeProps> = ({
  user,
  size = 'md',
  showEmail = false,
  subtitle,
  onPress,
  style,
}) => {
  const avatarSize = AVATAR_SIZE_BY_SIZE[size];
  const nameVariant = size === 'lg' ? 'body' : 'bodySmall';
  const subVariant = size === 'lg' ? 'bodySmall' : 'caption';
  const resolvedSubtitle = subtitle ?? (showEmail ? user.email : undefined);

  const inner = (
    <View style={styles.inner}>
      <Avatar name={user.name} imageUrl={user.avatarUrl} size={avatarSize} />
      <View style={styles.textArea}>
        <Text variant={nameVariant} bold numberOfLines={1}>
          {user.name}
        </Text>
        {resolvedSubtitle && (
          <Text variant={subVariant} muted numberOfLines={1} style={styles.subtitle}>
            {resolvedSubtitle}
          </Text>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          styles.containerBase,
          pressed && styles.containerPressed,
          style,
        ]}
      >
        {inner}
      </Pressable>
    );
  }

  return <View style={[styles.container, styles.containerBase, style]}>{inner}</View>;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  containerBase: {
    flexDirection: 'row',
    gap: spacing[2],
    alignSelf: 'flex-start',
  },
  containerPressed: {
    backgroundColor: colors.light.accentSoft,
    borderRadius: 6,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  textArea: {
    flex: 1,
  },
  subtitle: {
    marginTop: 1,
  },
});

export default UserBadge;