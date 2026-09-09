import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Badge } from '../../base';
import { colors } from '../../../tokens/colors';
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

const PRIORITY_META: Record<CardPriority, { label: string; color: string; bg: string; arrow: string }> = {
  lowest: {
    label: 'Lowest',
    color: colors.light.inkMuted,
    bg: colors.light.surface,
    arrow: '↓',
  },
  low: {
    label: 'Low',
    color: colors.light.accent,
    bg: colors.light.accentSoft,
    arrow: '→',
  },
  medium: {
    label: 'Medium',
    color: colors.light.warn,
    bg: colors.light.warnSoft,
    arrow: '→',
  },
  high: {
    label: 'High',
    color: '#B8460E',
    bg: colors.light.warnSoft,
    arrow: '↑',
  },
  highest: {
    label: 'Highest',
    color: colors.light.warn,
    bg: colors.light.warnSoft,
    arrow: '⤴',
  },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'sm',
  withIcon = true,
  showLabel = true,
  style,
}) => {
  const meta = PRIORITY_META[priority];

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
          <View
            style={[
              styles.arrowText,
              { color: meta.color },
            ]}
          >
            {meta.arrow}
          </View>
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