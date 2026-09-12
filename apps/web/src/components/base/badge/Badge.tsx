import type { CSSProperties, FC, ReactNode } from 'react';
import { Text } from '../typography/Text';

export type BadgeVariant = 'default' | 'accent' | 'warn' | 'neutral' | 'mono' | 'done';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  /** Badge text label */
  label: string;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size tier */
  size?: BadgeSize;
  /** Pill (fully rounded) or rounded rectangle */
  rounded?: boolean;
  /** Optional icon or status dot */
  icon?: ReactNode;
  /** Custom background color */
  backgroundColor?: string;
  /** Custom text color */
  textColor?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string; border?: string }> = {
  accent: { bg: 'var(--color-accent-soft)', text: 'var(--color-accent)' },
  warn: { bg: 'var(--color-warn-soft)', text: 'var(--color-warn)' },
  neutral: { bg: 'var(--color-paper)', text: 'var(--color-ink-muted)', border: 'var(--color-line)' },
  mono: { bg: 'var(--color-paper)', text: 'var(--color-ink)', border: 'var(--color-line)' },
  done: { bg: 'var(--color-accent)', text: '#FFFFFF' },
  default: { bg: 'var(--color-surface)', text: 'var(--color-ink)', border: 'var(--color-line)' },
};

export const Badge: FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  rounded = true,
  icon,
  backgroundColor,
  textColor,
  style,
}) => {
  const v = VARIANT_STYLES[variant];
  const bg = backgroundColor ?? v.bg;
  const fg = textColor ?? v.text;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bg,
        border: v.border ? `1px solid ${v.border}` : 'none',
        borderRadius: rounded ? 'var(--radius-pill)' : 'var(--radius-input)',
        height: size === 'sm' ? 20 : 24,
        paddingInline: size === 'sm' ? 6 : 8,
        ...style,
      }}
    >
      {icon && (
        <span style={{ marginRight: 4, display: 'inline-flex' }}>{icon}</span>
      )}
      <Text
        variant={variant === 'mono' ? 'monoKey' : 'badge'}
        color={fg}
        bold
        style={{ fontSize: size === 'sm' ? 10 : 12 }}
      >
        {label}
      </Text>
    </span>
  );
};

export default Badge;