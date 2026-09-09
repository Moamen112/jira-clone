import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  PressableProps,
} from 'react-native';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';
import { layout } from '../../../tokens/layout';
import { useTheme } from '../../../tokens';
import { Text } from '../typography/Text';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size tier */
  size?: ButtonSize;
  /** Label text inside button */
  label?: string;
  /** Loading state displaying an activity spinner */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Icon rendered before the label */
  leftIcon?: React.ReactNode;
  /** Icon rendered after the label */
  rightIcon?: React.ReactNode;
  /** Stretch button to fill parent container width */
  fullWidth?: boolean;
  /** Container style overrides */
  style?: ViewStyle;
  /** Custom children if not using label */
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  label,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  children,
  ...rest
}) => {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const getContainerStyle = (pressed: boolean): ViewStyle => {
    let bg: string = colors.accent;
    let border: string | undefined;

    switch (variant) {
      case 'primary':
        bg = colors.accent;
        break;
      case 'secondary':
        bg = colors.surface;
        border = colors.line;
        break;
      case 'danger':
        bg = colors.warn;
        break;
      case 'ghost':
        bg = 'transparent';
        break;
    }

    let minHeight: number = layout.tapTarget;
    let paddingH: number = spacing[4];

    if (size === 'sm') {
      minHeight = 32;
      paddingH = spacing[3];
    } else if (size === 'lg') {
      minHeight = 48;
      paddingH = spacing[5];
    }

    return {
      minHeight,
      paddingHorizontal: paddingH,
      backgroundColor: bg,
      borderColor: border,
      borderWidth: border ? 1 : 0,
      borderRadius: radius.input,
      opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1,
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
    };
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'secondary':
      case 'ghost':
        return colors.ink;
    }
  };

  const spinnerColor = variant === 'primary' || variant === 'danger'
    ? '#FFFFFF'
    : colors.ink;

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [styles.base, getContainerStyle(pressed), style]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          {label ? (
            <Text
              variant={size === 'sm' ? 'caption' : 'button'}
              color={getTextColor()}
              bold
            >
              {label}
            </Text>
          ) : (
            children
          )}
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: spacing[2],
  },
  rightIcon: {
    marginLeft: spacing[2],
  },
});

export default Button;

