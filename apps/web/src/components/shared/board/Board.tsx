import { useState } from 'react';
import type { CSSProperties, FC, ReactNode } from 'react';
import {
  filterCards,
  type BoardColumn as BoardColumnType,
  type Card as CardType,
  type User,
} from '@jira-clone/shared';
import { Text, Badge } from '../../base';
import { BoardColumn, DEFAULT_COLUMN_WIDTH } from '../board-column/BoardColumn';
import { BoardFilterBar } from '../board-filter-bar';
import { CardMoveMenu, type CardPosition } from '../card-move-menu';

export interface BoardProps {
  /** Columns configured for this board */
  columns: BoardColumnType[];
  /** Cards belonging to this board */
  cards: CardType[];
  /** Available workspace members */
  users?: User[];
  /** Current viewing user ID */
  currentUserId?: string;
  /** Optional board title (e.g. "Sprint 14 Kanban") */
  boardTitle?: string;
  /** Optional project key or code (e.g. "FIELD") */
  projectKey?: string;
  /** Whether to render the integrated filter bar (default: true) */
  showFilterBar?: boolean;
  /** Card press callback (opens detail) */
  onCardPress?: (card: CardType) => void;
  /** Card quick move callback */
  onCardMove?: (card: CardType, toColumnId?: string, position?: CardPosition) => void;
  /** Card single assignee change */
  onCardAssigneeChange?: (userId: string | null, card: CardType) => void;
  /** Card multi-assignees change */
  onCardAssigneesChange?: (userIds: string[], card: CardType) => void;
  /** Quick inline card creation callback */
  onCreateCard?: (title: string, columnId: string) => void | Promise<void>;
  /** Callback fired when the '+' add card button in column is clicked */
  onAddCardPress?: (columnId: string) => void;
  /** Custom render prop for card items */
  renderCard?: (card: CardType) => ReactNode;
  /** Whether card creation is permitted (default: true) */
  canCreateCard?: boolean;
  /** Custom column width (default: 300) */
  columnWidth?: number | string;
  /** Custom gap between columns (default: 16) */
  columnGap?: number;
  /** Custom slot above board */
  renderHeader?: () => ReactNode;
  /** Custom slot below board */
  renderFooter?: () => ReactNode;
  /** Custom container style */
  style?: CSSProperties;
  /** Test identifier */
  testID?: string;
}

export const Board: FC<BoardProps> = ({
  columns = [],
  cards = [],
  users = [],
  currentUserId,
  boardTitle,
  projectKey,
  showFilterBar = true,
  onCardPress,
  onCardMove,
  onCardAssigneeChange,
  onCardAssigneesChange,
  onAddCardPress,
  onCreateCard,
  renderCard,
  canCreateCard = true,
  columnWidth = DEFAULT_COLUMN_WIDTH,
  columnGap = 16,
  renderHeader,
  renderFooter,
  style,
  testID,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [createdByMe, setCreatedByMe] = useState(false);
  const [hasComments, setHasComments] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [movingCard, setMovingCard] = useState<CardType | null>(null);

  const currentUser = users.find((u) => u.id === currentUserId) || null;

  // Filter cards across all columns using shared filterCards
  const filteredCards = filterCards(cards, {
    searchQuery,
    assignedToMe,
    createdByMe,
    hasComments,
    selectedUserIds,
    currentUserId,
  });

  return (
    <div
      data-testid={testID}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        gap: 16,
        ...style,
      }}
    >
      {/* Board Header Bar */}
      {(boardTitle || projectKey || renderHeader) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {projectKey && <Badge label={projectKey} variant="mono" size="md" />}
            {boardTitle && (
              <Text variant="heading" bold>
                {boardTitle}
              </Text>
            )}
            <Badge label={`${filteredCards.length} issues`} variant="neutral" size="sm" />
          </div>

          {renderHeader && <div>{renderHeader()}</div>}
        </div>
      )}

      {/* Integrated Filter Bar */}
      {showFilterBar && (
        <BoardFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          assignedToMe={assignedToMe}
          onToggleAssignedToMe={() => setAssignedToMe((v) => !v)}
          createdByMe={createdByMe}
          onToggleCreatedByMe={() => setCreatedByMe((v) => !v)}
          hasComments={hasComments}
          onToggleHasComments={() => setHasComments((v) => !v)}
          selectedUserIds={selectedUserIds}
          onToggleUserId={(uid) =>
            setSelectedUserIds((prev) =>
              prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
            )
          }
          users={users}
          currentUser={currentUser}
          matchCount={filteredCards.length}
          totalCount={cards.length}
          onClearFilters={() => {
            setSearchQuery('');
            setAssignedToMe(false);
            setCreatedByMe(false);
            setHasComments(false);
            setSelectedUserIds([]);
          }}
        />
      )}

      {/* Horizontal Kanban Columns Container */}
      <div
        style={{
          display: 'flex',
          gap: columnGap,
          overflowX: 'auto',
          paddingBottom: 16,
          alignItems: 'flex-start',
        }}
      >
        {columns.map((column) => {
          const colCards = filteredCards.filter((card) => card.columnId === column.id);

          return (
            <BoardColumn
              key={column.id}
              column={column}
              cards={colCards}
              users={users}
              currentUserId={currentUserId}
              onCardPress={onCardPress}
              onCardMove={(card) => {
                setMovingCard(card);
              }}
              onCardAssigneeChange={onCardAssigneeChange}
              onCardAssigneesChange={onCardAssigneesChange}
              onAddCardPress={onAddCardPress}
              onCreateCard={onCreateCard}
              renderCard={renderCard}
              canCreateCard={canCreateCard}
              columnWidth={columnWidth}
            />
          );
        })}

        {columns.length === 0 && (
          <div
            style={{
              padding: 32,
              textAlign: 'center',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              width: '100%',
            }}
          >
            <Text variant="body" muted>
              No columns configured for this board.
            </Text>
          </div>
        )}
      </div>

      {/* Card Move Menu Modal */}
      <CardMoveMenu
        visible={Boolean(movingCard)}
        card={movingCard}
        columns={columns}
        currentUserId={currentUserId}
        onClose={() => setMovingCard(null)}
        onMoveColumn={(toColId, card, pos) => {
          onCardMove?.(card, toColId, pos);
          setMovingCard(null);
        }}
      />

      {renderFooter && <div>{renderFooter()}</div>}
    </div>
  );
};

export default Board;
