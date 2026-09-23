import type {
  Card,
  CreateCardInput,
  CardTypeOption,
  CreateStatusInput,
  CreateCardTypeInput,
} from '../types/card';
import type { CardFilterCriteria, BoardColumn } from '../types/board';
import { mockCurrentUser } from '../data/mockData';

/**
 * Creates a new Card entity based on input with sensible defaults.
 */
export function createCard(input: CreateCardInput): Card {
  const now = new Date().toISOString();
  return {
    id: `card-${Date.now()}`,
    key: `${input.projectKey}-${input.cardIndex ?? 1}`,
    title: input.title.trim(),
    description: input.description,
    projectId: input.projectId,
    columnId: input.columnId,
    publisherId: input.publisherId || mockCurrentUser.id,
    assigneeId: input.assigneeId ?? null,
    assigneeIds: input.assigneeIds ?? (input.assigneeId ? [input.assigneeId] : []),
    priority: input.priority ?? 'medium',
    type: input.type ?? 'task',
    dueDate: input.dueDate,
    order: input.order ?? 0,
    commentCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Checks if a card matches a search query by key, title, or description.
 */
export function matchesCardSearch(card: Card, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;

  return (
    card.key.toLowerCase().includes(trimmed) ||
    card.title.toLowerCase().includes(trimmed) ||
    Boolean(card.description?.toLowerCase().includes(trimmed))
  );
}

/**
 * Filters an array of Cards based on a search query.
 */
export function filterCardsBySearch(cards: Card[], query: string): Card[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return cards;
  return cards.filter((card) => matchesCardSearch(card, trimmed));
}

/**
 * Checks if a card is assigned to a specific user (supports single assignee and multi-assignees).
 */
export function isCardAssignedToUser(card: Card, userId?: string): boolean {
  if (!userId) return false;
  return (
    card.assigneeId === userId ||
    Boolean(card.assigneeIds && card.assigneeIds.includes(userId))
  );
}

/**
 * Filters an array of Cards to those assigned to a specific user.
 */
export function filterCardsByAssignee(cards: Card[], userId?: string): Card[] {
  if (!userId) return cards;
  return cards.filter((card) => isCardAssignedToUser(card, userId));
}

/**
 * Checks if a card was created / reported by a specific user.
 */
export function isCardCreatedByUser(card: Card, userId?: string): boolean {
  if (!userId) return false;
  return card.publisherId === userId;
}

/**
 * Filters an array of Cards to those created by a specific user.
 */
export function filterCardsByCreator(cards: Card[], userId?: string): Card[] {
  if (!userId) return cards;
  return cards.filter((card) => isCardCreatedByUser(card, userId));
}

/**
 * Checks if a card is shared with a specific user (i.e. created by another team member).
 */
export function isCardSharedWithUser(card: Card, userId?: string): boolean {
  if (!userId) return false;
  return card.publisherId !== userId;
}

/**
 * Filters an array of Cards to those shared with a specific user.
 */
export function filterCardsByShared(cards: Card[], userId?: string): Card[] {
  if (!userId) return cards;
  return cards.filter((card) => isCardSharedWithUser(card, userId));
}

/**
 * Checks if a card has comments.
 */
export function hasCardComments(card: Card): boolean {
  return Boolean(card.commentCount && card.commentCount > 0);
}

/**
 * Filters an array of Cards to those that have comments.
 */
export function filterCardsWithComments(cards: Card[]): Card[] {
  return cards.filter((card) => hasCardComments(card));
}

/**
 * Pure helper function to filter cards based on criteria (search, assignees, publisher, comments)
 */
export function filterCards(
  cards: Card[],
  criteria: CardFilterCriteria
): Card[] {
  return cards.filter((card) => {
    // 1. Search Query (matches key, title, or description)
    if (criteria.searchQuery && criteria.searchQuery.trim().length > 0) {
      if (!matchesCardSearch(card, criteria.searchQuery)) return false;
    }

    // 2. Assigned to Current User
    if (criteria.assignedToMe && criteria.currentUserId) {
      if (!isCardAssignedToUser(card, criteria.currentUserId)) return false;
    }

    // 3. Shared with Me
    if (criteria.sharedWithMe && criteria.currentUserId) {
      if (!isCardSharedWithUser(card, criteria.currentUserId)) return false;
    }

    // 4. Created / Reported by Current User (backwards compatibility)
    if (criteria.createdByMe && criteria.currentUserId) {
      if (!isCardCreatedByUser(card, criteria.currentUserId)) return false;
    }

    // 5. Has Comments (backwards compatibility)
    if (criteria.hasComments) {
      if (!hasCardComments(card)) return false;
    }

    // 6. Filter by Selected Workspace Member User IDs (and 'unassigned')
    if (criteria.selectedUserIds && criteria.selectedUserIds.length > 0) {
      const includesUnassigned = criteria.selectedUserIds.includes('unassigned');
      const regularUserIds = criteria.selectedUserIds.filter((id) => id !== 'unassigned');

      const matchesRegularUser =
        regularUserIds.length > 0 &&
        regularUserIds.some((uid) => isCardAssignedToUser(card, uid));
      const matchesUnassigned =
        includesUnassigned &&
        !card.assigneeId &&
        (!card.assigneeIds || card.assigneeIds.length === 0);

      if (!matchesRegularUser && !matchesUnassigned) return false;
    }

    // 7. Filter by Card Type (e.g. 'task', 'bug', 'story', 'epic')
    if (criteria.type && criteria.type !== 'all') {
      const cardType = (card.type || 'task').toLowerCase();
      if (cardType !== criteria.type.toLowerCase()) return false;
    }

    return true;
  });
}

/**
 * Updates a card within an array of cards by matching its ID.
 */
export function updateCardInList(cards: Card[], updatedCard: Card): Card[] {
  return cards.map((c) => (c.id === updatedCard.id ? updatedCard : c));
}

/**
 * Moves a card to a different column in a cards array, updating its updatedAt timestamp.
 */
export function moveCardToColumn(cards: Card[], cardId: string, columnId: string): Card[] {
  const now = new Date().toISOString();
  return cards.map((c) =>
    c.id === cardId ? { ...c, columnId, updatedAt: now } : c
  );
}

/**
 * Removes a card from an array of cards by matching its ID.
 */
export function deleteCardFromList(cards: Card[], cardId: string): Card[] {
  return cards.filter((c) => c.id !== cardId);
}

/**
 * Processes a card title text change, returning the title and any validation error.
 */
export function handleCardTitleChange(
  text: string
): { title: string; error?: string } {
  const trimmed = text.trim();
  if (!trimmed) {
    return { title: text, error: 'Card title cannot be empty.' };
  }
  if (trimmed.length > 255) {
    return { title: text, error: 'Card title must not exceed 255 characters.' };
  }
  return { title: text, error: undefined };
}

export const DEFAULT_CARD_TYPES: CardTypeOption[] = [
  { id: 'task', label: 'Task', color: '#3B82F6' },
  { id: 'bug', label: 'Bug', color: '#EF4444' },
  { id: 'story', label: 'Story', color: '#10B981' },
  { id: 'epic', label: 'Epic', color: '#8B5CF6' },
];

export const PRESET_STATUS_COLORS: string[] = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#64748B',
];

/**
 * Creates a new BoardColumn (status) entity with validation.
 */
export function createStatusColumn(
  input: CreateStatusInput
): { column?: BoardColumn; error?: string } {
  const trimmed = input.title.trim();
  if (!trimmed) {
    return { error: 'Status name cannot be empty.' };
  }
  const column: BoardColumn = {
    id: `col-${Date.now()}`,
    projectId: input.projectId,
    title: trimmed,
    color: input.color,
    order: input.order ?? 0,
  };
  return { column };
}

/**
 * Creates a new CardTypeOption entity with validation.
 */
export function createCardType(
  input: CreateCardTypeInput
): { cardType?: CardTypeOption; error?: string } {
  const trimmed = input.label.trim();
  if (!trimmed) {
    return { error: 'Type name cannot be empty.' };
  }
  const id = trimmed.toLowerCase().replace(/\s+/g, '-');
  const cardType: CardTypeOption = {
    id,
    label: trimmed,
    color: input.color || '#3B82F6',
  };
  return { cardType };
}
