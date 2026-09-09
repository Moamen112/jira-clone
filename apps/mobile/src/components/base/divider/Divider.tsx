import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../tokens';
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
  color,
  thickness = 1,
  style,
}) => {
  const { colors } = useTheme();
  const dividerColor = color || colors.line;
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
              backgroundColor: dividerColor,
              marginVertical: marginValue,
            }
          : {
              height: '100%',
              width: thickness,
              backgroundColor: dividerColor,
              marginHorizontal: marginValue,
            },
        style,
      ]}
    />
  );
};

export default Divider;

