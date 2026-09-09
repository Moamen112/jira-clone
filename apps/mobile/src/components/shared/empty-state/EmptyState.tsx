import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, Button, ButtonVariant } from '../../base';
import { colors } from '../../../tokens/colors';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';

export interface EmptyStateProps {
  /** Main empty-state message */
  title: string;
  /** Supporting description text */
  description?: string;
  /** Icon element shown in the accent circle */
  icon?: React.ReactNode;
  /** Primary call-to-action label (rendered with onAction) */
  actionLabel?: string;
  /** Primary call-to-action handler */
  onAction?: () => void;
  /** Visual variant for the primary action button */
  actionVariant?: ButtonVariant;
  /** Secondary call-to-action label (rendered with onSecondaryAction) */
  secondaryActionLabel?: string;
  /** Secondary call-to-action handler */
  onSecondaryAction?: () => void;
  /** Icon container background color override */
  iconContainerColor?: string;
  /** Container style override */
  style?: ViewStyle;
}

const ICON_CONTAINER_SIZE = 72;

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  secondaryActionLabel,
  onSecondaryAction,
  iconContainerColor = colors.light.accentSoft,
  style,
}) => {
  const hasPrimaryAction = Boolean(actionLabel && onAction);
  const hasSecondaryAction = Boolean(secondaryActionLabel && onSecondaryAction);

  return (
    <View style={[styles.container, style]}>
      {icon && (
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: iconContainerColor },
          ]}
        >
          {icon}
        </View>
      )}

      <Text variant="heading" bold align="center">
        {title}
      </Text>

      {description && (
        <Text variant="body" muted align="center" style={styles.description}>
          {description}
        </Text>
      )}

      {(hasPrimaryAction || hasSecondaryAction) && (
        <View style={styles.actionsRow}>
          {hasSecondaryAction && (
            <Button
              label={secondaryActionLabel}
              variant="secondary"
              size="sm"
              onPress={onSecondaryAction}
            />
          )}
          {hasPrimaryAction && (
            <Button
              label={actionLabel}
              variant={actionVariant}
              size="sm"
              onPress={onAction}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[5],
    gap: spacing[3],
  },
  iconContainer: {
    width: ICON_CONTAINER_SIZE,
    height: ICON_CONTAINER_SIZE,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
});

export default EmptyState;