import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FC } from 'react';
import { Text } from '../../base';

export type ToastVariant = 'info' | 'success' | 'warn';

export interface ToastProps {
  /** Visibility toggle */
  visible: boolean;
  /** Toast message */
  message: string;
  /** Visual variant */
  variant?: ToastVariant;
  /** Position on screen */
  position?: 'top' | 'bottom';
  /** Auto dismiss duration in milliseconds (0 to disable) */
  duration?: number;
  /** Dismiss callback */
  onDismiss?: () => void;
  /** Action label (e.g. 'Undo') */
  actionLabel?: string;
  /** Action callback */
  onAction?: () => void;
  /** Style override */
  style?: CSSProperties;
}

const EXIT_MS = 180;

const VARIANT_STYLES: Record<
  ToastVariant,
  { bg: string; text: string; border: string; icon: string }
> = {
  success: {
    bg: 'var(--color-accent-soft)',
    text: 'var(--color-accent)',
    border: 'var(--color-accent)',
    icon: '✓',
  },
  warn: {
    bg: 'var(--color-warn-soft)',
    text: 'var(--color-warn)',
    border: 'var(--color-warn)',
    icon: '⚠',
  },
  info: {
    bg: 'var(--color-surface)',
    text: 'var(--color-ink)',
    border: 'var(--color-line)',
    icon: 'ℹ',
  },
};

export const Toast: FC<ToastProps> = ({
  visible,
  message,
  variant = 'info',
  position = 'bottom',
  duration = 3500,
  onDismiss,
  actionLabel,
  onAction,
  style,
}) => {
  const [shouldRender, setShouldRender] = useState(visible);
  const [entered, setEntered] = useState(false);
  const dismissTimer = useRef<number | null>(null);
  const exitTimer = useRef<number | null>(null);
  const frame = useRef<number | null>(null);
  const v = VARIANT_STYLES[variant];

  const handleExit = () => {
    setEntered(false);
    if (exitTimer.current) window.clearTimeout(exitTimer.current);
    exitTimer.current = window.setTimeout(() => {
      setShouldRender(false);
      onDismiss?.();
    }, EXIT_MS);
  };

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      frame.current = requestAnimationFrame(() => setEntered(true));
      if (duration > 0) {
        if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
        dismissTimer.current = window.setTimeout(handleExit, duration);
      }
    } else if (shouldRender) {
      handleExit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    return () => {
      if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
      if (exitTimer.current) window.clearTimeout(exitTimer.current);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  if (!shouldRender) return null;

  const motion: CSSProperties = {
    transition: `opacity ${EXIT_MS}ms ease, transform ${EXIT_MS}ms ease`,
    opacity: entered ? 1 : 0,
    transform: entered
      ? 'translateY(0)'
      : position === 'top'
        ? 'translateY(-24px)'
        : 'translateY(24px)',
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        ...(position === 'top' ? { top: 20 } : { bottom: 24 }),
      }}
    >
      <div
        role="status"
        aria-live="polite"
        style={{
          ...motion,
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          maxWidth: 520,
          paddingBlock: 12,
          paddingInline: 16,
          borderRadius: 'var(--radius-card)',
          border: `1px solid ${v.border}`,
          backgroundColor: v.bg,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
          pointerEvents: 'auto',
          ...style,
        }}
      >
        <Text variant="bodySmall" bold color={v.text} style={{ marginRight: 8 }}>
          {v.icon}
        </Text>

        <Text
          variant="bodySmall"
          color={v.text}
          numberOfLines={2}
          style={{ flex: 1, minWidth: 0 }}
        >
          {message}
        </Text>

        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            style={{
              marginLeft: 8,
              paddingInline: 8,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              font: 'inherit',
            }}
          >
            <Text variant="bodySmall" bold color="var(--color-accent)">
              {actionLabel}
            </Text>
          </button>
        )}

        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={handleExit}
          style={{
            marginLeft: 8,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 2,
          }}
        >
          <Text variant="caption" bold color="var(--color-ink-muted)">
            ✕
          </Text>
        </button>
      </div>
    </div>
  );
};

export default Toast;