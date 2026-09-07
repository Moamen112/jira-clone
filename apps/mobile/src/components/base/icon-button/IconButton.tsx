import React from 'react';
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  PressableProps,
} from 'react-native';
import { colors } from '../../tokens/colors';
import { radius } from '../../tokens/radius';
import { layout } from '../../tokens/layout';
import { ButtonVariant, ButtonSize } from '../button/Button';

export interface IconButtonProps extends Omit<PressableProps, 'style'> {
  /** Icon element to render */
  icon: React.ReactNode;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size tier */
  size?: ButtonSize;
  /** Circular border */
  rounded?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Container style overrides */
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  size = 'md',
  rounded = false,
  loading = false,
  disabled = false,
  style,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const getDimension = (): number => {
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 48;
      case 'md':
      default:
        return layout.tapTarget; // 44
    }
  };

  const dim = getDimension();

  const getContainerStyle = (pressed: boolean): ViewStyle => {
    let bg = 'transparent';
    let border: string | undefined;

    switch (variant) {
      case 'primary':
        bg = colors.light.accent;
        break;
      case 'secondary':
        bg = colors.light.surface;
        border = colors.light.line;
        break;
      case 'danger':
        bg = colors.light.warn;
        break;
      case 'ghost':
        bg = pressed ? colors.light.paper : 'transparent';
        break;
    }

    return {
      width: dim,
      height: dim,
      borderRadius: rounded ? radius.pill : radius.input,
      backgroundColor: bg,
      borderColor: border,
      borderWidth: border ? 1 : 0,
      opacity: isDisabled ? 0.4 : pressed ? 0.8 : 1,
    };
  };

  const spinnerColor = variant === 'primary' || variant === 'danger'
    ? '#FFFFFF'
    : colors.light.ink;

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [styles.base, getContainerStyle(pressed), style]}
      hitSlop={8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        icon
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default IconButton;
