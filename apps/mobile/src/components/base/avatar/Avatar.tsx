import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import { colors } from '../../../tokens/colors';
import { radius } from '../../../tokens/radius';
import { Text } from '../typography/Text';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  /** User name for initials calculation */
  name?: string;
  /** Image URI or source */
  imageUrl?: string;
  /** Size tier or custom pixel size */
  size?: AvatarSize | number;
  /** Render unassigned placeholder avatar */
  unassigned?: boolean;
  /** Show subtle border around avatar */
  bordered?: boolean;
  /** Border color override (e.g., matching paper background for overlapping stacks) */
  borderColor?: string;
  /** Style override */
  style?: ViewStyle;
}

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
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  name = '',
  imageUrl,
  size = 'md',
  unassigned = false,
  bordered = false,
  borderColor = colors.light.paper,
  style,
}) => {
  const [imageError, setImageError] = useState(false);

  const getDimension = (): number => {
    if (typeof size === 'number') return size;
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
  const fontSize = Math.max(10, Math.floor(dim * 0.4));
  const palette = getPaletteForName(name);

  if (unassigned) {
    return (
      <View
        style={[
          styles.container,
          styles.unassigned,
          {
            width: dim,
            height: dim,
            borderRadius: radius.pill,
            borderColor: colors.light.inkMuted,
          },
          style,
        ]}
      >
        <Text
          variant="caption"
          color={colors.light.inkMuted}
          style={{ fontSize, fontWeight: '600' }}
        >
          ?
        </Text>
      </View>
    );
  }

  const hasValidImage = imageUrl && !imageError;

  return (
    <View
      style={[
        styles.container,
        {
          width: dim,
          height: dim,
          borderRadius: radius.pill,
          backgroundColor: hasValidImage ? 'transparent' : palette.bg,
          borderWidth: bordered ? 2 : 0,
          borderColor,
        },
        style,
      ]}
    >
      {hasValidImage ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { borderRadius: radius.pill }]}
          onError={() => setImageError(true)}
        />
      ) : (
        <Text
          variant="caption"
          color={palette.text}
          bold
          style={{ fontSize }}
        >
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  unassigned: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    backgroundColor: colors.light.surface,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default Avatar;

