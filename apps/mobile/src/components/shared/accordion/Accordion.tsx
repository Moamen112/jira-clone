import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  ViewStyle,
} from 'react-native';
import { ChevronDownIcon } from '../../../../assets/icon';
import { Text, Badge } from '../../base';
import { useTheme, spacing, radius } from '../../../tokens';

export interface AccordionProps {
  /** Section header title */
  title: string;
  /** Optional subtitle or description text */
  subtitle?: string;
  /** Optional leading icon */
  icon?: React.ReactNode;
  /** Optional count or status badge label */
  badge?: string | number;
  /** Badge visual variant */
  badgeVariant?: 'default' | 'accent' | 'warn' | 'neutral' | 'mono';
  /** Controlled expansion state */
  expanded?: boolean;
  /** Initial expansion state for uncontrolled usage (default: false) */
  defaultExpanded?: boolean;
  /** Callback fired when expanded state changes */
  onToggle?: (expanded: boolean) => void;
  /** Extra element rendered on the right side before the chevron */
  headerRight?: React.ReactNode;
  /** Whether the accordion is disabled */
  disabled?: boolean;
  /** Whether to render with card background and border (default: true) */
  bordered?: boolean;
  /** Content revealed when open */
  children: React.ReactNode;
  /** Container style override */
  style?: ViewStyle;
  /** Header style override */
  headerStyle?: ViewStyle;
  /** Content style override */
  contentStyle?: ViewStyle;
  /** Test ID for automated tests */
  testID?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
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
  const { colors } = useTheme();
  const isControlled = controlledExpanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  // Animated rotation for chevron icon
  const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, rotateAnim]);

  const handleToggle = () => {
    if (disabled) return;
    const nextState = !isExpanded;
    if (!isControlled) {
      setInternalExpanded(nextState);
    }
    onToggle?.(nextState);
  };

  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        bordered && {
          backgroundColor: colors.surface,
          borderColor: colors.line,
          borderWidth: 1,
          borderRadius: radius.card,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {/* Accordion Header */}
      <Pressable
        onPress={handleToggle}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded, disabled }}
        accessibilityLabel={`${title}, accordion`}
        style={({ pressed }) => [
          styles.header,
          bordered && styles.headerBordered,
          {
            backgroundColor: pressed && !disabled ? colors.surface : 'transparent',
          },
          isExpanded && bordered && { borderBottomColor: colors.line, borderBottomWidth: 1 },
          headerStyle,
        ]}
      >
        <View style={styles.headerLeft}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Text variant="subheading" bold style={{ color: colors.ink }}>
                {title}
              </Text>
              {badge !== undefined && (
                <Badge
                  label={String(badge)}
                  variant={badgeVariant}
                  size="sm"
                />
              )}
            </View>
            {subtitle && (
              <Text variant="caption" muted style={{ marginTop: 2 }}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.headerRight}>
          {headerRight}
          <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
            <ChevronDownIcon
              size={18}
              color={disabled ? colors.inkMuted : colors.ink}
            />
          </Animated.View>
        </View>
      </Pressable>

      {/* Accordion Content */}
      {isExpanded && (
        <View
          style={[
            styles.content,
            bordered && styles.contentBordered,
            contentStyle,
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
  },
  headerBordered: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing[2],
  },
  iconContainer: {
    marginRight: spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  content: {
    paddingVertical: spacing[3],
  },
  contentBordered: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
});

export default Accordion;
