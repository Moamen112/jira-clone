import { useState } from 'react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { Text, Badge, type BadgeVariant } from '../../base';

export interface AccordionProps {
  /** Section header title */
  title: string;
  /** Optional subtitle or description text */
  subtitle?: string;
  /** Optional leading icon */
  icon?: ReactNode;
  /** Optional count or status badge label */
  badge?: string | number;
  /** Badge visual variant */
  badgeVariant?: BadgeVariant;
  /** Controlled expansion state */
  expanded?: boolean;
  /** Initial expansion state for uncontrolled usage (default: false) */
  defaultExpanded?: boolean;
  /** Callback fired when expanded state changes */
  onToggle?: (expanded: boolean) => void;
  /** Extra element rendered on the right side before the chevron */
  headerRight?: ReactNode;
  /** Whether the accordion is disabled */
  disabled?: boolean;
  /** Whether to render with card background and border (default: true) */
  bordered?: boolean;
  /** Content revealed when open */
  children: ReactNode;
  /** Container style override */
  style?: CSSProperties;
  /** Header style override */
  headerStyle?: CSSProperties;
  /** Content style override */
  contentStyle?: CSSProperties;
  /** Test ID for automated tests */
  testID?: string;
}

const ChevronDownIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const Accordion: FC<AccordionProps> = ({
  title,
  subtitle,
  icon,
  badge,
  badgeVariant = 'neutral',
  expanded: controlledExpanded,
  defaultExpanded = false,
  onToggle,
  headerRight,
  disabled = false,
  bordered = true,
  children,
  style,
  headerStyle,
  contentStyle,
  testID,
}) => {
  const isControlled = controlledExpanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    if (disabled) return;
    const nextState = !isExpanded;
    if (!isControlled) {
      setInternalExpanded(nextState);
    }
    onToggle?.(nextState);
  };

  return (
    <div
      data-testid={testID}
      style={{
        overflow: 'hidden',
        ...(bordered
          ? {
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-line)',
              borderRadius: 'var(--radius-card)',
            }
          : {}),
        opacity: disabled ? 0.6 : 1,
        transition: 'border-color 150ms ease, background-color 150ms ease',
        ...style,
      }}
    >
      {/* Accordion Header */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-disabled={disabled}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: bordered ? '12px 16px' : '12px 0',
          border: 'none',
          borderBottom: isExpanded && bordered ? '1px solid var(--color-line)' : 'none',
          background: 'transparent',
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          boxSizing: 'border-box',
          transition: 'background-color 150ms ease, border-color 150ms ease',
          ...headerStyle,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, gap: 12 }}>
          {icon && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-ink)',
                flexShrink: 0,
              }}
            >
              {icon}
            </span>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Text variant="subheading" bold color="var(--color-ink)">
                {title}
              </Text>
              {badge !== undefined && (
                <Badge label={String(badge)} variant={badgeVariant} size="sm" />
              )}
            </div>
            {subtitle && (
              <Text variant="caption" muted style={{ display: 'block', marginTop: 2 }}>
                {subtitle}
              </Text>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
          {headerRight && <span>{headerRight}</span>}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: disabled ? 'var(--color-ink-muted)' : 'var(--color-ink)',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 200ms cubic-bezier(0, 0, 0.2, 1)',
            }}
          >
            <ChevronDownIcon size={18} />
          </span>
        </div>
      </button>

      {/* Collapsible Content Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: isExpanded ? '1fr' : '0fr',
          transition: 'grid-template-rows 200ms cubic-bezier(0, 0, 0.2, 1)',
        }}
      >
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          <div
            style={{
              padding: bordered ? '16px' : '12px 0',
              ...contentStyle,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accordion;
