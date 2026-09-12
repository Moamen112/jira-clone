import type { CSSProperties, FC } from 'react';
import './Skeleton.css';

export interface SkeletonProps {
  /** Width of the skeleton block */
  width?: number | string;
  /** Height of the skeleton block */
  height?: number | string;
  /** Corner radius (ignored when circle is true) */
  borderRadius?: number | string;
  /** Fully circular skeleton (e.g. avatar placeholder) */
  circle?: boolean;
  /** Base background color */
  color?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

export const Skeleton: FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 6,
  circle = false,
  color,
  style,
}) => {
  return (
    <span
      className="jira-skeleton"
      style={{
        width,
        height,
        borderRadius: circle ? '50%' : borderRadius,
        backgroundColor: color ?? 'var(--color-line)',
        ...style,
      }}
    />
  );
};

export default Skeleton;