import { useState } from 'react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { Text } from '../typography/Text';

export interface InputProps {
  /** Label text placed above the input */
  label?: string;
  /** Error text displayed below the input */
  error?: string;
  /** Hint / helper text displayed below the input */
  hint?: string;
  /** Icon displayed on the left side inside the input */
  leftIcon?: ReactNode;
  /** Icon or control displayed on the right side inside the input */
  rightIcon?: ReactNode;
  /** Current value (controlled) */
  value?: string;
  /** Initial value (uncontrolled) */
  defaultValue?: string;
  /** Placeholder text */
  placeholder?: string;
  /** HTML input type (defaults to 'text') */
  type?: string;
  /** Whether the field accepts input */
  editable?: boolean;
  /** Disabled state (convenience alias matching mobile API) */
  disabled?: boolean;
  /** Maximum input length */
  maxLength?: number;
  /** Autofocus on mount */
  autoFocus?: boolean;
  /** Change callback (mobile-style API) */
  onChangeText?: (text: string) => void;
  /** Focus callback */
  onFocus?: () => void;
  /** Blur callback */
  onBlur?: () => void;
  /** Keydown handler */
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Outer container style overrides */
  containerStyle?: CSSProperties;
  /** Input wrapper style (borders, background) */
  inputWrapperStyle?: CSSProperties;
  /** Direct input element style */
  style?: CSSProperties;
}

export const Input: FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  value,
  defaultValue,
  placeholder,
  type = 'text',
  editable = true,
  disabled,
  maxLength,
  autoFocus,
  onChangeText,
  onFocus,
  onBlur,
  onKeyDown,
  containerStyle,
  inputWrapperStyle,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const readOnly = disabled === true || editable === false;

  const borderColor = error
    ? 'var(--color-warn)'
    : isFocused
      ? 'var(--color-accent)'
      : 'var(--color-line)';

  return (
    <label
      style={{
        display: 'block',
        width: '100%',
        marginBottom: 12,
        ...containerStyle,
      }}
    >
      {label && (
        <Text variant="label" style={{ display: 'block', marginBottom: 4 }}>
          {label}
        </Text>
      )}

      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          minHeight: 44,
          border: `1px solid ${borderColor}`,
          borderRadius: 'var(--radius-input)',
          paddingInline: 12,
          width: '100%',
          boxSizing: 'border-box',
          backgroundColor: readOnly ? 'var(--color-paper)' : 'var(--color-surface)',
          ...inputWrapperStyle,
        }}
      >
        {leftIcon && (
          <span
            style={{
              display: 'inline-flex',
              marginRight: 8,
              color: isFocused ? 'var(--color-accent)' : 'var(--color-ink-muted)',
              transition: 'color 150ms ease',
            }}
          >
            {leftIcon}
          </span>
        )}
        <input
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={readOnly}
          readOnly={readOnly}
          maxLength={maxLength}
          autoFocus={autoFocus}
          onChange={(event) => onChangeText?.(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          style={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            padding: 0,
            fontSize: 15,
            color: 'var(--color-ink)',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            colorScheme: 'inherit',
            ...style,
          }}
        />
        {rightIcon && (
          <span
            style={{
              display: 'inline-flex',
              marginLeft: 8,
              color: isFocused ? 'var(--color-accent)' : 'var(--color-ink-muted)',
              transition: 'color 150ms ease',
            }}
          >
            {rightIcon}
          </span>
        )}
      </span>

      {error ? (
        <Text variant="errorText" color="var(--color-warn)" style={{ display: 'block', marginTop: 4 }}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" muted style={{ display: 'block', marginTop: 4 }}>
          {hint}
        </Text>
      ) : null}
    </label>
  );
};

export default Input;