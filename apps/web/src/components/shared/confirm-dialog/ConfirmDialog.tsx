import type { CSSProperties, FC, ReactNode } from 'react';
import { Modal } from '../modal/Modal';
import { Text, Button } from '../../base';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info';

export interface ConfirmDialogProps {
  /** Whether the dialog is visible */
  visible: boolean;
  /** Dialog heading title */
  title: string;
  /** Detailed description or explanation of consequences */
  message: string;
  /** Visual intent: 'danger' (destructive warn), 'warning' (amber warning), 'info' (accent) */
  variant?: ConfirmDialogVariant;
  /** Optional secondary entity key (e.g., "FIELD-1") */
  itemKey?: string;
  /** Confirm button text (default: "Delete" for danger, "Confirm" for others) */
  confirmLabel?: string;
  /** Cancel button text (default: "Cancel") */
  cancelLabel?: string;
  /** Callback fired when user confirms */
  onConfirm: () => void | Promise<void>;
  /** Callback fired when user cancels or dismisses */
  onCancel: () => void;
  /** Loading state for confirm button during async operations */
  loading?: boolean;
  /** Whether clicking the backdrop dismisses the dialog (default: true) */
  dismissOnBackdropPress?: boolean;
  /** Optional custom icon override */
  icon?: ReactNode;
  /** Optional extra content rendered below message */
  children?: ReactNode;
  /** Custom container style */
  style?: CSSProperties;
  /** Test identifier */
  testID?: string;
}

const TrashIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const AlertTriangleIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const InfoIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  variant = 'danger',
  itemKey,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  dismissOnBackdropPress = true,
  icon,
  children,
  style,
  testID,
}) => {
  const variantConfig = {
    danger: {
      Icon: TrashIcon,
      iconColor: 'var(--color-warn)',
      badgeBg: 'var(--color-warn-soft)',
      badgeBorder: 'var(--color-warn)',
      confirmVariant: 'danger' as const,
      defaultConfirmText: 'Delete',
    },
    warning: {
      Icon: AlertTriangleIcon,
      iconColor: 'var(--color-warn)',
      badgeBg: 'var(--color-warn-soft)',
      badgeBorder: 'var(--color-warn)',
      confirmVariant: 'primary' as const,
      defaultConfirmText: 'Proceed',
    },
    info: {
      Icon: InfoIcon,
      iconColor: 'var(--color-accent)',
      badgeBg: 'var(--color-accent-soft)',
      badgeBorder: 'var(--color-accent)',
      confirmVariant: 'primary' as const,
      defaultConfirmText: 'Confirm',
    },
  }[variant];

  const resolvedConfirmLabel = confirmLabel || variantConfig.defaultConfirmText;

  const handleClose = () => {
    if (dismissOnBackdropPress && !loading) {
      onCancel();
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      presentation="dialog"
      contentStyle={{
        maxWidth: 420,
        width: '92%',
        ...style,
      }}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
          <Button
            label={cancelLabel}
            variant="ghost"
            size="sm"
            disabled={loading}
            onPress={onCancel}
          />
          <Button
            label={resolvedConfirmLabel}
            variant={variantConfig.confirmVariant}
            size="sm"
            loading={loading}
            onPress={onConfirm}
          />
        </div>
      }
    >
      <div
        data-testid={testID}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '8px 4px',
        }}
      >
        {/* Top Icon Badge */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-pill)',
            border: `1px solid ${variantConfig.badgeBorder}`,
            backgroundColor: variantConfig.badgeBg,
            color: variantConfig.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          {icon || <variantConfig.Icon size={24} />}
        </div>

        {/* Optional Entity Key */}
        {itemKey && (
          <Text variant="monoKey" muted style={{ display: 'block', marginBottom: 6 }}>
            {itemKey}
          </Text>
        )}

        {/* Title */}
        <Text variant="heading" bold style={{ display: 'block', marginBottom: 8 }}>
          {title}
        </Text>

        {/* Message */}
        <Text variant="bodySmall" muted style={{ display: 'block', lineHeight: 20 }}>
          {message}
        </Text>

        {children && <div style={{ width: '100%', marginTop: 16 }}>{children}</div>}
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
