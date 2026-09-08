import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../../tokens/colors';
import { radius } from '../../../tokens/radius';
import { Avatar, AvatarSize } from '../avatar/Avatar';
import { Text } from '../typography/Text';

export interface AvatarGroupUser {
  id?: string;
  name: string;
  avatarUrl?: string;
}

export interface AvatarGroupProps {
  /** Array of users to display */
  users: AvatarGroupUser[];
  /** Maximum number of avatars shown before truncation */
  max?: number;
  /** Size tier for avatars */
  size?: AvatarSize;
  /** Background color for borders */
  borderColor?: string;
  /** Container style */
  style?: ViewStyle;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users = [],
  max = 3,
  size = 'sm',
  borderColor = colors.light.paper,
  style,
}) => {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  const getDimension = (): number => {
    switch (size) {
      case 'xs':
        return 20;
      case 'sm':
        return 28;
      case 'lg':
        return 44;
      case 'xl':
        return 56;
      case 'md':
      default:
        return 36;
    }
  };

  const dim = getDimension();
  const overlap = Math.round(dim * 0.28);

  return (
    <View style={[styles.container, style]}>
      {visibleUsers.map((user, index) => (
        <View
          key={user.id || `${user.name}-${index}`}
          style={[
            styles.avatarWrapper,
            {
              marginLeft: index === 0 ? 0 : -overlap,
              zIndex: visibleUsers.length - index,
            },
          ]}
        >
          <Avatar
            name={user.name}
            imageUrl={user.avatarUrl}
            size={size}
            bordered
            borderColor={borderColor}
          />
        </View>
      ))}

      {remainingCount > 0 && (
        <View
          style={[
            styles.remainingBadge,
            {
              width: dim,
              height: dim,
              borderRadius: radius.pill,
              marginLeft: -overlap,
              borderColor,
              zIndex: 0,
            },
          ]}
        >
          <Text
            variant="caption"
            color={colors.light.ink}
            bold
            style={{ fontSize: Math.max(9, Math.floor(dim * 0.35)) }}
          >
            +{remainingCount}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {},
  remainingBadge: {
    backgroundColor: colors.light.surface,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AvatarGroup;

