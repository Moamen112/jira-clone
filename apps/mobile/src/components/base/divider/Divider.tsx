import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../../tokens/colors';
import { spacing, SpacingToken } from '../../../tokens/spacing';

export interface DividerProps {
  /** Direction of the line */
  orientation?: 'horizontal' | 'vertical';
  /** Margin applied along orientation axis */
  margin?: SpacingToken | number;
  /** Color override */
  color?: string;
  /** Thickness in pixels */
  thickness?: number;
  /** Style override */
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  margin = 3,
  color = colors.light.line,
  thickness = 1,
  style,
}) => {
  const marginValue =
    typeof margin === 'number' && margin in spacing
      ? spacing[margin as SpacingToken]
      : typeof margin === 'number'
      ? margin
      : spacing[3];

  const isHorizontal = orientation === 'horizontal';

  return (
    <View
      style={[
        isHorizontal
          ? {
              width: '100%',
              height: thickness,
              backgroundColor: color,
              marginVertical: marginValue,
            }
          : {
              height: '100%',
              width: thickness,
              backgroundColor: color,
              marginHorizontal: marginValue,
            },
        style,
      ]}
    />
  );
};

export default Divider;

