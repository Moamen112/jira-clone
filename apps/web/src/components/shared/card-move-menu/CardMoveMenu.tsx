import { useState } from 'react';
import type { FC } from 'react';
import {
  getCardRole,
  cardPermissions,
  type CardRole,
} from '@jira-clone/shared';
import { Modal } from '../modal/Modal';
import { Text, Badge, Button, Divider, Spinner } from '../../base';
import type { CardMoveMenuProps, CardPosition } from './types';

const LockClosedIcon: FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ArrowDownIcon: FC<{ size?: number }> = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

const ArrowUpIcon: FC<{ size?: number }> = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const CheckmarkCircleIcon: FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ArrowForwardIcon: FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const CardMoveMenu: FC<CardMoveMenuProps> = ({
  visible,
  card,
  columns = [],
  onClose,
  onMoveColumn,
  currentUserId,
  currentUserRole,
  loading = false,
  style,
  className,
  testID,
}) => {
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
    if (!canMove || colId === card.columnId || loading || submittingColumnId) return;

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
      presentation="dialog"
      title={card.key}
      subtitle="Move to Column"
      contentStyle={{
        maxWidth: 480,
        width: '92%',
        ...style,
      }}
      footer={
        <div style={{ width: '100%' }}>
          <Button
            label="Cancel"
            variant="ghost"
            size="sm"
            onPress={onClose}
            style={{ width: '100%' }}
          />
        </div>
      }
    >
      <div
        data-testid={testID}
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Card Summary Box */}
        <div
          style={{
            backgroundColor: 'var(--color-paper)',
            border: '1px solid var(--color-line)',
            borderRadius: 'var(--radius-card)',
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <Text variant="monoKey" bold muted>
              {card.key}
            </Text>
            {currentColumn && (
              <Badge
                label={`Currently: ${currentColumn.title}`}
                variant="accent"
                size="sm"
              />
            )}
          </div>
          <Text variant="bodySmall" bold numberOfLines={2}>
            {card.title}
          </Text>
        </div>

        {/* Permission Banner */}
        {!canMove && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 'var(--radius-card)',
              backgroundColor: 'rgba(234, 179, 8, 0.12)',
              border: '1px solid var(--color-warn, #eab308)',
              color: 'var(--color-warn, #ca8a04)',
            }}
          >
            <LockClosedIcon size={16} />
            <Text variant="caption" style={{ color: 'inherit', fontWeight: 500 }}>
              Only the publisher or assignee can move this card to another column.
            </Text>
          </div>
        )}

        {/* Position Placement Selector */}
        {canMove && (
          <div>
            <Text
              variant="caption"
              muted
              bold
              style={{
                display: 'block',
                marginBottom: 8,
                letterSpacing: '0.6px',
                fontSize: 11,
              }}
            >
              COLUMN PLACEMENT
            </Text>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setTargetPosition('bottom')}
                aria-pressed={targetPosition === 'bottom'}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-pill)',
                  border: `1px solid ${targetPosition === 'bottom' ? 'var(--color-ink)' : 'var(--color-line)'}`,
                  backgroundColor: targetPosition === 'bottom' ? 'var(--color-ink)' : 'var(--color-surface)',
                  color: targetPosition === 'bottom' ? 'var(--color-paper)' : 'var(--color-ink)',
                  fontSize: 12,
                  fontWeight: targetPosition === 'bottom' ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <ArrowDownIcon size={14} />
                <span>Bottom of Column</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetPosition('top')}
                aria-pressed={targetPosition === 'top'}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-pill)',
                  border: `1px solid ${targetPosition === 'top' ? 'var(--color-ink)' : 'var(--color-line)'}`,
                  backgroundColor: targetPosition === 'top' ? 'var(--color-ink)' : 'var(--color-surface)',
                  color: targetPosition === 'top' ? 'var(--color-paper)' : 'var(--color-ink)',
                  fontSize: 12,
                  fontWeight: targetPosition === 'top' ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <ArrowUpIcon size={14} />
                <span>Top of Column</span>
              </button>
            </div>
          </div>
        )}

        <Divider margin={4} />

        {/* Destination Columns List */}
        <div>
          <Text
            variant="caption"
            muted
            bold
            style={{
              display: 'block',
              marginBottom: 8,
              letterSpacing: '0.6px',
              fontSize: 11,
            }}
          >
            DESTINATION COLUMN
          </Text>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sortedColumns.map((col) => {
              const isCurrent = col.id === card.columnId;
              const isSubmitting = submittingColumnId === col.id;
              const isRowDisabled = !canMove || isCurrent || loading || Boolean(submittingColumnId);

              return (
                <button
                  key={col.id}
                  type="button"
                  disabled={isRowDisabled}
                  onClick={() => handleSelectColumn(col.id)}
                  aria-label={`Move to ${col.title}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-card)',
                    border: `1px solid ${isCurrent ? 'var(--color-accent)' : 'var(--color-line)'}`,
                    backgroundColor: isCurrent
                      ? 'var(--color-accent-soft, rgba(37, 99, 235, 0.08))'
                      : 'var(--color-surface)',
                    cursor: isRowDisabled ? 'not-allowed' : 'pointer',
                    opacity: !canMove ? 0.6 : 1,
                    textAlign: 'left',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isRowDisabled) {
                      e.currentTarget.style.backgroundColor = 'var(--color-paper)';
                      e.currentTarget.style.borderColor = 'var(--color-ink-muted)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isRowDisabled) {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                      e.currentTarget.style.borderColor = 'var(--color-line)';
                    }
                  }}
                >
                  {/* Status Indicator Dot & Titles */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: isCurrent ? 'var(--color-accent)' : 'var(--color-ink-muted)',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Text
                        variant="bodySmall"
                        bold={isCurrent}
                        color={isCurrent ? 'var(--color-accent)' : 'var(--color-ink)'}
                      >
                        {col.title}
                      </Text>
                      {isCurrent && (
                        <Text variant="caption" muted style={{ fontSize: 11 }}>
                          Current position
                        </Text>
                      )}
                    </div>
                  </div>

                  {/* Right Status or Arrow */}
                  <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginLeft: 8 }}>
                    {isSubmitting ? (
                      <Spinner size="small" />
                    ) : isCurrent ? (
                      <span style={{ color: 'var(--color-accent)' }}>
                        <CheckmarkCircleIcon size={18} />
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-ink-muted)' }}>
                        <ArrowForwardIcon size={16} />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CardMoveMenu;
