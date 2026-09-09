import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { useTheme } from '../../../tokens';
import { radius } from '../../../tokens/radius';

export interface SkeletonProps {
  /** Width of skeleton block */
  width?: DimensionValue;
  /** Height of skeleton block */
  height?: DimensionValue;
  /** Corner radius */
  borderRadius?: number;
  /** Fully circular skeleton (e.g., avatar placeholder) */
  circle?: boolean;
  /** Base background color */
  color?: string;
  /** Style override */
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = radius.input,
  circle = false,
  color,
  style,
}) => {
  const { colors } = useTheme();
  const resolvedColor = color ?? colors.line;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacityAnim]);

  const resolvedRadius = circle ? radius.pill : borderRadius;

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: resolvedRadius,
          backgroundColor: resolvedColor,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
});

export default Skeleton;

