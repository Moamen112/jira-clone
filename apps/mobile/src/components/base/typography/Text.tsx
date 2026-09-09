import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
  TextStyle,
  Platform,
} from 'react-native';
import { useTheme } from '../../../tokens';
import { typeScale, TypeStyleToken } from '../../../tokens/typography';

export interface TextProps extends RNTextProps {
  /** Variant style defined in Fieldnotes typeScale */
  variant?: TypeStyleToken;
  /** Direct color override or brand token name */
  color?: string;
  /** Convenience flag for muted secondary text */
  muted?: boolean;
  /** Alignment of text */
  align?: 'left' | 'center' | 'right' | 'justify';
  /** Bold / Semibold override */
  bold?: boolean;
  children?: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color,
  muted = false,
  align,
  bold,
  style,
  children,
  ...rest
}) => {
  const { colors } = useTheme();
  const token = typeScale[variant] || typeScale.body;

  const fontColor = color
    ? color
    : muted
    ? colors.inkMuted
    : colors.ink;

  // React Native font weight string
  const resolvedWeight = bold
    ? '700'
    : String(token.weight) as TextStyle['fontWeight'];

  // Handle monospace vs sans-serif on native platforms
  const isMono =
    variant === 'monoData' || variant === 'monoKey' || variant === 'monoSmall';
  const resolvedFontFamily = isMono
    ? Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' })
    : Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

  const textStyles: TextStyle = {
    fontSize: token.size,
    lineHeight: token.lineHeight,
    fontWeight: resolvedWeight,
    fontFamily: resolvedFontFamily,
    color: fontColor,
    textAlign: align,
  };

  return (
    <RNText style={[textStyles, style]} {...rest}>
      {children}
    </RNText>
  );
};

export default Text;

