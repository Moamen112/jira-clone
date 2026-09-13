import type { CSSProperties, FC } from 'react';
import { Text } from '../../base';
import { Avatar } from '../avatar/Avatar';
import type { AvatarSize } from '../avatar/Avatar';
import type { User } from '@jira-clone/shared';
import './UserBadge.css';

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
  style?: CSSProperties;
}

const AVATAR_SIZE_BY_SIZE: Record<UserBadgeSize, AvatarSize> = {
  sm: 'xs',
  md: 'sm',
  lg: 'md',
};

export const UserBadge: FC<UserBadgeProps> = ({
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
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Avatar name={user.name} imageUrl={user.avatarUrl} size={avatarSize} />
      <span style={{ display: 'block', minWidth: 0 }}>
        <Text variant={nameVariant} bold numberOfLines={1} style={{ display: 'block' }}>
          {user.name}
        </Text>
        {resolvedSubtitle && (
          <Text
            variant={subVariant}
            muted
            numberOfLines={1}
            style={{ display: 'block', marginTop: 1 }}
          >
            {resolvedSubtitle}
          </Text>
        )}
      </span>
    </span>
  );

  if (onPress) {
    return (
      <button
        type="button"
        onClick={onPress}
        className="jira-user-badge"
        style={{ display: 'inline-flex', ...style }}
      >
        {inner}
      </button>
    );
  }

  return (
    <span className="jira-user-badge" style={{ display: 'inline-flex', ...style }}>
      {inner}
    </span>
  );
};

export default UserBadge;