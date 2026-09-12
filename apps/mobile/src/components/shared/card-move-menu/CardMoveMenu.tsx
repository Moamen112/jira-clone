import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import {
  LockClosedIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CheckmarkCircleIcon,
  ArrowForwardIcon,
} from '../../../../assets/icon';
import {
  Card as CardType,
  BoardColumn,
  CardRole,
  getCardRole,
  cardPermissions,
} from '@jira-clone/shared';
import { Modal } from '../../base/modal/Modal';
import { Text } from '../../base/typography/Text';
import { Badge } from '../../base/badge/Badge';
import { Button } from '../../base/button/Button';
import { Divider } from '../../base/divider/Divider';
import { useTheme } from '../../../tokens';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';

export type CardPosition = 'top' | 'bottom';

export interface CardMoveMenuProps {
  /** Visibility toggle */
  visible: boolean;
  /** The target card to move */
  card: CardType | null;
  /** Available columns on the board */
  columns: BoardColumn[];
  /** Close callback */
  onClose: () => void;
  /** Callback fired when a column is selected */
  onMoveColumn: (
    targetColumnId: string,
    card: CardType,
    position: CardPosition
  ) => void | Promise<void>;
  /** Current user ID for permission check */
  currentUserId?: string;
  /** Current user role override */
  currentUserRole?: CardRole;
  /** Loading state during move operation */
  loading?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Test identifier */
  testID?: string;
}

export const CardMoveMenu: React.FC<CardMoveMenuProps> = ({
  visible,
  card,
  columns = [],
  onClose,
  onMoveColumn,
  currentUserId,
  currentUserRole,
  loading = false,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const [targetPosition, setTargetPosition] = useState<CardPosition>('bottom');
  const [submittingColumnId, setSubmittingColumnId] = useState<string | null>(null);

  if (!card) return null;

  // Resolve user permissions
  const role: CardRole =
    currentUserRole ||
    (currentUserId ? getCardRole(currentUserId, card) : 'viewer');
  const canMove = cardPermissions.canMoveStatus(role);

  const currentColumn = columns.find((c) => c.id === card.columnId);
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  const handleSelectColumn = async (colId: string) => {
    if (!canMove || colId === card.columnId || loading) return;

    try {
      setSubmittingColumnId(colId);
      await onMoveColumn(colId, card, targetPosition);
      onClose();
    } finally {
      setSubmittingColumnId(null);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      presentation="bottomSheet"
      title={card.key}
      subtitle="Move to Column"
      maxHeightRatio={0.75}
      contentStyle={style}
      footer={
        <View style={styles.footerActions}>
          <Button
            label="Cancel"
            variant="ghost"
            size="sm"
            onPress={onClose}
            style={{ width: '100%' }}
          />
        </View>
      }
    >
      <View style={styles.content} testID={testID}>
        {/* Card Summary Card */}
        <View style={[styles.cardPreview, { backgroundColor: colors.paper, borderColor: colors.line }]}>
          <View style={styles.previewHeader}>
            <Text variant="monoKey" bold muted style={styles.keyText}>
              {card.key}
            </Text>
            {currentColumn && (
              <Badge
                label={`Currently: ${currentColumn.title}`}
                variant="accent"
                size="sm"
              />
            )}
          </View>
          <Text variant="bodySmall" bold numberOfLines={2} style={[styles.cardTitle, { color: colors.ink }]}>
            {card.title}
          </Text>
        </View>

        {/* Permission Notice */}
        {!canMove && (
          <View style={[styles.permissionBanner, { backgroundColor: colors.warnSoft }]}>
            <LockClosedIcon
              size={16}
              color={colors.warn}
            />
            <Text variant="caption" style={[styles.permissionText, { color: colors.warn }]}>
              Only the publisher or assignee can move this card to another column.
            </Text>
          </View>
        )}

        {/* Position Placement Selector */}
        {canMove && (
          <View style={styles.positionSection}>
            <Text variant="caption" muted style={styles.sectionLabel}>
              COLUMN PLACEMENT
            </Text>
            <View style={styles.positionPillRow}>
              <Pressable
                onPress={() => setTargetPosition('bottom')}
                style={[
                  styles.positionPill,
                  { backgroundColor: colors.surface, borderColor: colors.line },
                  targetPosition === 'bottom' && { backgroundColor: colors.ink, borderColor: colors.ink },
                ]}
              >
                <ArrowDownIcon
                  size={14}
                  color={
                    targetPosition === 'bottom'
                      ? colors.paper
                      : colors.inkMuted
                  }
                />
                <Text
                  variant="caption"
                  bold={targetPosition === 'bottom'}
                  style={{
                    color:
                      targetPosition === 'bottom'
                        ? colors.paper
                        : colors.ink,
                  }}
                >
                  Bottom of Column
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setTargetPosition('top')}
                style={[
                  styles.positionPill,
                  { backgroundColor: colors.surface, borderColor: colors.line },
                  targetPosition === 'top' && { backgroundColor: colors.ink, borderColor: colors.ink },
                ]}
              >
                <ArrowUpIcon
                  size={14}
                  color={
                    targetPosition === 'top'
                      ? colors.paper
                      : colors.inkMuted
                  }
                />
                <Text
                  variant="caption"
                  bold={targetPosition === 'top'}
                  style={{
                    color:
                      targetPosition === 'top'
                        ? colors.paper
                        : colors.ink,
                  }}
                >
                  Top of Column
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        <Divider style={{ marginVertical: spacing[3] }} />

        {/* Destination Columns List */}
        <View style={styles.columnsSection}>
          <Text variant="caption" muted style={styles.sectionLabel}>
            DESTINATION COLUMN
          </Text>

          <View style={styles.columnList}>
            {sortedColumns.map((col) => {
              const isCurrent = col.id === card.columnId;
              const isSubmitting = submittingColumnId === col.id;

              return (
                <Pressable
                  key={col.id}
                  disabled={!canMove || isCurrent || loading || isSubmitting}
                  onPress={() => handleSelectColumn(col.id)}
                  style={({ pressed }) => [
                    styles.columnRow,
                    { backgroundColor: colors.surface, borderColor: colors.line },
                    isCurrent && { backgroundColor: colors.accentSoft, borderColor: colors.accent },
                    pressed && canMove && !isCurrent && { backgroundColor: colors.paper },
                    !canMove && styles.columnRowDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Move to ${col.title}`}
                >
                  {/* Status Indicator Dot */}
                  <View style={styles.columnLeft}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: colors.inkMuted },
                        isCurrent && { backgroundColor: colors.accent },
                      ]}
                    />
                    <View style={styles.columnTitles}>
                      <Text
                        variant="bodySmall"
                        bold={isCurrent}
                        style={[
                          styles.columnTitleText,
                          { color: colors.ink },
                          isCurrent && { color: colors.accent },
                        ]}
                      >
                        {col.title}
                      </Text>
                      {isCurrent && (
                        <Text variant="caption" muted style={{ fontSize: 11 }}>
                          Current position
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Right Status / Arrow Icon */}
                  <View style={styles.columnRight}>
                    {isCurrent ? (
                      <CheckmarkCircleIcon
                        size={18}
                        color={colors.accent}
                      />
                    ) : (
                      <ArrowForwardIcon
                        size={16}
                        color={colors.inkMuted}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing[4],
  },
  cardPreview: {
    borderRadius: radius.card,
    padding: spacing[3],
    marginBottom: spacing[3],
    borderWidth: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  keyText: {
    letterSpacing: 0.5,
  },
  cardTitle: {
    lineHeight: 18,
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[2],
    borderRadius: radius.input,
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  permissionText: {
    flex: 1,
    lineHeight: 16,
  },
  sectionLabel: {
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: spacing[2],
  },
  positionSection: {
    marginBottom: spacing[1],
  },
  positionPillRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  positionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.pill,
    borderWidth: 1,
    gap: spacing[1],
  },
  positionPillActive: {},
  columnsSection: {
    marginTop: spacing[1],
  },
  columnList: {
    gap: spacing[2],
  },
  columnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.card,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
  },
  columnRowCurrent: {},
  columnRowPressed: {
    opacity: 0.8,
  },
  columnRowDisabled: {
    opacity: 0.5,
  },
  columnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDotActive: {},
  columnTitles: {
    flex: 1,
  },
  columnTitleText: {},
  columnRight: {
    marginLeft: spacing[2],
  },
  footerActions: {
    paddingVertical: spacing[1],
  },
});

export default CardMoveMenu;
