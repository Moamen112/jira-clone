import type { CSSProperties, FC, ReactNode } from 'react';
import { Text } from '../typography/Text';
import { Spinner } from '../spinner/Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size tier */
  size?: ButtonSize;
  /** Label text inside the button */
  label?: string;
  /** Loading state rendering a spinner */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Icon rendered before the label */
  leftIcon?: ReactNode;
  /** Icon rendered after the label */
  rightIcon?: ReactNode;
  /** Stretch button to fill parent container width */
  fullWidth?: boolean;
  /** Container style overrides */
  style?: CSSProperties;
  /** Press handler */
  onPress?: () => void;
  /** Custom children if not using label */
  children?: ReactNode;
}

const SIZE_SETTINGS: Record<ButtonSize, { minHeight: number; paddingH: number }> = {
  sm: { minHeight: 32, paddingH: 12 },
  md: { minHeight: 44, paddingH: 16 },
  lg: { minHeight: 48, paddingH: 24 },
};

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  label,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  onPress,
  children,
}) => {
  const isDisabled = disabled || loading;
  const { minHeight, paddingH } = SIZE_SETTINGS[size];

  const getBackground = (): string => {
    switch (variant) {
      case 'primary':
        return 'var(--color-accent)';
      case 'secondary':
        return 'var(--color-surface)';
      case 'danger':
        return 'var(--color-warn)';
      case 'ghost':
      default:
        return 'transparent';
    }
  };

  const getTextColor = (): string =>
    variant === 'primary' || variant === 'danger' ? '#FFFFFF' : 'var(--color-ink)';

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-busy={loading}
      onClick={() => onPress?.()}
      style={{
        minHeight,
        paddingInline: paddingH,
        backgroundColor: getBackground(),
        border: variant === 'secondary' ? '1px solid var(--color-line)' : 'none',
        borderRadius: 'var(--radius-input)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: fullWidth ? '100%' : undefined,
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? 'default' : 'pointer',
        ...style,
      }}
    >
      {loading ? (
        <Spinner
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : 'var(--color-ink)'}
        />
      ) : (
        <>
          {leftIcon}
          {label ? (
            <Text variant={size === 'sm' ? 'caption' : 'button'} color={getTextColor()} bold>
              {label}
            </Text>
          ) : (
            children
          )}
          {rightIcon}
        </>
      )}
    </button>
  );
};

export default Button;