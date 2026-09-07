import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors } from '../../tokens/colors';
import { radius } from '../../tokens/radius';
import { spacing } from '../../tokens/spacing';
import { Text } from '../typography/Text';

export interface TextareaProps extends TextInputProps {
  /** Label text placed above textarea */
  label?: string;
  /** Error text displayed below textarea */
  error?: string;
  /** Helper text displayed below textarea */
  hint?: string;
  /** Show remaining or total character count */
  showCount?: boolean;
  /** Outer container style */
  containerStyle?: ViewStyle;
  /** Input wrapper style */
  inputWrapperStyle?: ViewStyle;
}

export const Textarea = forwardRef<TextInput, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      showCount = false,
      maxLength,
      value,
      defaultValue,
      containerStyle,
      inputWrapperStyle,
      style,
      placeholderTextColor = colors.light.inkMuted,
      editable = true,
      onFocus,
      onBlur,
      onChangeText,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [currentLength, setCurrentLength] = useState(
      (value || defaultValue || '').length
    );

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChangeText = (text: string) => {
      setCurrentLength(text.length);
      onChangeText?.(text);
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
          <TextInput
            ref={ref}
            multiline
            textAlignVertical="top"
            editable={editable}
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            placeholderTextColor={placeholderTextColor}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChangeText={handleChangeText}
            style={[
              styles.textInput,
              { color: colors.light.ink },
              style,
            ]}
            {...rest}
          />
        </View>

        <View style={styles.footer}>
          {error ? (
            <Text variant="errorText" color={colors.light.warn}>
              {error}
            </Text>
          ) : hint ? (
            <Text variant="caption" muted>
              {hint}
            </Text>
          ) : (
            <View />
          )}

          {showCount && maxLength ? (
            <Text variant="monoSmall" muted>
              {currentLength}/{maxLength}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }
);

Textarea.displayName = 'Textarea';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing[3],
  },
  label: {
    marginBottom: spacing[1],
  },
  inputWrapper: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: radius.input,
    padding: spacing[3],
  },
  textInput: {
    flex: 1,
    padding: 0,
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[1],
  },
});

export default Textarea;
