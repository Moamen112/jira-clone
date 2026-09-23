import type { CSSProperties } from 'react';
import type { User, CardTypeOption } from '@jira-clone/shared';

export interface BoardFilterBarProps {
  /** Search query text */
  searchQuery?: string;
  /** Search query change handler */
  onSearchChange?: (query: string) => void;
  /** Whether "Assigned to me" filter is active */
  assignedToMe?: boolean;
  /** Toggle "Assigned to me" */
  onToggleAssignedToMe?: () => void;
  /** Whether "Shared with me" filter is active */
  sharedWithMe?: boolean;
  /** Toggle "Shared with me" */
  onToggleSharedWithMe?: () => void;
  /** Currently selected card type (e.g. 'all', 'task', 'bug', 'story', 'epic') */
  selectedType?: string;
  /** Callback fired when card type filter changes */
  onSelectType?: (type: string) => void;
  /** Available card type options (defaults to DEFAULT_CARD_TYPES) */
  cardTypes?: CardTypeOption[];
  /** Whether "Created by Me" filter is active (optional backwards compatibility) */
  createdByMe?: boolean;
  /** Toggle "Created by Me" (optional backwards compatibility) */
  onToggleCreatedByMe?: () => void;
  /** Whether "Has Comments" filter is active (optional backwards compatibility) */
  hasComments?: boolean;
  /** Toggle "Has Comments" (optional backwards compatibility) */
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
