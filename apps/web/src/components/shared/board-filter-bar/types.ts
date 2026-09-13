import type { CSSProperties } from 'react';
import type { Card as CardType, User } from '@jira-clone/shared';

export interface CardFilterCriteria {
  searchQuery?: string;
  assignedToMe?: boolean;
  createdByMe?: boolean;
  hasComments?: boolean;
  selectedUserIds?: string[];
  currentUserId?: string;
}

/**
 * Pure helper function to filter cards based on criteria
 */
export function filterCards(
  cards: CardType[],
  criteria: CardFilterCriteria
): CardType[] {
  return cards.filter((card) => {
    // 1. Search Query (matches key, title, or description)
    if (criteria.searchQuery && criteria.searchQuery.trim().length > 0) {
      const q = criteria.searchQuery.toLowerCase().trim();
      const matchKey = card.key.toLowerCase().includes(q);
      const matchTitle = card.title.toLowerCase().includes(q);
      const matchDesc = card.description
        ? card.description.toLowerCase().includes(q)
        : false;
      if (!matchKey && !matchTitle && !matchDesc) return false;
    }

    // 2. Assigned to Current User
    if (criteria.assignedToMe && criteria.currentUserId) {
      const isAssigned =
        card.assigneeId === criteria.currentUserId ||
        Boolean(card.assigneeIds && card.assigneeIds.includes(criteria.currentUserId));
      if (!isAssigned) return false;
    }

    // 3. Created / Reported by Current User
    if (criteria.createdByMe && criteria.currentUserId) {
      if (card.publisherId !== criteria.currentUserId) return false;
    }

    // 4. Has Comments
    if (criteria.hasComments) {
      if (!card.commentCount || card.commentCount <= 0) return false;
    }

    // 5. Filter by Selected Workspace Member User IDs
    if (criteria.selectedUserIds && criteria.selectedUserIds.length > 0) {
      const matchesAnyUser = criteria.selectedUserIds.some(
        (uid) =>
          card.assigneeId === uid ||
          Boolean(card.assigneeIds && card.assigneeIds.includes(uid))
      );
      if (!matchesAnyUser) return false;
    }

    return true;
  });
}

export interface BoardFilterBarProps {
  /** Search query text */
  searchQuery?: string;
  /** Search query change handler */
  onSearchChange?: (query: string) => void;
  /** Whether "Only My Issues" filter is active */
  assignedToMe?: boolean;
  /** Toggle "Only My Issues" */
  onToggleAssignedToMe?: () => void;
  /** Whether "Created by Me" filter is active */
  createdByMe?: boolean;
  /** Toggle "Created by Me" */
  onToggleCreatedByMe?: () => void;
  /** Whether "Has Comments" filter is active */
  hasComments?: boolean;
  /** Toggle "Has Comments" */
  onToggleHasComments?: () => void;
  /** Array of selected user IDs for assignee filtering */
  selectedUserIds?: string[];
  /** Toggle selection of a user ID */
  onToggleUserId?: (userId: string) => void;
  /** Available workspace members for user facepile quick filters */
  users?: User[];
  /** Current logged-in user */
  currentUser?: User | null;
  /** Filtered cards count to display */
  matchCount?: number;
  /** Total cards count */
  totalCount?: number;
  /** Callback fired when user clears all filters */
  onClearFilters?: () => void;
  /** Custom container style */
  style?: CSSProperties;
  /** Custom CSS class name */
  className?: string;
  /** Test identifier */
  testID?: string;
}
