import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Badge } from '../../base';
import { colors } from '../../../tokens/colors';
import { radius } from '../../../tokens/radius';
import { BoardColumn } from '@jira-clone/shared';

export type StatusBarSize = 'sm' | 'md';

export interface StatusBarProps {
  /** Board column (status) to display */
  status: BoardColumn;
  /** Size tier: sm = compact, md = standard */
  size?: StatusBarSize;
  /** Show the colored status dot */
  withDot?: boolean;
  /** Container style override */
  style?: ViewStyle;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  status,
  size = 'sm',
  withDot = true,
  style,
}) => {
  const dotColor = status.color || colors.light.accent;

  return (
    <Badge
      label={status.title}
      variant="default"
      size={size}
      icon={withDot ? (
        <View
          style={[
            styles.dot,
            { backgroundColor: dotColor },
          ]}
        />
      ) : undefined}
      backgroundColor={colors.light.surface}
      textColor={colors.light.ink}
      style={style}
    />
  );
};

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
});

export default StatusBar;