import type { CSSProperties, FC } from 'react';

export interface DividerProps {
  /** Direction of the line */
  orientation?: 'horizontal' | 'vertical';
  /** Margin applied along the orientation axis (px) */
  margin?: number;
  /** Color override */
  color?: string;
  /** Thickness in pixels */
  thickness?: number;
  /** Additional inline styles */
  style?: CSSProperties;
}

export const Divider: FC<DividerProps> = ({
  orientation = 'horizontal',
  margin = 12,
  color,
  thickness = 1,
  style,
}) => {
  const isHorizontal = orientation === 'horizontal';

  const axisStyle: CSSProperties = isHorizontal
    ? { width: '100%', height: thickness, marginBlock: margin }
    : { width: thickness, height: '100%', marginInline: margin };

  return (
    <div
      style={{
        ...axisStyle,
        backgroundColor: color ?? 'var(--color-line)',
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

export default Divider;