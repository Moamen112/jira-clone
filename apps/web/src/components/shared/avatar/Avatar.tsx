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
  { bg: '#DCEAE6', text: '#1E6F5C' }, // Accent Soft
  { bg: '#F5DFD3', text: '#B8460E' }, // Warn Soft
  { bg: '#E4DFD3', text: '#4A463B' }, // Warm gray
  { bg: '#DDE2E5', text: '#2E414E' }, // Slate
  { bg: '#EADCEE', text: '#6D2B7B' }, // Plum
  { bg: '#D7E8F0', text: '#1D5570' }, // Ocean
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
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
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
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const dimension = typeof size === 'number' ? size : AVATAR_SIZES[size];
  const fontSize = Math.max(10, Math.floor(dimension * 0.38));
  const palette = getPaletteForName(name);
  const hasValidImage = Boolean(imageUrl) && failedUrl !== imageUrl;

  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    width: dimension,
    height: dimension,
    minWidth: dimension,
    minHeight: dimension,
    borderRadius: 'var(--radius-pill)',
    userSelect: 'none',
    boxSizing: 'border-box',
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
        title="Unassigned"
      >
        <Text
          variant="caption"
          color="var(--color-ink-muted)"
          style={{ fontSize, fontWeight: 600, lineHeight: 1 }}
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
      title={name || undefined}
    >
      {hasValidImage ? (
        <img
          key={imageUrl}
          src={imageUrl}
          alt={name}
          onError={() => setFailedUrl(imageUrl!)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <Text
          variant="caption"
          color={palette.text}
          bold
          style={{ fontSize, lineHeight: 1 }}
        >
          {getInitials(name)}
        </Text>
      )}
    </span>
  );
};

export default Avatar;
