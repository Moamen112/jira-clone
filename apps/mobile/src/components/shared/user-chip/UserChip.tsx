import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Text, Badge, Avatar, AvatarSize } from '../../base';
import { colors } from '../../../tokens/colors';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';
import { User } from '@jira-clone/shared';

export type UserChipVariant = 'default' | 'accent';
export type UserChipSize = 'sm' | 'md';

export interface UserChipProps {
  /** User to display */
  user: User;
  /** Visual variant */
  variant?: UserChipVariant;
  /** Size tier */
  size?: UserChipSize;
  /** Show a remove (×) affordance */
  removable?: boolean;
  /** Fired when the remove affordance is pressed */
  onRemove?: () => void;
  /** Fired when the chip itself is pressed */
  onPress?: () => void;
  /** Container style override */
  style?: ViewStyle;
}

const AVATAR_SIZE_BY_SIZE: Record<UserChipSize, AvatarSize> = {
  sm: 'xs',
  md: 'sm',
};

export const UserChip: React.FC<UserChipProps> = ({
  user,
  variant = 'default',
  size = 'md',
  removable = false,
  onRemove,
  onPress,
  style,
}) => {
  const avatarSize = AVATAR_SIZE_BY_SIZE[size];
  const removeAffordance = removable && onRemove ? (
    <Pressable
      onPress={onRemove}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`Remove ${user.name}`}
      style={({ pressed }) => [
        styles.removeButton,
        pressed && styles.removeButtonPressed,
      ]}
    >
      <Text
        variant="caption"
        bold
        color={colors.light.inkMuted}
        style={styles.removeGlyph}
      >
        ×
      </Text>
    </Pressable>
  ) : null;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={user.name}
        style={({ pressed }) => [
          styles.chipBase,
          variant === 'accent' ? styles.chipAccent : styles.chipDefault,
          pressed && styles.chipPressed,
          style,
        ]}
      >
        <View style={styles.chipContent}>
          <Avatar name={user.name} imageUrl={user.avatarUrl} size={avatarSize} />
          <Text
            variant={size === 'sm' ? 'caption' : 'bodySmall'}
            bold
            numberOfLines={1}
            color={variant === 'accent' ? colors.light.accent : colors.light.ink}
          >
            {user.name}
          </Text>
          {removeAffordance}
        </View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.chipBase, variant === 'accent' ? styles.chipAccent : styles.chipDefault, style]}>
      <View style={styles.chipContent}>
        <Avatar name={user.name} imageUrl={user.avatarUrl} size={avatarSize} />
        <Text
          variant={size === 'sm' ? 'caption' : 'bodySmall'}
          bold
          numberOfLines={1}
          color={variant === 'accent' ? colors.light.accent : colors.light.ink}
        >
          {user.name}
        </Text>
        {removeAffordance}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chipBase: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: spacing[1] + 2,
    paddingHorizontal: spacing[2],
    borderRadius: radius.pill,
  },
  chipDefault: {
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.line,
  },
  chipAccent: {
    backgroundColor: colors.light.accentSoft,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1] + 2,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonPressed: {
    backgroundColor: colors.light.warnSoft,
  },
  removeGlyph: {
    lineHeight: 16,
  },
});

export default UserChip;