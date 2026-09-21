import { useState, useMemo } from 'react';
import type { CSSProperties, FC } from 'react';
import type { Card, BoardColumn, Project, User } from '@jira-clone/shared';
import { ForYouTabs, type ForYouTabKey, type ForYouTabItem } from './ForYouTabs';
import { ForYouItem } from './ForYouItem';
import { EmptyState } from '../../../../components/shared/empty-state';
import { Input } from '../../../../components/base';
import styles from './ForYouSection.module.css';

export interface ForYouSectionProps {
  cards: Card[];
  projects: Project[];
  columns: BoardColumn[];
  users: User[];
  currentUserId: string;
  starredCardIds: string[];
  onToggleStar: (cardId: string) => void;
  onSelectCard: (card: Card) => void;
  onCreateCard?: () => void;
  style?: CSSProperties;
  className?: string;
}

const SearchIcon: FC<{ size?: number }> = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CARD_LIMIT_OPTIONS = [3, 5, 10];

export const ForYouSection: FC<ForYouSectionProps> = ({
  cards,
  projects,
  columns,
  users,
  currentUserId,
  starredCardIds,
  onToggleStar,
  onSelectCard,
  onCreateCard,
  style,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<ForYouTabKey>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [cardLimit, setCardLimit] = useState<number>(5);

  // Enforce max 10 cards limit
  const effectiveLimit = Math.min(Math.max(1, cardLimit), 10);

  // 1. All latest cards sorted descending by updatedAt/createdAt
  const latestCards = useMemo(() => {
    return [...cards].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [cards]);

  const assignedCards = useMemo(() => {
    return latestCards.filter(
      (c) =>
        c.assigneeId === currentUserId ||
        (c.assigneeIds && c.assigneeIds.includes(currentUserId))
    );
  }, [latestCards, currentUserId]);

  const starredCards = useMemo(() => {
    return latestCards.filter((c) => starredCardIds.includes(c.id));
  }, [latestCards, starredCardIds]);

  const tabs: ForYouTabItem[] = [
    { key: 'latest', label: 'Latest cards', count: latestCards.length },
    { key: 'assigned', label: 'Assigned to me', count: assignedCards.length },
    { key: 'starred', label: 'Starred', count: starredCards.length },
  ];

  // 2. Select current card pool based on active tab
  const activePool = useMemo(() => {
    switch (activeTab) {
      case 'assigned':
        return assignedCards;
      case 'starred':
        return starredCards;
      case 'latest':
      default:
        return latestCards;
    }
  }, [activeTab, latestCards, assignedCards, starredCards]);

  // 3. Search filter
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return activePool;
    const q = searchQuery.toLowerCase().trim();
    return activePool.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.key.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [activePool, searchQuery]);

  // 4. Slice by card limit (max 10)
  const displayedCards = useMemo(() => {
    return filteredCards.slice(0, effectiveLimit);
  }, [filteredCards, effectiveLimit]);

  const getProject = (projectId: string) =>
    projects.find((p) => p.id === projectId);

  const getColumn = (columnId: string) =>
    columns.find((col) => col.id === columnId);

  const getUser = (userId?: string | null) =>
    users.find((u) => u.id === userId);

  return (
    <section className={`${styles.section} ${className}`} style={style}>
      {/* Header: Title & Search bar */}
      <div className={styles.sectionHeader}>
        <div className={styles.titleWrap}>
          <h2 className={styles.title}>Latest Cards</h2>
          <span className={styles.subtitle}>
            Recently updated cards across all your project workspaces
          </span>
        </div>

        <div className={styles.searchWrap}>
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Filter latest cards..."
            leftIcon={<SearchIcon size={14} />}
            containerStyle={{ marginBottom: 0 }}
            inputWrapperStyle={{ minHeight: 34, paddingInline: 8 }}
            style={{ fontSize: 13 }}
          />
        </div>
      </div>

      {/* Toolbar: Category Tabs + Card Limit Selector (max 10) */}
      <div className={styles.toolbar}>
        <ForYouTabs tabs={tabs} activeTab={activeTab} onChangeTab={setActiveTab} />

        <div className={styles.limitControl} aria-label="Card limit selector">
          <span className={styles.limitLabel}>Show:</span>
          <div className={styles.limitPills}>
            {CARD_LIMIT_OPTIONS.map((num) => (
              <button
                key={num}
                type="button"
                className={`${styles.limitBtn} ${effectiveLimit === num ? styles.limitBtnActive : ''}`}
                onClick={() => setCardLimit(num)}
                aria-pressed={effectiveLimit === num}
              >
                {num}
              </button>
            ))}
          </div>
          <span className={styles.limitHint}>(max 10)</span>
        </div>
      </div>

      {/* Cards List or Empty State */}
      <div className={styles.list}>
        {displayedCards.length > 0 ? (
          displayedCards.map((card) => (
            <ForYouItem
              key={card.id}
              card={card}
              project={getProject(card.projectId)}
              statusColumn={getColumn(card.columnId)}
              assignee={getUser(card.assigneeId)}
              starred={starredCardIds.includes(card.id)}
              onToggleStar={() => onToggleStar(card.id)}
              onPress={() => onSelectCard(card)}
            />
          ))
        ) : (
          <EmptyState
            title={
              searchQuery
                ? 'No matching cards found'
                : activeTab === 'starred'
                  ? 'No starred cards yet'
                  : 'No cards in this view'
            }
            description={
              searchQuery
                ? `No cards match "${searchQuery}". Try another keyword.`
                : activeTab === 'starred'
                  ? 'Star any card to easily find and track it here.'
                  : 'There are no active cards to display.'
            }
            actionLabel={onCreateCard ? 'Create card' : undefined}
            onAction={onCreateCard}
            style={{ paddingBlock: 24 }}
          />
        )}
      </div>

      {/* Footer Info Count */}
      {filteredCards.length > 0 && (
        <div className={styles.listFooter}>
          <span>
            Showing {displayedCards.length} of {filteredCards.length} cards (max 10 limit)
          </span>
        </div>
      )}
    </section>
  );
};

export default ForYouSection;
