import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../../tokens/colors';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';
import { Text } from '../typography/Text';

export type BadgeVariant =
  | 'default'
  | 'accent'
  | 'warn'
  | 'neutral'
  | 'mono'
  | 'done';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  /** Badge text label */
  label: string;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size tier */
  size?: BadgeSize;
  /** Pill (full rounded) or rounded rectangle */
  rounded?: boolean;
  /** Optional icon or status dot */
  icon?: React.ReactNode;
  /** Custom background color */
  backgroundColor?: string;
  /** Custom text color */
  textColor?: string;
  /** Style override */
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  rounded = true,
  icon,
  backgroundColor,
  textColor,
  style,
}) => {
  const getVariantStyles = (): { bg: string; text: string; border?: string } => {
    switch (variant) {
      case 'accent':
        return {
          bg: colors.light.accentSoft,
          text: colors.light.accent,
        };
      case 'warn':
        return {
          bg: colors.light.warnSoft,
          text: colors.light.warn,
        };
      case 'neutral':
        return {
          bg: colors.light.paper,
          text: colors.light.inkMuted,
          border: colors.light.line,
        };
      case 'mono':
        return {
          bg: colors.light.paper,
          text: colors.light.ink,
          border: colors.light.line,
        };
      case 'done':
        return {
          bg: colors.light.accent,
          text: '#FFFFFF',
        };
      case 'default':
      default:
        return {
          bg: colors.light.surface,
          text: colors.light.ink,
          border: colors.light.line,
        };
    }
  };

  const vStyles = getVariantStyles();
  const bg = backgroundColor || vStyles.bg;
  const fg = textColor || vStyles.text;

  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          borderColor: vStyles.border,
          borderWidth: vStyles.border ? 1 : 0,
          borderRadius: rounded ? radius.pill : radius.input,
          height: isSm ? 20 : 24,
          paddingHorizontal: isSm ? spacing[1] + 2 : spacing[2],
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text
        variant={variant === 'mono' ? 'monoKey' : 'badge'}
        color={fg}
        bold
        style={{ fontSize: isSm ? 10 : 12 }}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  iconWrapper: {
    marginRight: 4,
  },
});

export default Badge;

