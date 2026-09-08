import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../../tokens/colors';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';
import { layout } from '../../../tokens/layout';
import { Text } from '../typography/Text';

export interface InputProps extends TextInputProps {
  /** Label text placed above input */
  label?: string;
  /** Error text displayed below input */
  error?: string;
  /** Hint / helper text displayed below input */
  hint?: string;
  /** Icon displayed on the left side inside the input */
  leftIcon?: React.ReactNode;
  /** Icon or control displayed on the right side inside the input */
  rightIcon?: React.ReactNode;
  /** Outer container style */
  containerStyle?: ViewStyle;
  /** Input wrapper style (borders, background) */
  inputWrapperStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      containerStyle,
      inputWrapperStyle,
      style,
      placeholderTextColor = colors.light.inkMuted,
      editable = true,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const borderColor = error
      ? colors.light.warn
      : isFocused
      ? colors.light.accent
      : colors.light.line;

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text variant="label" style={styles.label}>
            {label}
          </Text>
        )}

        <View
          style={[
            styles.inputWrapper,
            {
              borderColor,
              backgroundColor: editable
                ? colors.light.surface
                : colors.light.paper,
            },
            inputWrapperStyle,
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          <TextInput
            ref={ref}
            editable={editable}
            placeholderTextColor={placeholderTextColor}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={[
              styles.textInput,
              { color: colors.light.ink },
              style,
            ]}
            {...rest}
          />

          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>

        {error ? (
          <Text variant="errorText" color={colors.light.warn} style={styles.feedback}>
            {error}
          </Text>
        ) : hint ? (
          <Text variant="caption" muted style={styles.feedback}>
            {hint}
          </Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing[3],
  },
  label: {
    marginBottom: spacing[1],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.tapTarget, // 44
    borderWidth: 1,
    borderRadius: radius.input,
    paddingHorizontal: spacing[3],
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    fontSize: 15,
  },
  leftIcon: {
    marginRight: spacing[2],
  },
  rightIcon: {
    marginLeft: spacing[2],
  },
  feedback: {
    marginTop: spacing[1],
  },
});

export default Input;

