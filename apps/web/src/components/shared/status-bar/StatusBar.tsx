import type { CSSProperties, FC } from 'react';
import { Badge } from '../../base';
import type { BoardColumn } from '@jira-clone/shared';

export type StatusBarSize = 'sm' | 'md';

export interface StatusBarProps {
  /** Board column (status) to display */
  status: BoardColumn;
  /** Size tier: sm = compact, md = standard */
  size?: StatusBarSize;
  /** Show the colored status dot */
  withDot?: boolean;
  /** Container style override */
  style?: CSSProperties;
}

export const StatusBar: FC<StatusBarProps> = ({
  status,
  size = 'sm',
  withDot = true,
  style,
}) => {
  const dotColor = status.color ?? 'var(--color-accent)';

  return (
    <Badge
      label={status.title}
      variant="default"
      size={size}
      icon={
        withDot ? (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 'var(--radius-pill)',
              backgroundColor: dotColor,
              display: 'inline-block',
            }}
          />
        ) : undefined
      }
      backgroundColor="var(--color-surface)"
      textColor="var(--color-ink)"
      style={style}
    />
  );
};

export default StatusBar;