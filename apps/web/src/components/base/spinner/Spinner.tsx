import type { CSSProperties, FC } from 'react';
import './Spinner.css';
import { Text } from '../typography/Text';

export interface SpinnerProps {
  /** Size tier */
  size?: 'small' | 'large';
  /** Spinner color (supports CSS variables) */
  color?: string;
  /** Optional loading text */
  label?: string;
  /** Layout label horizontally or vertically */
  direction?: 'row' | 'column';
  /** Additional inline styles */
  style?: CSSProperties;
}

const DIMENSIONS: Record<'small' | 'large', number> = {
  small: 20,
  large: 36,
};

export const Spinner: FC<SpinnerProps> = ({
  size = 'small',
  color,
  label,
  direction = 'column',
  style,
}) => {
  const dimension = DIMENSIONS[size];
  const borderWidth = Math.max(2, Math.round(dimension / 10));

  return (
    <span
      style={{
        display: 'inline-flex',
        flexDirection: direction,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...style,
      }}
    >
      <span
        className="jira-spinner"
        style={{
          width: dimension,
          height: dimension,
          borderWidth,
          borderTopColor: color ?? 'var(--color-accent)',
        }}
      />
      {label && <Text variant="caption" muted>{label}</Text>}
    </span>
  );
};

export default Spinner;