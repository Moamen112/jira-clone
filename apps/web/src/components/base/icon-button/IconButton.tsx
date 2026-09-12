import type { CSSProperties, FC, ReactNode } from 'react';
import type { ButtonVariant, ButtonSize } from '../button/Button';

export interface IconButtonProps {
  /** Icon element to render */
  icon: ReactNode;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size tier */
  size?: ButtonSize;
  /** Circular (pill) border */
  rounded?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Accessible label describing the action */
  label: string;
  /** Container style overrides */
  style?: CSSProperties;
  /** Press handler */
  onPress?: () => void;
}

const DIMENSIONS: Record<ButtonSize, number> = {
  sm: 32,
  md: 44,
  lg: 48,
};

export const IconButton: FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  size = 'md',
  rounded = false,
  disabled = false,
  label,
  style,
  onPress,
}) => {
  const dimension = DIMENSIONS[size];

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

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={() => onPress?.()}
      style={{
        width: dimension,
        height: dimension,
        borderRadius: rounded ? 'var(--radius-pill)' : 'var(--radius-input)',
        backgroundColor: getBackground(),
        border: variant === 'secondary' ? '1px solid var(--color-line)' : 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'default' : 'pointer',
        ...style,
      }}
    >
      {icon}
    </button>
  );
};

export default IconButton;