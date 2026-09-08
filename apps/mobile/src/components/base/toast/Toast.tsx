import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  Pressable,
  ViewStyle,
  Platform,
} from 'react-native';
import { colors } from '../../../tokens/colors';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';
import { Text } from '../typography/Text';

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
  style?: ViewStyle;
}

export const Toast: React.FC<ToastProps> = ({
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
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      translateY.setValue(position === 'top' ? -100 : 100);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          handleDismiss();
        }, duration);
      }
    } else if (shouldRender) {
      handleDismiss();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShouldRender(false);
      onDismiss?.();
    });
  };

  if (!shouldRender) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: colors.light.accentSoft,
          textColor: colors.light.accent,
          borderColor: colors.light.accent,
          icon: '✓',
        };
      case 'warn':
        return {
          bg: colors.light.warnSoft,
          textColor: colors.light.warn,
          borderColor: colors.light.warn,
          icon: '⚠',
        };
      case 'info':
      default:
        return {
          bg: colors.light.surface,
          textColor: colors.light.ink,
          borderColor: colors.light.line,
          icon: 'ℹ',
        };
    }
  };

  const v = getVariantStyles();

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        position === 'top' ? styles.positionTop : styles.positionBottom,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: v.bg,
            borderColor: v.borderColor,
          },
          style,
        ]}
      >
        <Text variant="bodySmall" bold color={v.textColor} style={styles.icon}>
          {v.icon}
        </Text>

        <Text
          variant="bodySmall"
          color={v.textColor}
          style={styles.message}
          numberOfLines={2}
        >
          {message}
        </Text>

        {actionLabel && onAction && (
          <Pressable onPress={onAction} style={styles.actionButton}>
            <Text variant="bodySmall" bold color={colors.light.accent}>
              {actionLabel}
            </Text>
          </Pressable>
        )}

        <Pressable onPress={handleDismiss} hitSlop={8} style={styles.closeButton}>
          <Text variant="caption" bold color={colors.light.inkMuted}>
            ✕
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    alignItems: 'center',
    zIndex: 9999,
  },
  positionTop: {
    top: Platform.OS === 'ios' ? 50 : 20,
  },
  positionBottom: {
    bottom: Platform.OS === 'ios' ? 40 : 24,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: radius.card,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: spacing[2],
  },
  message: {
    flex: 1,
  },
  actionButton: {
    marginLeft: spacing[2],
    paddingHorizontal: spacing[2],
  },
  closeButton: {
    marginLeft: spacing[2],
  },
});

export default Toast;
