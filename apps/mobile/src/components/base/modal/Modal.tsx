import React from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../../tokens';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';
import { Text } from '../typography/Text';
import { IconButton } from '../icon-button/IconButton';

export interface ModalProps {
  /** Visibility toggle */
  visible: boolean;
  /** Callback fired when user requests close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Subtitle or issue key */
  subtitle?: string;
  /** Presentation style: 'bottomSheet' slides from bottom, 'dialog' is centered */
  presentation?: 'bottomSheet' | 'dialog';
  /** Max height percentage for bottom sheet (default 0.85) */
  maxHeightRatio?: number;
  /** Primary content */
  children: React.ReactNode;
  /** Bottom actions bar */
  footer?: React.ReactNode;
  /** Style override for content container */
  contentStyle?: ViewStyle;
}

export const Modal: React.FC<ModalProps> = ({
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
  const { colors } = useTheme();
  const isSheet = presentation === 'bottomSheet';

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={isSheet ? 'slide' : 'fade'}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Modal Window */}
        <View
          style={[
            isSheet ? styles.bottomSheet : styles.dialog,
            {
              backgroundColor: colors.surface,
              borderColor: colors.line,
            },
            isSheet && { maxHeight: `${Math.round(maxHeightRatio * 100)}%` as any },
            contentStyle,
          ]}
        >
          {/* Bottom Sheet Drag Indicator Handle */}
          {isSheet && (
            <View style={styles.handleContainer}>
              <View style={[styles.handleBar, { backgroundColor: colors.line }]} />
            </View>
          )}

          {/* Modal Header */}
          {(title || subtitle) && (
            <View style={[styles.header, { borderBottomColor: colors.line }]}>
              <View style={styles.headerTitles}>
                {subtitle && (
                  <Text variant="monoKey" muted>
                    {subtitle}
                  </Text>
                )}
                {title && (
                  <Text variant="heading" bold numberOfLines={1}>
                    {title}
                  </Text>
                )}
              </View>

              <IconButton
                variant="ghost"
                size="sm"
                icon={<Text variant="body" bold color={colors.inkMuted}>✕</Text>}
                onPress={onClose}
              />
            </View>
          )}

          {/* Body Content */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>

          {/* Optional Footer */}
          {footer && (
            <View style={[styles.footer, { borderTopColor: colors.line }]}>
              {footer}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  bottomSheet: {
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingTop: spacing[2],
    paddingBottom: Platform.OS === 'ios' ? spacing[6] : spacing[4],
    borderWidth: 1,
  },
  dialog: {
    borderRadius: radius.sheet,
    marginHorizontal: spacing[4],
    marginBottom: 'auto',
    marginTop: 'auto',
    maxHeight: '80%',
    borderWidth: 1,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing[1],
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: radius.pill,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
  },
  headerTitles: {
    flex: 1,
    marginRight: spacing[2],
  },
  scrollBody: {
    flexGrow: 0,
  },
  bodyContent: {
    padding: spacing[4],
  },
  footer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
  },
});

export default Modal;

