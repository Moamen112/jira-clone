import { useState } from 'react';
import type { CSSProperties, FC, ReactNode } from 'react';
import type { BoardColumn as BoardColumnType, Card as CardType, User } from '@jira-clone/shared';
import { Text, Badge, IconButton } from '../../base';
import { Card } from '../card/Card';
import { CreateCardInline } from '../create-card-inline';

export const DEFAULT_COLUMN_WIDTH = 300;

export interface BoardColumnProps {
  /** The board column metadata */
  column: BoardColumnType;
  /** Cards belonging to this column */
  cards: CardType[];
  /** Available workspace members */
  users?: User[];
  /** Current viewing user ID */
  currentUserId?: string;
  /** Card press handler (opens detail) */
  onCardPress?: (card: CardType) => void;
  /** Quick move handler */
  onCardMove?: (card: CardType, toColumnId?: string) => void;
  /** Card single assignee change callback */
  onCardAssigneeChange?: (userId: string | null, card: CardType) => void;
  /** Card multi-assignees change callback */
  onCardAssigneesChange?: (userIds: string[], card: CardType) => void;
  /** Quick inline card creation callback */
  onCreateCard?: (title: string, columnId: string) => void | Promise<void>;
  /** Custom render prop for card items */
  renderCard?: (card: CardType) => ReactNode;
  /** Whether card creation is allowed (default: true) */
  canCreateCard?: boolean;
  /** Custom column width (default: 300px) */
  columnWidth?: number | string;
  /** Custom container style */
  style?: CSSProperties;
  /** Test identifier */
  testID?: string;
}

const AddIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const LayersIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);


export const BoardColumn: FC<BoardColumnProps> = ({
  column,
  cards = [],
  users = [],
  onCardPress,
  onCardMove,
  onCardAssigneeChange,
  onCardAssigneesChange,
  onCreateCard,
  renderCard,
  canCreateCard = true,
  columnWidth = DEFAULT_COLUMN_WIDTH,
  style,
  testID,
}) => {
  const [showInlineCreate, setShowInlineCreate] = useState(false);

  // Column accent color matching Fieldnotes status semantics
  const columnColor =
    column.color ||
    (column.id.includes('done')
      ? '#10B981'
      : column.id.includes('review')
        ? 'var(--color-accent)'
        : column.id.includes('progress')
          ? '#3B82F6'
          : 'var(--color-ink-muted)');


  return (
    <div
      data-testid={testID}
      style={{
        width: columnWidth,
        minWidth: columnWidth,
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-line)',
        borderRadius: 'var(--radius-card)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxSizing: 'border-box',
        alignSelf: 'flex-start',
        ...style,
      }}
    >
      {/* Column Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--color-line)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 'var(--radius-pill)',
              backgroundColor: columnColor,
              flexShrink: 0,
            }}
          />
          <Text variant="bodySmall" bold numberOfLines={1} style={{ flex: 1 }}>
            {column.title}
          </Text>
          <Badge label={String(cards.length)} variant="neutral" size="sm" />
        </div>

        {canCreateCard && onCreateCard && !showInlineCreate && (
          <IconButton
            variant="ghost"
            size="sm"
            label={`Add card to ${column.title}`}
            icon={<AddIcon size={16} />}
            onPress={() => setShowInlineCreate(true)}
          />
        )}
      </div>

      {/* Cards List Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {cards.map((card) => {
          if (renderCard) return renderCard(card);

          return (
            <Card
              key={card.id}
              card={card}
              users={users}
              onPress={onCardPress}
              onMove={onCardMove ? () => onCardMove(card) : undefined}
              onAssigneeChange={onCardAssigneeChange}
              onAssigneesChange={onCardAssigneesChange}
            />
          );
        })}

        {/* Empty Column State */}
        {cards.length === 0 && !showInlineCreate && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 12px',
              backgroundColor: 'var(--color-paper)',
              border: '1px dashed var(--color-line)',
              borderRadius: 'var(--radius-card)',
              textAlign: 'center',
              gap: '6px',
            }}
          >
            <span style={{ color: 'var(--color-ink-muted)' }}>
              <LayersIcon size={24} />
            </span>
            <Text variant="caption" muted>
              No cards in {column.title}
            </Text>
            {canCreateCard && onCreateCard && (
              <button
                type="button"
                onClick={() => setShowInlineCreate(true)}
                style={{
                  marginTop: 4,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-accent)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Add a card
              </button>
            )}
          </div>
        )}

        {/* Inline Card Creation */}
        {canCreateCard && onCreateCard && (
          <CreateCardInline
            columnId={column.id}
            placeholder="What needs to be done?"
            autoExpand={showInlineCreate}
            onCreate={async ({ title }) => {
              await onCreateCard(title, column.id);
              setShowInlineCreate(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BoardColumn;
