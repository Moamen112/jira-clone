import type { CSSProperties, FC, KeyboardEvent } from 'react';
import { Text } from '../../base';
import { Avatar } from '../avatar/Avatar';
import type { AvatarSize } from '../avatar/Avatar';
import type { User } from '@jira-clone/shared';
import './UserChip.css';

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
  style?: CSSProperties;
}

const AVATAR_SIZE_BY_SIZE: Record<UserChipSize, AvatarSize> = {
  sm: 'xs',
  md: 'sm',
};

export const UserChip: FC<UserChipProps> = ({
  user,
  variant = 'default',
  size = 'md',
  removable = false,
  onRemove,
  onPress,
  style,
}) => {
  const avatarSize = AVATAR_SIZE_BY_SIZE[size];
  const textColor = variant === 'accent' ? 'var(--color-accent)' : 'var(--color-ink)';

  const removeAffordance =
    removable && onRemove ? (
      <button
        type="button"
        aria-label={`Remove ${user.name}`}
        onClick={onRemove}
        className="jira-user-chip-remove"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          borderRadius: 'var(--radius-pill)',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <Text variant="caption" bold color="var(--color-ink-muted)" style={{ lineHeight: 16 }}>
          ×
        </Text>
      </button>
    ) : null;

  const chipContent = (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      <Avatar name={user.name} imageUrl={user.avatarUrl} size={avatarSize} />
      <Text
        variant={size === 'sm' ? 'caption' : 'bodySmall'}
        bold
        numberOfLines={1}
        color={textColor}
        style={{ maxWidth: 160 }}
      >
        {user.name}
      </Text>
      {removeAffordance}
    </span>
  );

  const chipStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingBlock: 6,
    paddingInline: 8,
    borderRadius: 'var(--radius-pill)',
    ...(variant === 'accent'
      ? { backgroundColor: 'var(--color-accent-soft)' }
      : { backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)' }),
    ...style,
  };

  if (onPress) {
    return (
      <span
        role="button"
        tabIndex={0}
        onClick={onPress}
        onKeyDown={(event: KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onPress();
          }
        }}
        className="jira-user-chip"
        style={{ ...chipStyle, cursor: 'pointer' }}
      >
        {chipContent}
      </span>
    );
  }

  return (
    <span className="jira-user-chip" style={chipStyle}>
      {chipContent}
    </span>
  );
};

export default UserChip;