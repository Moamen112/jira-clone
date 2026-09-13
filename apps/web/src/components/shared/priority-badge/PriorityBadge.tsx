import type { CSSProperties, FC } from 'react';
import { Badge, Text } from '../../base';
import type { CardPriority } from '@jira-clone/shared';

export type PriorityBadgeSize = 'sm' | 'md';

export interface PriorityBadgeProps {
  /** Card priority level */
  priority: CardPriority;
  /** Size tier: sm = compact, md = standard */
  size?: PriorityBadgeSize;
  /** Show the priority arrow icon next to the label */
  withIcon?: boolean;
  /** Show the priority label text */
  showLabel?: boolean;
  /** Container style override */
  style?: CSSProperties;
}

interface PriorityMeta {
  label: string;
  color: string;
  bg: string;
  arrow: string;
}

const PRIORITY_META: Record<CardPriority, PriorityMeta> = {
  lowest: {
    label: 'Lowest',
    color: 'var(--color-ink-muted)',
    bg: 'var(--color-surface)',
    arrow: '↓',
  },
  low: {
    label: 'Low',
    color: 'var(--color-accent)',
    bg: 'var(--color-accent-soft)',
    arrow: '→',
  },
  medium: {
    label: 'Medium',
    color: 'var(--color-warn)',
    bg: 'var(--color-warn-soft)',
    arrow: '→',
  },
  high: {
    label: 'High',
    color: 'var(--color-warn)',
    bg: 'var(--color-warn-soft)',
    arrow: '↑',
  },
  highest: {
    label: 'Highest',
    color: 'var(--color-warn)',
    bg: 'var(--color-warn-soft)',
    arrow: '⤴',
  },
};

export const PriorityBadge: FC<PriorityBadgeProps> = ({
  priority,
  size = 'sm',
  withIcon = true,
  showLabel = true,
  style,
}) => {
  const meta = PRIORITY_META[priority];

  return (
    <Badge
      label={showLabel ? meta.label : ''}
      variant="default"
      size={size}
      icon={
        withIcon ? (
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: meta.color,
              }}
            />
            <Text
              variant="caption"
              bold
              color={meta.color}
              style={{ marginLeft: 3, fontSize: 11, lineHeight: 14 }}
            >
              {meta.arrow}
            </Text>
          </span>
        ) : undefined
      }
      backgroundColor={meta.bg}
      textColor={meta.color}
      style={!showLabel ? { minWidth: size === 'md' ? 28 : 20 } : style}
    />
  );
};

export default PriorityBadge;