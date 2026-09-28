import { useState } from 'react';
import type { CSSProperties, FC, ReactNode } from 'react';
import {
  filterCards,
  type BoardColumn as BoardColumnType,
  type Card as CardType,
  type CardTypeOption,
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
  /** Available card types for filtering */
  cardTypes?: CardTypeOption[];
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
  /** Controlled search query */
  searchQuery?: string;
  /** Search query change handler */
  onSearchChange?: (query: string) => void;
  /** Controlled "Assigned to me" flag */
  assignedToMe?: boolean;
  /** Toggle "Assigned to me" handler */
  onToggleAssignedToMe?: () => void;
  /** Controlled "Shared with me" flag */
  sharedWithMe?: boolean;
  /** Toggle "Shared with me" handler */
  onToggleSharedWithMe?: () => void;
  /** Controlled "Created by me" flag */
  createdByMe?: boolean;
  /** Toggle "Created by me" handler */
  onToggleCreatedByMe?: () => void;
  /** Controlled selected card type */
  selectedType?: string;
  /** Select card type handler */
  onSelectType?: (type: string) => void;
  /** Controlled selected user IDs */
  selectedUserIds?: string[];
  /** Toggle user ID selection handler */
  onToggleUserId?: (userId: string) => void;
  /** Clear all filters handler */
  onClearFilters?: () => void;
  /** Whether filtering is handled by backend server (cards are already filtered) */
  isServerFiltered?: boolean;
  /** Total count of cards before server filtering (for match count display) */
  totalCardsCount?: number;
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
  cardTypes,
  boardTitle,
  projectKey,
  showFilterBar = true,
  searchQuery: controlledSearchQuery,
  onSearchChange,
  assignedToMe: controlledAssignedToMe,
  onToggleAssignedToMe,
  sharedWithMe: controlledSharedWithMe,
  onToggleSharedWithMe,
  createdByMe: controlledCreatedByMe,
  onToggleCreatedByMe,
  selectedType: controlledSelectedType,
  onSelectType,
  selectedUserIds: controlledSelectedUserIds,
  onToggleUserId,
  onClearFilters,
  isServerFiltered = false,
  totalCardsCount,
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
  // Internal filter states for uncontrolled mode
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalAssignedToMe, setInternalAssignedToMe] = useState(false);
  const [internalSharedWithMe, setInternalSharedWithMe] = useState(false);
  const [internalCreatedByMe, setInternalCreatedByMe] = useState(false);
  const [internalSelectedType, setInternalSelectedType] = useState('all');
  const [internalSelectedUserIds, setInternalSelectedUserIds] = useState<string[]>([]);
  const [movingCard, setMovingCard] = useState<CardType | null>(null);

  // Active filter values (controlled or internal)
  const activeSearchQuery = controlledSearchQuery !== undefined ? controlledSearchQuery : internalSearchQuery;
  const activeAssignedToMe = controlledAssignedToMe !== undefined ? controlledAssignedToMe : internalAssignedToMe;
  const activeSharedWithMe = controlledSharedWithMe !== undefined ? controlledSharedWithMe : internalSharedWithMe;
  const activeCreatedByMe = controlledCreatedByMe !== undefined ? controlledCreatedByMe : internalCreatedByMe;
  const activeSelectedType = controlledSelectedType !== undefined ? controlledSelectedType : internalSelectedType;
  const activeSelectedUserIds = controlledSelectedUserIds !== undefined ? controlledSelectedUserIds : internalSelectedUserIds;

  const handleSearchChange = onSearchChange || setInternalSearchQuery;
  const handleToggleAssignedToMe = onToggleAssignedToMe || (() => setInternalAssignedToMe((v) => !v));
  const handleToggleSharedWithMe = onToggleSharedWithMe || (() => setInternalSharedWithMe((v) => !v));
  const handleToggleCreatedByMe = onToggleCreatedByMe || (() => setInternalCreatedByMe((v) => !v));
  const handleSelectType = onSelectType || setInternalSelectedType;
  const handleToggleUserId = onToggleUserId || ((uid: string) =>
    setInternalSelectedUserIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    )
  );
  const handleClearFilters = onClearFilters || (() => {
    setInternalSearchQuery('');
    setInternalAssignedToMe(false);
    setInternalSharedWithMe(false);
    setInternalCreatedByMe(false);
    setInternalSelectedType('all');
    setInternalSelectedUserIds([]);
  });

  const currentUser = users.find((u) => u.id === currentUserId) || null;

  // Filter cards across all columns:
  // If isServerFiltered is true, server filtered the tasks; we only apply client-side
  // user filter if multiple users are selected (since backend API accepts single assignee).
  const filteredCards = isServerFiltered
    ? activeSelectedUserIds.length > 1
      ? filterCards(cards, { selectedUserIds: activeSelectedUserIds })
      : cards
    : filterCards(cards, {
        searchQuery: activeSearchQuery,
        assignedToMe: activeAssignedToMe,
        sharedWithMe: activeSharedWithMe,
        createdByMe: activeCreatedByMe,
        selectedUserIds: activeSelectedUserIds,
        type: activeSelectedType !== 'all' ? activeSelectedType : undefined,
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
          searchQuery={activeSearchQuery}
          onSearchChange={handleSearchChange}
          assignedToMe={activeAssignedToMe}
          onToggleAssignedToMe={handleToggleAssignedToMe}
          sharedWithMe={activeSharedWithMe}
          onToggleSharedWithMe={handleToggleSharedWithMe}
          createdByMe={activeCreatedByMe}
          onToggleCreatedByMe={handleToggleCreatedByMe}
          selectedType={activeSelectedType}
          onSelectType={handleSelectType}
          cardTypes={cardTypes}
          selectedUserIds={activeSelectedUserIds}
          onToggleUserId={handleToggleUserId}
          users={users}
          currentUser={currentUser}
          matchCount={filteredCards.length}
          totalCount={totalCardsCount !== undefined ? totalCardsCount : cards.length}
          onClearFilters={handleClearFilters}
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
