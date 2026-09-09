import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../tokens';
import { spacing } from '../../../tokens/spacing';
import { Text } from '../typography/Text';

export interface SpinnerProps {
  /** Size tier */
  size?: 'small' | 'large';
  /** Spinner color */
  color?: string;
  /** Optional loading text */
  label?: string;
  /** Layout label horizontally or vertically */
  direction?: 'row' | 'column';
  /** Center inside parent */
  centered?: boolean;
  /** Style override */
  style?: ViewStyle;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'small',
  color,
  label,
  direction = 'column',
  centered = false,
  style,
}) => {
  const { colors } = useTheme();
  const resolvedColor = color ?? colors.accent;

  return (
    <View
      style={[
        styles.container,
        { flexDirection: direction },
        centered && styles.centered,
        style,
      ]}
    >
      <ActivityIndicator size={size} color={resolvedColor} />
      {label && (
        <Text
          variant="caption"
          muted
          style={[
            direction === 'column' ? styles.labelColumn : styles.labelRow,
          ]}
        >
          {label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    padding: spacing[4],
  },
  labelColumn: {
    marginTop: spacing[2],
  },
  labelRow: {
    marginLeft: spacing[2],
  },
});

export default Spinner;

