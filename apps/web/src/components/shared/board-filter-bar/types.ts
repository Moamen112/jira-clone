import type { CSSProperties } from 'react';
import type { User } from '@jira-clone/shared';

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
