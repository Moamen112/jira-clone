import { useEffect } from 'react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { Text } from '../../base';

export interface ModalProps {
  /** Visibility toggle */
  visible: boolean;
  /** Callback fired when user requests close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Subtitle or issue key */
  subtitle?: string;
  /** Presentation style: 'bottomSheet' anchors to the bottom, 'dialog' is centered */
  presentation?: 'bottomSheet' | 'dialog';
  /** Max height for the bottom sheet (0-1 ratio of the viewport height) */
  maxHeightRatio?: number;
  /** Primary content */
  children: ReactNode;
  /** Bottom actions bar */
  footer?: ReactNode;
  /** Style override for the content container */
  contentStyle?: CSSProperties;
}

export const Modal: FC<ModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  presentation = 'bottomSheet',
  maxHeightRatio = 0.88,
  children,
  footer,
  contentStyle,
}) => {
  const isSheet = presentation === 'bottomSheet';

  // Close on Escape.
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: isSheet ? 'flex-end' : 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0 }}
      />

      {/* Modal window */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || subtitle || 'Modal'}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-line)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
          ...(isSheet
            ? {
                width: '100%',
                maxHeight: `${Math.round(maxHeightRatio * 100)}%`,
                borderTopLeftRadius: 'var(--radius-sheet)',
                borderTopRightRadius: 'var(--radius-sheet)',
                paddingTop: 8,
                paddingBottom: 16,
              }
            : {
                width: '100%',
                maxWidth: 520,
                maxHeight: '85vh',
                borderRadius: 'var(--radius-sheet)',
                margin: 16,
              }),
          ...contentStyle,
        }}
      >
        {/* Bottom sheet drag handle */}
        {isSheet && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 4 }}>
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--color-line)',
              }}
            />
          </div>
        )}

        {/* Header */}
        {(title || subtitle) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              borderBottom: '1px solid var(--color-line)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              {subtitle && (
                <Text variant="monoKey" muted style={{ display: 'block' }}>
                  {subtitle}
                </Text>
              )}
              {title && (
                <Text variant="heading" bold numberOfLines={1}>
                  {title}
                </Text>
              )}
            </div>
            <button
              type="button"
              aria-label="Close dialog"
              onClick={onClose}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 4,
                fontSize: 18,
                lineHeight: 1,
                color: 'var(--color-ink-muted)',
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Body */}
        <div
          style={{
            padding: 16,
            overflowY: 'auto',
            flex: '1 1 auto',
            minHeight: 0,
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-line)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;