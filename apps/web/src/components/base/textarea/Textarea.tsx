import { useState } from 'react';
import type { CSSProperties, FC } from 'react';
import { Text } from '../typography/Text';

export interface TextareaProps {
  /** Label text placed above the textarea */
  label?: string;
  /** Error text displayed below the textarea */
  error?: string;
  /** Helper text displayed below the textarea */
  hint?: string;
  /** Show remaining/total character count */
  showCount?: boolean;
  /** Current value (controlled) */
  value?: string;
  /** Initial value (uncontrolled) */
  defaultValue?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Maximum character length */
  maxLength?: number;
  /** Whether the field accepts input */
  editable?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Autofocus on mount */
  autoFocus?: boolean;
  /** Change callback (mobile-style API) */
  onChangeText?: (text: string) => void;
  /** Focus callback */
  onFocus?: () => void;
  /** Blur callback */
  onBlur?: () => void;
  /** Outer container style overrides */
  containerStyle?: CSSProperties;
  /** Textarea wrapper style */
  inputWrapperStyle?: CSSProperties;
  /** Direct textarea element style */
  style?: CSSProperties;
}

export const Textarea: FC<TextareaProps> = ({
  label,
  error,
  hint,
  showCount = false,
  value,
  defaultValue,
  placeholder,
  maxLength,
  editable = true,
  disabled,
  autoFocus,
  onChangeText,
  onFocus,
  onBlur,
  containerStyle,
  inputWrapperStyle,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [currentLength, setCurrentLength] = useState(
    (value || defaultValue || '').length
  );
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
          display: 'block',
          border: `1px solid ${borderColor}`,
          borderRadius: 'var(--radius-input)',
          padding: 12,
          boxSizing: 'border-box',
          minHeight: 100,
          backgroundColor: readOnly ? 'var(--color-paper)' : 'var(--color-surface)',
          ...inputWrapperStyle,
        }}
      >
        <textarea
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={readOnly}
          readOnly={readOnly}
          maxLength={maxLength}
          autoFocus={autoFocus}
          rows={4}
          onChange={(event) => {
            setCurrentLength(event.target.value.length);
            onChangeText?.(event.target.value);
          }}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          style={{
            display: 'block',
            width: '100%',
            minHeight: 80,
            padding: 0,
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            lineHeight: 22,
            color: 'var(--color-ink)',
            background: 'transparent',
            ...style,
          }}
        />
      </span>

      <span
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 4,
        }}
      >
        {error ? (
          <Text variant="errorText" color="var(--color-warn)">
            {error}
          </Text>
        ) : hint ? (
          <Text variant="caption" muted>
            {hint}
          </Text>
        ) : (
          <span />
        )}
        {showCount && maxLength ? (
          <Text variant="monoSmall" muted>
            {currentLength}/{maxLength}
          </Text>
        ) : null}
      </span>
    </label>
  );
};

export default Textarea;