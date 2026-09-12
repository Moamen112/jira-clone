import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { TrashIcon, WarningIcon, InfoIcon } from '../../../../assets/icon';
import { Modal } from '../../base/modal/Modal';
import { Text } from '../../base/typography/Text';
import { Button } from '../../base/button/Button';
import { useTheme } from '../../../tokens';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';

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
  /** Whether tapping the backdrop dismisses the dialog (default: true) */
  dismissOnBackdropPress?: boolean;
  /** Optional custom icon override */
  icon?: React.ReactNode;
  /** Optional extra content rendered below message */
  children?: React.ReactNode;
  /** Custom container style */
  style?: ViewStyle;
  /** Test identifier */
  testID?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
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
  const { colors, isDark } = useTheme();

  // Variant theme configs
  const variantConfig = {
    danger: {
      Icon: TrashIcon,
      iconColor: colors.warn,
      badgeBg: colors.warnSoft,
      badgeBorder: colors.warn,
      confirmVariant: 'danger' as const,
      defaultConfirmText: 'Delete',
    },
    warning: {
      Icon: WarningIcon,
      iconColor: isDark ? '#F6AD55' : '#C05621', // Dark amber
      badgeBg: isDark ? '#4A3215' : '#FEEBC8',   // Light amber
      badgeBorder: isDark ? '#7B4A1D' : '#FBD38D',
      confirmVariant: 'primary' as const,
      defaultConfirmText: 'Proceed',
    },
    info: {
      Icon: InfoIcon,
      iconColor: colors.accent,
      badgeBg: colors.accentSoft,
      badgeBorder: colors.accent,
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
      contentStyle={StyleSheet.flatten([styles.dialogWindow, style])}
      footer={
        <View style={styles.footerRow}>
          <Button
            label={cancelLabel}
            variant="ghost"
            size="md"
            disabled={loading}
            onPress={onCancel}
            style={styles.actionButton}
          />
          <Button
            label={resolvedConfirmLabel}
            variant={variantConfig.confirmVariant}
            size="md"
            loading={loading}
            onPress={onConfirm}
            style={styles.actionButton}
            testID={testID ? `${testID}-confirm-button` : undefined}
          />
        </View>
      }
    >
      <View style={styles.contentContainer} testID={testID}>
        {/* Top Icon Badge */}
        <View
          style={[
            styles.iconBadge,
            {
              backgroundColor: variantConfig.badgeBg,
              borderColor: variantConfig.badgeBorder,
            },
          ]}
        >
          {icon || (
            <variantConfig.Icon
              size={24}
              color={variantConfig.iconColor}
            />
          )}
        </View>

        {/* Optional Entity Key */}
        {itemKey && (
          <Text variant="monoKey" muted style={styles.keyText}>
            {itemKey}
          </Text>
        )}

        {/* Title */}
        <Text variant="heading" bold style={[styles.titleText, { color: colors.ink }]}>
          {title}
        </Text>

        {/* Consequence Message */}
        <Text variant="bodySmall" muted style={[styles.messageText, { color: colors.inkMuted }]}>
          {message}
        </Text>

        {/* Optional Custom Inset Content */}
        {children && <View style={styles.extraContent}>{children}</View>}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  dialogWindow: {
    maxWidth: 420,
    width: '92%',
    alignSelf: 'center',
    borderRadius: radius.sheet,
    overflow: 'hidden',
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  keyText: {
    letterSpacing: 0.5,
    marginBottom: spacing[1],
  },
  titleText: {
    textAlign: 'center',
    marginBottom: spacing[2],
    fontSize: 18,
  },
  messageText: {
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing[2],
  },
  extraContent: {
    width: '100%',
    marginTop: spacing[3],
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
    paddingBottom: spacing[1],
  },
  actionButton: {
    flex: 1,
  },
});

export default ConfirmDialog;
