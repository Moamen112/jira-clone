import type { CSSProperties, FC } from 'react';
import { Text } from '../../base';
import { Avatar } from '../avatar/Avatar';
import type { AvatarSize } from '../avatar/Avatar';

export interface AvatarGroupUser {
  id?: string;
  name: string;
  avatarUrl?: string;
}

export interface AvatarGroupProps {
  /** Array of users to display */
  users?: AvatarGroupUser[];
  /** Maximum number of avatars shown before truncation */
  max?: number;
  /** Size tier for avatars */
  size?: AvatarSize;
  /** Background color for borders */
  borderColor?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

const AVATAR_DIMENSIONS: Record<AvatarSize, number> = {
  xs: 20,
  sm: 28,
  md: 36,
  lg: 44,
  xl: 56,
};

export const AvatarGroup: FC<AvatarGroupProps> = ({
  users = [],
  max = 3,
  size = 'sm',
  borderColor,
  style,
}) => {
  const dimension = AVATAR_DIMENSIONS[size] ?? 28;
  const overlap = Math.round(dimension * 0.28);
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;
  const resolvedBorderColor = borderColor ?? 'var(--color-paper)';

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', ...style }}>
      {visibleUsers.map((user, index) => (
        <span
          key={user.id || `${user.name}-${index}`}
          style={{
            marginLeft: index === 0 ? 0 : -overlap,
            zIndex: visibleUsers.length - index,
            display: 'inline-flex',
          }}
        >
          <Avatar
            name={user.name}
            imageUrl={user.avatarUrl}
            size={size}
            bordered
            borderColor={resolvedBorderColor}
          />
        </span>
      ))}

      {remainingCount > 0 && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: dimension,
            height: dimension,
            minWidth: dimension,
            minHeight: dimension,
            borderRadius: 'var(--radius-pill)',
            marginLeft: -overlap,
            backgroundColor: 'var(--color-surface)',
            border: `2px solid ${resolvedBorderColor}`,
            zIndex: 0,
            boxSizing: 'border-box',
            userSelect: 'none',
          }}
          title={`${remainingCount} more`}
        >
          <Text
            variant="caption"
            color="var(--color-ink)"
            bold
            style={{
              fontSize: Math.max(9, Math.floor(dimension * 0.35)),
              lineHeight: 1,
            }}
          >
            +{remainingCount}
          </Text>
        </span>
      )}
    </span>
  );
};

export default AvatarGroup;
