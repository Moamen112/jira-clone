import type { CSSProperties, FC, ReactNode } from 'react';
import { Text, Button } from '../../base';
import type { ButtonVariant } from '../../base';

export interface EmptyStateProps {
  /** Main empty-state message */
  title: string;
  /** Supporting description text */
  description?: string;
  /** Icon element shown in the accent circle */
  icon?: ReactNode;
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
  style?: CSSProperties;
}

export const EmptyState: FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  secondaryActionLabel,
  onSecondaryAction,
  iconContainerColor,
  style,
}) => {
  const hasPrimaryAction = Boolean(actionLabel && onAction);
  const hasSecondaryAction = Boolean(secondaryActionLabel && onSecondaryAction);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBlock: 32,
        paddingInline: 24,
        gap: 12,
        ...style,
      }}
    >
      {icon && (
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 'var(--radius-pill)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: iconContainerColor ?? 'var(--color-accent-soft)',
          }}
        >
          {icon}
        </div>
      )}

      <Text variant="heading" bold align="center">
        {title}
      </Text>

      {description && (
        <Text variant="body" muted align="center" style={{ lineHeight: 22 }}>
          {description}
        </Text>
      )}

      {(hasPrimaryAction || hasSecondaryAction) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
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
        </div>
      )}
    </div>
  );
};

export default EmptyState;