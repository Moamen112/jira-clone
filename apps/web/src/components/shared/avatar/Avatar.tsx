import { useState } from 'react';
import type { CSSProperties, FC } from 'react';
import { Text } from '../../base';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  /** User name for initials calculation */
  name?: string;
  /** Image URL to display */
  imageUrl?: string;
  /** Size tier or custom pixel size */
  size?: AvatarSize | number;
  /** Render an unassigned placeholder avatar */
  unassigned?: boolean;
  /** Show a subtle border around the avatar */
  bordered?: boolean;
  /** Border color override (e.g. matching the background for overlapping stacks) */
  borderColor?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

const AVATAR_SIZES: Record<AvatarSize, number> = {
  xs: 20,
  sm: 28,
  md: 36,
  lg: 44,
  xl: 56,
};

const AVATAR_PALETTES = [
  { bg: '#DCEAE6', text: '#1E6F5C' },
  { bg: '#F5DFD3', text: '#B8460E' },
  { bg: '#E4DFD3', text: '#4A463B' },
  { bg: '#DDE2E5', text: '#2E414E' },
  { bg: '#EADCEE', text: '#6D2B7B' },
  { bg: '#D7E8F0', text: '#1D5570' },
];

function getPaletteForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar: FC<AvatarProps> = ({
  name = '',
  imageUrl,
  size = 'md',
  unassigned = false,
  bordered = false,
  borderColor,
  style,
}) => {
  const [imageError, setImageError] = useState(false);
  const dimension = typeof size === 'number' ? size : AVATAR_SIZES[size];
  const fontSize = Math.max(10, Math.floor(dimension * 0.4));
  const palette = getPaletteForName(name);
  const hasValidImage = Boolean(imageUrl) && !imageError;

  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    width: dimension,
    height: dimension,
    borderRadius: 'var(--radius-pill)',
    ...style,
  };

  if (unassigned) {
    return (
      <span
        style={{
          ...baseStyle,
          border: '1.5px dashed var(--color-ink-muted)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <Text
          variant="caption"
          color="var(--color-ink-muted)"
          style={{ fontSize, fontWeight: 600 }}
        >
          ?
        </Text>
      </span>
    );
  }

  return (
    <span
      style={{
        ...baseStyle,
        backgroundColor: hasValidImage ? 'transparent' : palette.bg,
        borderWidth: bordered ? 2 : 0,
        borderStyle: bordered ? 'solid' : undefined,
        borderColor: borderColor ?? 'var(--color-paper)',
      }}
    >
      {hasValidImage ? (
        <img
          src={imageUrl}
          alt={name}
          onError={() => setImageError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <Text variant="caption" color={palette.text} bold style={{ fontSize }}>
          {getInitials(name)}
        </Text>
      )}
    </span>
  );
};

export default Avatar;