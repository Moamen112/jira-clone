import { useState } from 'react';
import styles from './App.module.css';
import { Text, Badge, Divider, Button, Input } from '@/components/base';
import { Avatar, type AvatarSize } from '@/components/shared/avatar';
import { AvatarGroup } from '@/components/shared/avatar-group';
import { AssigneeSelect } from '@/components/shared/assignee-select';
import { Accordion } from '@/components/shared/accordion';
import { Board } from '@/components/shared/board';
import { BoardColumn } from '@/components/shared/board-column';
import { Card } from '@/components/shared/card';
import { CardDetail } from '@/components/shared/card-detail';
import { ActivityLog } from '@/components/shared/activity-log';
import { BoardFilterBar, filterCards } from '@/components/shared/board-filter-bar';
import { CardMoveMenu, type CardPosition } from '@/components/shared/card-move-menu';
import type {
  User,
  BoardColumn as BoardColumnType,
  Card as CardType,
  Comment,
  ActivityLog as ActivityLogType,
} from '@jira-clone/shared';

const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Alex Morgan',
    email: 'alex@fieldnotes.dev',
    initials: 'AM',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: 'user-2',
    name: 'Sarah Connor',
    email: 'sarah@fieldnotes.dev',
    initials: 'SC',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    id: 'user-3',
    name: 'David Kim',
    email: 'david@fieldnotes.dev',
    initials: 'DK',
  },
  {
    id: 'user-4',
    name: 'Elena Rostova',
    email: 'elena@fieldnotes.dev',
    initials: 'ER',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: 'user-5',
    name: 'Marcus Aurelius',
    email: 'marcus@fieldnotes.dev',
    initials: 'MA',
  },
  {
    id: 'user-6',
    name: 'Jane Doe',
    email: 'jane@fieldnotes.dev',
    initials: 'JD',
  },
];

const INITIAL_COLUMNS: BoardColumnType[] = [
  { id: 'col-todo', projectId: 'proj-1', title: 'To Do', order: 0 },
  { id: 'col-progress', projectId: 'proj-1', title: 'In Progress', order: 1 },
  { id: 'col-review', projectId: 'proj-1', title: 'In Review', order: 2 },
  { id: 'col-done', projectId: 'proj-1', title: 'Done', order: 3 },
];

const INITIAL_CARDS: CardType[] = [
  {
    id: 'card-1',
    key: 'FIELD-1',
    title: 'Implement design tokens and typography scale',
    description: 'Universal CSS variables for light & dark palettes conforming to the Fieldnotes system.',
    projectId: 'proj-1',
    columnId: 'col-done',
    publisherId: 'user-1',
    assigneeId: 'user-2',
    assigneeIds: ['user-1', 'user-2'],
    priority: 'high',
    order: 0,
    commentCount: 2,
    createdAt: '2026-09-02T14:00:00.000Z',
    updatedAt: '2026-09-04T16:30:00.000Z',
  },
  {
    id: 'card-2',
    key: 'FIELD-2',
    title: 'Build shared Board and BoardColumn components',
    description: 'Horizontal kanban scrolling, inline quick-add composer, and live card reassignment.',
    projectId: 'proj-1',
    columnId: 'col-progress',
    publisherId: 'user-1',
    assigneeId: 'user-1',
    priority: 'highest',
    order: 0,
    commentCount: 1,
    createdAt: '2026-09-03T09:00:00.000Z',
    updatedAt: '2026-09-07T11:00:00.000Z',
  },
  {
    id: 'card-3',
    key: 'FIELD-3',
    title: 'Audit accessibility & keyboard navigation',
    description: 'Ensure all triggers, buttons, and popups have appropriate aria tags and keyboard handlers.',
    projectId: 'proj-1',
    columnId: 'col-todo',
    publisherId: 'user-2',
    assigneeId: 'user-3',
    priority: 'medium',
    order: 0,
    commentCount: 0,
    createdAt: '2026-09-05T15:00:00.000Z',
    updatedAt: '2026-09-05T15:00:00.000Z',
  },
  {
    id: 'card-4',
    key: 'FIELD-4',
    title: 'Review pull request for Accordion component',
    description: 'Verify smooth CSS grid transitions and controlled mode in dark theme.',
    projectId: 'proj-1',
    columnId: 'col-review',
    publisherId: 'user-3',
    assigneeId: 'user-4',
    priority: 'low',
    order: 0,
    commentCount: 1,
    createdAt: '2026-09-06T10:00:00.000Z',
    updatedAt: '2026-09-06T10:00:00.000Z',
  },
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comment-1',
    cardId: 'card-1',
    authorId: 'user-1',
    content: 'Tokens are verified against the design-system doc. Both light and dark palettes match.',
    createdAt: '2026-09-04T10:00:00.000Z',
  },
  {
    id: 'comment-2',
    cardId: 'card-1',
    authorId: 'user-2',
    content: 'Awesome, moving this card to Done!',
    createdAt: '2026-09-04T16:25:00.000Z',
  },
  {
    id: 'comment-3',
    cardId: 'card-2',
    authorId: 'user-2',
    content: 'The board columns look great and drag/move feels very responsive.',
    createdAt: '2026-09-05T11:00:00.000Z',
  },
  {
    id: 'comment-4',
    cardId: 'card-4',
    authorId: 'user-1',
    content: 'Added tests for controlled/uncontrolled state.',
    createdAt: '2026-09-06T11:30:00.000Z',
  },
];

const INITIAL_ACTIVITY_LOGS: ActivityLogType[] = [
  {
    id: 'log-1',
    cardId: 'card-1',
    actorId: 'user-1',
    action: 'CARD_CREATED',
    details: { to: 'To Do' },
    createdAt: '2026-09-02T14:00:00.000Z',
  },
  {
    id: 'log-2',
    cardId: 'card-1',
    actorId: 'user-1',
    action: 'ASSIGNEE_CHANGED',
    details: { to: 'Sarah Connor' },
    createdAt: '2026-09-02T14:05:00.000Z',
  },
  {
    id: 'log-3',
    cardId: 'card-1',
    actorId: 'user-2',
    action: 'STATUS_CHANGED',
    details: { from: 'In Progress', to: 'Done' },
    createdAt: '2026-09-04T16:30:00.000Z',
  },
  {
    id: 'log-4',
    cardId: 'card-1',
    actorId: 'user-2',
    action: 'WORK_LOGGED',
    details: { message: 'Logged 3h 30m of token and theme implementation work' },
    createdAt: '2026-09-04T17:00:00.000Z',
  },
  {
    id: 'log-5',
    cardId: 'card-2',
    actorId: 'user-1',
    action: 'CARD_CREATED',
    details: { to: 'To Do' },
    createdAt: '2026-09-03T09:00:00.000Z',
  },
  {
    id: 'log-6',
    cardId: 'card-2',
    actorId: 'user-1',
    action: 'STATUS_CHANGED',
    details: { from: 'To Do', to: 'In Progress' },
    createdAt: '2026-09-03T11:30:00.000Z',
  },
  {
    id: 'log-7',
    cardId: 'card-2',
    actorId: 'user-2',
    action: 'COMMENT_ADDED',
    details: {},
    createdAt: '2026-09-05T11:00:00.000Z',
  },
  {
    id: 'log-8',
    cardId: 'card-4',
    actorId: 'user-3',
    action: 'CARD_CREATED',
    details: { to: 'Review' },
    createdAt: '2026-09-06T10:00:00.000Z',
  },
  {
    id: 'log-9',
    cardId: 'card-4',
    actorId: 'user-4',
    action: 'ASSIGNEE_CHANGED',
    details: { to: 'Elena Rostova' },
    createdAt: '2026-09-06T10:15:00.000Z',
  },
  {
    id: 'log-10',
    cardId: 'card-4',
    actorId: 'user-1',
    action: 'WORK_LOGGED',
    details: { message: 'Reviewed CSS grid transition performance and ARIA states' },
    createdAt: '2026-09-06T12:00:00.000Z',
  },
];

export const App = () => {
  const [isDark, setIsDark] = useState(false);

  // Board live states
  const [boardCards, setBoardCards] = useState<CardType[]>(INITIAL_CARDS);
  const [boardComments, setBoardComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [boardActivityLogs, setBoardActivityLogs] = useState<ActivityLogType[]>(INITIAL_ACTIVITY_LOGS);
  const [activityCardFilter, setActivityCardFilter] = useState<string>('all');
  const [inspectedCard, setInspectedCard] = useState<CardType | null>(null);

  // Standalone column demo cards
  const [emptyColumnCards, setEmptyColumnCards] = useState<CardType[]>([]);

  // Standalone BoardFilterBar showcase state
  const [filterBarQuery, setFilterBarQuery] = useState('');
  const [filterBarAssignedToMe, setFilterBarAssignedToMe] = useState(false);
  const [filterBarCreatedByMe, setFilterBarCreatedByMe] = useState(false);
  const [filterBarHasComments, setFilterBarHasComments] = useState(false);
  const [filterBarSelectedUserIds, setFilterBarSelectedUserIds] = useState<string[]>([]);

  // Standalone CardMoveMenu state
  const [demoMoveCard, setDemoMoveCard] = useState<CardType | null>(null);
  const [demoMoveRole, setDemoMoveRole] = useState<'publisher' | 'viewer'>('publisher');

  // Avatar tester state
  const [testName, setTestName] = useState('Alex Morgan');
  const [testImageUrl, setTestImageUrl] = useState('');
  const [testSize, setTestSize] = useState<AvatarSize>('md');
  const [testUnassigned, setTestUnassigned] = useState(false);
  const [testBordered, setTestBordered] = useState(true);

  // AssigneeSelect interactive states
  const [singleAssigneeId, setSingleAssigneeId] = useState<string | null>('user-1');
  const [multiAssigneeIds, setMultiAssigneeIds] = useState<string[]>(['user-1', 'user-2']);
  const [compactAssigneeId, setCompactAssigneeId] = useState<string | null>('user-3');
  const [avatarOnlyAssigneeId, setAvatarOnlyAssigneeId] = useState<string | null>('user-4');
  const [unassignedDemoId, setUnassignedDemoId] = useState<string | null>(null);

  // Derived filtered cards for the standalone BoardFilterBar demo
  const standaloneFilteredCards = filterCards(boardCards, {
    searchQuery: filterBarQuery,
    assignedToMe: filterBarAssignedToMe,
    createdByMe: filterBarCreatedByMe,
    hasComments: filterBarHasComments,
    selectedUserIds: filterBarSelectedUserIds,
    currentUserId: 'user-1',
  });

  // Accordion interactive states
  const [controlledExpanded, setControlledExpanded] = useState(true);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const handleCreateCardInBoard = (title: string, columnId: string) => {
    const newCard: CardType = {
      id: `card-${Date.now()}`,
      key: `FIELD-${boardCards.length + 1}`,
      title,
      projectId: 'proj-1',
      columnId,
      publisherId: 'user-1',
      assigneeId: null,
      priority: 'medium',
      order: boardCards.length,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBoardCards((prev) => [...prev, newCard]);
    const colTitle = INITIAL_COLUMNS.find((c) => c.id === columnId)?.title || columnId;
    setBoardActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        cardId: newCard.id,
        actorId: 'user-1',
        action: 'CARD_CREATED',
        details: { to: colTitle },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleMoveCard = (
    card: CardType,
    toColumnId?: string,
    position: CardPosition = 'bottom'
  ) => {
    const columnOrder = ['col-todo', 'col-progress', 'col-review', 'col-done'];
    const currentIndex = columnOrder.indexOf(card.columnId);
    const targetColumnId =
      toColumnId || columnOrder[(currentIndex + 1) % columnOrder.length];

    setBoardCards((prev) => {
      const otherCards = prev.filter((c) => c.id !== card.id);
      const updatedCard: CardType = {
        ...card,
        columnId: targetColumnId,
        updatedAt: new Date().toISOString(),
      };
      if (position === 'top') {
        return [updatedCard, ...otherCards];
      }
      return [...otherCards, updatedCard];
    });

    const fromCol =
      INITIAL_COLUMNS.find((c) => c.id === card.columnId)?.title || card.columnId;
    const toCol =
      INITIAL_COLUMNS.find((c) => c.id === targetColumnId)?.title || targetColumnId;
    setBoardActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        cardId: card.id,
        actorId: 'user-1',
        action: 'STATUS_CHANGED',
        details: { from: fromCol, to: toCol },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleCardAssigneeChange = (userId: string | null, card: CardType) => {
    setBoardCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, assigneeId: userId } : c))
    );
    const toUser = userId ? MOCK_USERS.find((u) => u.id === userId)?.name : undefined;
    setBoardActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        cardId: card.id,
        actorId: 'user-1',
        action: 'ASSIGNEE_CHANGED',
        details: { to: toUser },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleSaveCardDetail = (updated: CardType) => {
    const original = boardCards.find((c) => c.id === updated.id);
    if (original) {
      const newLogs: ActivityLogType[] = [];
      if (original.columnId !== updated.columnId) {
        const fromCol = INITIAL_COLUMNS.find((c) => c.id === original.columnId)?.title || original.columnId;
        const toCol = INITIAL_COLUMNS.find((c) => c.id === updated.columnId)?.title || updated.columnId;
        newLogs.push({
          id: `log-${Date.now()}-status`,
          cardId: updated.id,
          actorId: 'user-1',
          action: 'STATUS_CHANGED',
          details: { from: fromCol, to: toCol },
          createdAt: new Date().toISOString(),
        });
      }
      if (original.assigneeId !== updated.assigneeId) {
        const toUser = updated.assigneeId ? MOCK_USERS.find((u) => u.id === updated.assigneeId)?.name : undefined;
        newLogs.push({
          id: `log-${Date.now()}-assignee`,
          cardId: updated.id,
          actorId: 'user-1',
          action: 'ASSIGNEE_CHANGED',
          details: { to: toUser },
          createdAt: new Date().toISOString(),
        });
      }
      if (original.title !== updated.title) {
        newLogs.push({
          id: `log-${Date.now()}-title`,
          cardId: updated.id,
          actorId: 'user-1',
          action: 'TITLE_UPDATED',
          details: {},
          createdAt: new Date().toISOString(),
        });
      }
      if (original.description !== updated.description) {
        newLogs.push({
          id: `log-${Date.now()}-desc`,
          cardId: updated.id,
          actorId: 'user-1',
          action: 'DESCRIPTION_UPDATED',
          details: {},
          createdAt: new Date().toISOString(),
        });
      }
      if (newLogs.length > 0) {
        setBoardActivityLogs((prev) => [...newLogs, ...prev]);
      }
    }
    setBoardCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setInspectedCard(null);
  };

  const handleDeleteCard = (cardId: string) => {
    setBoardCards((prev) => prev.filter((c) => c.id !== cardId));
    setInspectedCard(null);
  };

  const handleAddComment = (content: string, cardId?: string) => {
    if (!cardId) return;
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      cardId,
      authorId: 'user-1',
      content,
      createdAt: new Date().toISOString(),
    };
    setBoardComments((prev) => [...prev, newComment]);
    setBoardCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, commentCount: c.commentCount + 1 } : c))
    );
    setBoardActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        cardId,
        actorId: 'user-1',
        action: 'COMMENT_ADDED',
        details: {},
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleDeleteComment = (commentId: string) => {
    const comment = boardComments.find((c) => c.id === commentId);
    if (!comment) return;
    setBoardComments((prev) => prev.filter((c) => c.id !== commentId));
    setBoardCards((prev) =>
      prev.map((c) =>
        c.id === comment.cardId ? { ...c, commentCount: Math.max(0, c.commentCount - 1) } : c
      )
    );
  };

  const handleSimulateWorkLog = (cardId: string = 'card-1') => {
    const targetCard = boardCards.find((c) => c.id === cardId) || boardCards[0];
    const newLog: ActivityLogType = {
      id: `log-${Date.now()}`,
      cardId: targetCard.id,
      actorId: 'user-2',
      action: 'WORK_LOGGED',
      details: { message: `Logged 2h 15m on ${targetCard.key}: component test & styling` },
      createdAt: new Date().toISOString(),
    };
    setBoardActivityLogs((prev) => [newLog, ...prev]);
  };

  const handleSimulateStatusChange = (cardId: string = 'card-2') => {
    const targetCard = boardCards.find((c) => c.id === cardId) || boardCards[1] || boardCards[0];
    const newLog: ActivityLogType = {
      id: `log-${Date.now()}`,
      cardId: targetCard.id,
      actorId: 'user-1',
      action: 'STATUS_CHANGED',
      details: { from: 'In Progress', to: 'In Review' },
      createdAt: new Date().toISOString(),
    };
    setBoardActivityLogs((prev) => [newLog, ...prev]);
  };

  const sizes: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <header className={styles.header}>
        <div>
          <Text variant="heading" bold>
            Shared Components Playground
          </Text>
          <div>
            <Text variant="bodySmall" muted>
              Testing and showcasing Card, CardDetail, Board, BoardColumn, Accordion, AssigneeSelect &amp; Avatar
            </Text>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Badge label={isDark ? 'Dark Mode' : 'Light Mode'} variant="neutral" size="sm" />
          <Button
            label={isDark ? 'Switch to Light' : 'Switch to Dark'}
            variant="secondary"
            size="sm"
            onPress={toggleTheme}
          />
        </div>
      </header>

      <div className={styles.showcaseGrid}>
        {/* ================================================================= */}
        {/* CARD & CARD DETAIL SHOWCASE */}
        {/* ================================================================= */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <Text variant="subheading" bold>
                Card &amp; CardDetail Components
              </Text>
              <div>
                <Text variant="caption" muted>
                  Standalone Card primitives and the comprehensive CardDetail modal (with title/desc edits, status change, assignee select, comments, and delete confirmation)
                </Text>
              </div>
            </div>
            <Badge label="New Components" variant="accent" size="sm" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {/* Demo Card 1 */}
            <div>
              <Text variant="caption" bold style={{ display: 'block', marginBottom: 6 }}>
                Interactive Card (Click to open CardDetail Modal):
              </Text>
              <Card
                card={boardCards[0]}
                users={MOCK_USERS}
                currentUserRole="publisher"
                showRoleBadge
                onPress={(c) => setInspectedCard(c)}
                onMove={handleMoveCard}
                onAssigneeChange={handleCardAssigneeChange}
              />
            </div>

            {/* Demo Card 2 */}
            <div>
              <Text variant="caption" bold style={{ display: 'block', marginBottom: 6 }}>
                Multi-Assignee Card with Highest Priority:
              </Text>
              <Card
                card={boardCards[1]}
                users={MOCK_USERS}
                currentUserRole="assignee"
                showRoleBadge
                onPress={(c) => setInspectedCard(c)}
                onMove={handleMoveCard}
                onAssigneeChange={handleCardAssigneeChange}
              />
            </div>

            {/* Demo Card 3 */}
            <div>
              <Text variant="caption" bold style={{ display: 'block', marginBottom: 6 }}>
                Viewer Perspective (Restricted permissions):
              </Text>
              <Card
                card={boardCards[2]}
                users={MOCK_USERS}
                currentUserRole="viewer"
                showRoleBadge
                onPress={(c) => setInspectedCard(c)}
                onMove={handleMoveCard}
              />
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* BOARD SHOWCASE */}
        {/* ================================================================= */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <Text variant="subheading" bold>
                Board Component (Full Kanban Experience)
              </Text>
              <div>
                <Text variant="caption" muted>
                  Complete project board with integrated search &amp; assignee filters, horizontal scrolling columns, inline card creation, and quick moves.
                </Text>
              </div>
            </div>
            <Badge label="Interactive Board" variant="neutral" size="sm" />
          </div>

          <Board
            boardTitle="Fieldnotes Core Sprint"
            projectKey="FIELD"
            columns={INITIAL_COLUMNS}
            cards={boardCards}
            users={MOCK_USERS}
            currentUserId="user-1"
            columnWidth={280}
            columnGap={16}
            onCreateCard={handleCreateCardInBoard}
            onCardPress={(card) => setInspectedCard(card)}
            onCardMove={handleMoveCard}
            onCardAssigneeChange={handleCardAssigneeChange}
          />
        </div>

        {/* ================================================================= */}
        {/* BOARD COLUMN STANDALONE SHOWCASE */}
        {/* ================================================================= */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <Text variant="subheading" bold>
                BoardColumn Component (Standalone States)
              </Text>
              <div>
                <Text variant="caption" muted>
                  Individual column states: with cards, empty column state, and inline card composer
                </Text>
              </div>
            </div>
            <Badge label="Board Column" variant="neutral" size="sm" />
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* 1. Empty Column */}
            <div>
              <Text variant="caption" bold style={{ display: 'block', marginBottom: 6 }}>
                Empty Column (Dashed placeholder + Add card CTA):
              </Text>
              <BoardColumn
                column={{ id: 'col-backlog', projectId: 'proj-1', title: 'Backlog', order: 0 }}
                cards={emptyColumnCards}
                users={MOCK_USERS}
                onCreateCard={(title) => {
                  setEmptyColumnCards((prev) => [
                    ...prev,
                    {
                      id: `demo-${Date.now()}`,
                      key: 'DEMO-1',
                      title,
                      projectId: 'proj-1',
                      columnId: 'col-backlog',
                      publisherId: 'user-1',
                      priority: 'medium',
                      order: 0,
                      commentCount: 0,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                  ]);
                }}
              />
            </div>

            {/* 2. Active Column */}
            <div>
              <Text variant="caption" bold style={{ display: 'block', marginBottom: 6 }}>
                Active Column (with card items and header count):
              </Text>
              <BoardColumn
                column={{ id: 'col-progress', projectId: 'proj-1', title: 'In Progress', order: 1 }}
                cards={boardCards.filter((c) => c.columnId === 'col-progress')}
                users={MOCK_USERS}
                onCreateCard={handleCreateCardInBoard}
                onCardPress={(c) => setInspectedCard(c)}
                onCardMove={handleMoveCard}
                onCardAssigneeChange={handleCardAssigneeChange}
              />
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* BOARD FILTER BAR & CARD MOVE MENU SHOWCASE */}
        {/* ================================================================= */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <Text variant="subheading" bold>
                BoardFilterBar &amp; CardMoveMenu Components
              </Text>
              <div>
                <Text variant="caption" muted>
                  Comprehensive filter controls (text query, my issues, created by me, comments, and member facepile) alongside the destination column picker modal with top/bottom placement
                </Text>
              </div>
            </div>
            <Badge label="New Components" variant="accent" size="sm" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* 1. Standalone BoardFilterBar */}
            <div className={styles.interactiveBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text variant="bodySmall" bold>
                  1. Standalone BoardFilterBar
                </Text>
                <Badge
                  label={`${standaloneFilteredCards.length} matching cards`}
                  variant={standaloneFilteredCards.length < boardCards.length ? 'accent' : 'neutral'}
                  size="sm"
                />
              </div>

              <BoardFilterBar
                searchQuery={filterBarQuery}
                onSearchChange={setFilterBarQuery}
                assignedToMe={filterBarAssignedToMe}
                onToggleAssignedToMe={() => setFilterBarAssignedToMe((v) => !v)}
                createdByMe={filterBarCreatedByMe}
                onToggleCreatedByMe={() => setFilterBarCreatedByMe((v) => !v)}
                hasComments={filterBarHasComments}
                onToggleHasComments={() => setFilterBarHasComments((v) => !v)}
                selectedUserIds={filterBarSelectedUserIds}
                onToggleUserId={(uid) =>
                  setFilterBarSelectedUserIds((prev) =>
                    prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
                  )
                }
                users={MOCK_USERS}
                currentUser={MOCK_USERS[0]}
                matchCount={standaloneFilteredCards.length}
                totalCount={boardCards.length}
                onClearFilters={() => {
                  setFilterBarQuery('');
                  setFilterBarAssignedToMe(false);
                  setFilterBarCreatedByMe(false);
                  setFilterBarHasComments(false);
                  setFilterBarSelectedUserIds([]);
                }}
              />

              {/* Matching Cards Preview Grid */}
              <div style={{ marginTop: 14 }}>
                <Text variant="caption" bold style={{ display: 'block', marginBottom: 8 }}>
                  Matching Results ({standaloneFilteredCards.length}):
                </Text>
                {standaloneFilteredCards.length === 0 ? (
                  <div
                    style={{
                      padding: '20px',
                      textAlign: 'center',
                      backgroundColor: 'var(--color-surface)',
                      borderRadius: 'var(--radius-card)',
                      border: '1px dashed var(--color-line)',
                    }}
                  >
                    <Text variant="bodySmall" muted style={{ fontStyle: 'italic' }}>
                      No cards match the active filters. Try clearing some criteria.
                    </Text>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                      gap: 10,
                    }}
                  >
                    {standaloneFilteredCards.map((c) => (
                      <div
                        key={c.id}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-card)',
                          border: '1px solid var(--color-line)',
                          backgroundColor: 'var(--color-paper)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Badge label={c.key} variant="mono" size="sm" />
                          <Badge
                            label={INITIAL_COLUMNS.find((col) => col.id === c.columnId)?.title || c.columnId}
                            variant="neutral"
                            size="sm"
                          />
                        </div>
                        <Text variant="bodySmall" bold numberOfLines={1}>
                          {c.title}
                        </Text>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Standalone CardMoveMenu Launchers */}
            <div className={styles.interactiveBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text variant="bodySmall" bold>
                  2. CardMoveMenu Modal Trigger
                </Text>
                <Badge label="Interactive Modal" variant="neutral" size="sm" />
              </div>
              <Text variant="caption" muted style={{ display: 'block', marginBottom: 12 }}>
                Launch the column repositioning modal to test top/bottom placement, destination list, and permission restrictions:
              </Text>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button
                  label={`Move ${boardCards[0]?.key} (Publisher Role - Full Access)`}
                  variant="primary"
                  size="sm"
                  onPress={() => {
                    setDemoMoveRole('publisher');
                    setDemoMoveCard(boardCards[0]);
                  }}
                />
                <Button
                  label={`Move ${boardCards[2]?.key} (Viewer Role - Restricted Notice)`}
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    setDemoMoveRole('viewer');
                    setDemoMoveCard(boardCards[2]);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* ACCORDION SHOWCASE */}
        {/* ================================================================= */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <Text variant="subheading" bold>
                Accordion Component
              </Text>
              <div>
                <Text variant="caption" muted>
                  Collapsible sections with icons, count badges, smooth CSS transitions, and controlled/uncontrolled state
                </Text>
              </div>
            </div>
            <Badge label="Shared Component" variant="neutral" size="sm" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Accordion
              title="Issue Details & Metadata"
              subtitle="Priority, estimation, and custom fields"
              badge="4 items"
              badgeVariant="accent"
              defaultExpanded
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Text variant="bodySmall">
                  This section contains key metadata about the current issue. Notice the smooth CSS grid collapse animation and rotating chevron indicator.
                </Text>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Badge label="Story" variant="accent" size="sm" />
                  <Badge label="Sprint 14" variant="neutral" size="sm" />
                  <Badge label="High Priority" variant="warn" size="sm" />
                </div>
              </div>
            </Accordion>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text variant="caption" bold>
                  Controlled Mode (external button toggle):
                </Text>
                <Button
                  label={controlledExpanded ? 'Collapse Section' : 'Expand Section'}
                  variant="secondary"
                  size="sm"
                  onPress={() => setControlledExpanded((v) => !v)}
                />
              </div>

              <Accordion
                title="Activity & Comments"
                subtitle="Recent updates from team members"
                badge={MOCK_USERS.length}
                badgeVariant="neutral"
                expanded={controlledExpanded}
                onToggle={(exp) => setControlledExpanded(exp)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Text variant="bodySmall" muted>
                    Collaborators currently following this task:
                  </Text>
                  <AvatarGroup users={MOCK_USERS} max={4} size="sm" />
                </div>
              </Accordion>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* ACTIVITY LOG SHOWCASE */}
        {/* ================================================================= */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <Text variant="subheading" bold>
                ActivityLog &amp; Audit Trail Component
              </Text>
              <div>
                <Text variant="caption" muted>
                  Chronological event timeline, category filter pills (All, History, Working), actor attribution, status change badges, and full CardDetail integration
                </Text>
              </div>
            </div>
            <Badge label="New Component" variant="accent" size="sm" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {/* Left: Standalone Interactive Activity Log */}
            <div className={styles.interactiveBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <Text variant="bodySmall" bold>
                  1. Live Filterable Timeline
                </Text>
                {/* Filter by card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Text variant="caption" muted>
                    Card:
                  </Text>
                  <select
                    value={activityCardFilter}
                    onChange={(e) => setActivityCardFilter(e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid var(--color-line)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-ink)',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="all">All Cards ({boardActivityLogs.length})</option>
                    {boardCards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.key} ({boardActivityLogs.filter((l) => l.cardId === c.id).length})
                      </option>
                    ))}
                    <option value="empty-card">Non-existent Card (Empty test)</option>
                  </select>
                </div>
              </div>

              <ActivityLog
                logs={boardActivityLogs}
                users={MOCK_USERS}
                cardId={activityCardFilter === 'all' ? undefined : activityCardFilter}
                title="ACTIVITY STREAM"
                style={{ backgroundColor: 'var(--color-paper)' }}
              />
            </div>

            {/* Right: Actions Simulation & Empty State */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className={styles.interactiveBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text variant="bodySmall" bold>
                    2. Simulate Audit Events Live
                  </Text>
                  <Badge label="Interactive" variant="neutral" size="sm" />
                </div>
                <Text variant="caption" muted style={{ display: 'block', marginBottom: 12 }}>
                  Click these actions to log new events dynamically into the timeline and CardDetail modal:
                </Text>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Button
                    label="Log Work on FIELD-1 (2h 15m)"
                    variant="secondary"
                    size="sm"
                    onPress={() => handleSimulateWorkLog('card-1')}
                  />
                  <Button
                    label="Move FIELD-2 to In Review"
                    variant="secondary"
                    size="sm"
                    onPress={() => handleSimulateStatusChange('card-2')}
                  />
                  <Button
                    label="Open FIELD-1 Detail (View Activity Accordion)"
                    variant="primary"
                    size="sm"
                    onPress={() => setInspectedCard(boardCards[0])}
                  />
                </div>
              </div>

              <div className={styles.interactiveBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text variant="bodySmall" bold>
                    3. Empty State Presentation
                  </Text>
                  <Badge label="Zero State" variant="neutral" size="sm" />
                </div>
                <Text variant="caption" muted style={{ display: 'block', marginBottom: 8 }}>
                  Graceful empty view when a new card has no activity logs:
                </Text>
                <ActivityLog
                  logs={[]}
                  users={MOCK_USERS}
                  title="EMPTY AUDIT TRAIL"
                  style={{ backgroundColor: 'var(--color-paper)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* ASSIGNEE SELECT SHOWCASE */}
        {/* ================================================================= */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <Text variant="subheading" bold>
                AssigneeSelect Component
              </Text>
              <div>
                <Text variant="caption" muted>
                  Dedicated member assignment selector with modal search, unassign option, and multi-mode
                </Text>
              </div>
            </div>
            <Badge label="Shared Component" variant="neutral" size="sm" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {/* 1. Single Assignee (Default Form Card) */}
            <div className={styles.interactiveBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text variant="bodySmall" bold>
                  1. Single Assignee (Default)
                </Text>
                <Badge label="Form Card" variant="neutral" size="sm" />
              </div>
              <AssigneeSelect
                label="Assigned Lead"
                users={MOCK_USERS}
                selectedUserId={singleAssigneeId}
                onSelect={(id) => setSingleAssigneeId(id)}
                helperText="Click to open the search modal and select or unassign."
              />
            </div>

            {/* 2. Multiple Assignees */}
            <div className={styles.interactiveBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text variant="bodySmall" bold>
                  2. Multiple Assignees
                </Text>
                <Badge label="Multi Mode" variant="accent" size="sm" />
              </div>
              <AssigneeSelect
                label="Team Collaborators"
                multiple
                users={MOCK_USERS}
                selectedUserIds={multiAssigneeIds}
                onSelectMultiple={(ids) => setMultiAssigneeIds(ids)}
                helperText="Select multiple members with checkmarks and Clear All."
              />
            </div>

            {/* 3. Compact Variant & Avatar-Only Variant */}
            <div className={styles.interactiveBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text variant="bodySmall" bold>
                  3. Compact &amp; Avatar-Only
                </Text>
                <Badge label="Dense UI" variant="neutral" size="sm" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
                <div>
                  <Text variant="caption" bold style={{ display: 'block', marginBottom: 6 }}>
                    Compact Pill Trigger:
                  </Text>
                  <AssigneeSelect
                    variant="compact"
                    users={MOCK_USERS}
                    selectedUserId={compactAssigneeId}
                    onSelect={(id) => setCompactAssigneeId(id)}
                  />
                </div>

                <Divider margin={4} />

                <div>
                  <Text variant="caption" bold style={{ display: 'block', marginBottom: 6 }}>
                    Avatar-Only Trigger (for card footers):
                  </Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <AssigneeSelect
                      variant="avatarOnly"
                      avatarSize="sm"
                      users={MOCK_USERS}
                      selectedUserId={avatarOnlyAssigneeId}
                      onSelect={(id) => setAvatarOnlyAssigneeId(id)}
                    />
                    <Text variant="caption" muted>
                      {avatarOnlyAssigneeId ? MOCK_USERS.find((u) => u.id === avatarOnlyAssigneeId)?.name : 'Unassigned'}
                    </Text>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Unassigned & Read-Only / Disabled */}
            <div className={styles.interactiveBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text variant="bodySmall" bold>
                  4. Unassigned &amp; Disabled
                </Text>
                <Badge label="Edge States" variant="neutral" size="sm" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
                <div>
                  <Text variant="caption" bold style={{ display: 'block', marginBottom: 6 }}>
                    Unassigned Initial State:
                  </Text>
                  <AssigneeSelect
                    users={MOCK_USERS}
                    selectedUserId={unassignedDemoId}
                    onSelect={(id) => setUnassignedDemoId(id)}
                    placeholder="No one assigned"
                  />
                </div>

                <Divider margin={4} />

                <div>
                  <Text variant="caption" bold style={{ display: 'block', marginBottom: 6 }}>
                    Disabled / Read-Only:
                  </Text>
                  <AssigneeSelect
                    users={MOCK_USERS}
                    selectedUserId="user-2"
                    disabled
                    helperText="Only project owners can modify assignees."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* AVATAR INTERACTIVE TESTER */}
        {/* ================================================================= */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <Text variant="subheading" bold>
              Interactive Avatar Tester
            </Text>
            <Badge label="Live Test" variant="accent" size="sm" />
          </div>

          <div className={styles.interactiveBox}>
            <div className={styles.interactiveInputs}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <Input
                  label="Name"
                  value={testName}
                  onChangeText={setTestName}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <Input
                  label="Image URL"
                  value={testImageUrl}
                  onChangeText={setTestImageUrl}
                  placeholder="https://... or broken link"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Text variant="caption" bold style={{ marginRight: 8 }}>
                Size:
              </Text>
              {sizes.map((s) => (
                <Button
                  key={s}
                  label={s}
                  variant={testSize === s ? 'primary' : 'secondary'}
                  size="sm"
                  onPress={() => setTestSize(s)}
                />
              ))}

              <Divider orientation="vertical" margin={12} style={{ height: 20 }} />

              <Button
                label={testUnassigned ? 'Unassigned: ON' : 'Unassigned: OFF'}
                variant={testUnassigned ? 'primary' : 'secondary'}
                size="sm"
                onPress={() => setTestUnassigned((v) => !v)}
              />
              <Button
                label={testBordered ? 'Bordered: ON' : 'Bordered: OFF'}
                variant={testBordered ? 'primary' : 'secondary'}
                size="sm"
                onPress={() => setTestBordered((v) => !v)}
              />
            </div>

            <div className={styles.interactivePreview}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Avatar
                  name={testName}
                  imageUrl={testImageUrl || undefined}
                  size={testSize}
                  unassigned={testUnassigned}
                  bordered={testBordered}
                />
                <div>
                  <Text variant="bodySmall" bold>
                    {testUnassigned ? 'Unassigned Placeholder' : testName || 'Anonymous'}
                  </Text>
                  <div>
                    <Text variant="caption" muted>
                      Tier: {testSize} | Border: {testBordered ? 'yes' : 'none'}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global CardDetail Modal when a card is clicked */}
      <CardDetail
        visible={Boolean(inspectedCard)}
        card={inspectedCard}
        columns={INITIAL_COLUMNS}
        users={MOCK_USERS}
        comments={boardComments}
        activityLogs={boardActivityLogs}
        currentUserId="user-1"
        onClose={() => setInspectedCard(null)}
        onSave={handleSaveCardDetail}
        onDelete={handleDeleteCard}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
      />

      {/* Standalone Demo CardMoveMenu */}
      <CardMoveMenu
        visible={Boolean(demoMoveCard)}
        card={demoMoveCard}
        columns={INITIAL_COLUMNS}
        currentUserRole={demoMoveRole}
        onClose={() => setDemoMoveCard(null)}
        onMoveColumn={(targetColId, card, position) => {
          handleMoveCard(card, targetColId, position);
          setDemoMoveCard(null);
        }}
      />
    </div>
  );
};

export default App;
