import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Badge, Text } from '../../base';
import { useTheme } from '../../../tokens';
import { CardPriority } from '@jira-clone/shared';

export type PriorityBadgeSize = 'sm' | 'md';

export interface PriorityBadgeProps {
  /** Card priority level */
  priority: CardPriority;
  /** Size tier: sm = compact, md = standard */
  size?: PriorityBadgeSize;
  /** Show the priority arrow icon next to the label */
  withIcon?: boolean;
  /** Show the priority label text */
  showLabel?: boolean;
  /** Container style override */
  style?: ViewStyle;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'sm',
  withIcon = true,
  showLabel = true,
  style,
}) => {
  const { colors, isDark } = useTheme();

  // Resolve the per-priority visual metadata against the active color palette.
  const getPriorityMeta = (): {
    label: string;
    color: string;
    bg: string;
    arrow: string;
  } => {
    switch (priority) {
      case 'lowest':
        return {
          label: 'Lowest',
          color: colors.inkMuted,
          bg: colors.surface,
          arrow: '↓',
        };
      case 'low':
        return {
          label: 'Low',
          color: colors.accent,
          bg: colors.accentSoft,
          arrow: '→',
        };
      case 'medium':
        return {
          label: 'Medium',
          color: colors.warn,
          bg: colors.warnSoft,
          arrow: '→',
        };
      case 'high':
        return {
          label: 'High',
          color: isDark ? colors.warn : '#B8460E', // deep terracotta in light mode
          bg: colors.warnSoft,
          arrow: '↑',
        };
      case 'highest':
      default:
        return {
          label: 'Highest',
          color: colors.warn,
          bg: isDark ? colors.warn : colors.warnSoft,
          arrow: '⤴',
        };
    }
  };

  const meta = getPriorityMeta();

  return (
    <Badge
      label={showLabel ? meta.label : ''}
      variant="default"
      size={size}
      icon={withIcon ? (
        <View style={styles.iconWrapper}>
          <View
            style={[
              styles.iconDot,
              { backgroundColor: meta.color },
            ]}
          />
          <Text
            variant="caption"
            bold
            color={meta.color}
            style={styles.arrowText}
          >
            {meta.arrow}
          </Text>
        </View>
      ) : undefined}
      backgroundColor={meta.bg}
      textColor={meta.color}
      style={!showLabel ? { minWidth: size === 'md' ? 28 : 20 } : style}
    />
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  arrowText: {
    marginLeft: 3,
    fontSize: 11,
    lineHeight: 14,
  },
});

export default PriorityBadge;