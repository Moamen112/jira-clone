import type { CSSProperties } from 'react';
import type { ActivityLog as ActivityLogType, User } from '@jira-clone/shared';

export type ActivityLogFilter = 'history' | 'all' | 'working';

export interface ActivityLogFilterOption {
  label: string;
  value: ActivityLogFilter;
}

export const ACTIVITY_LOG_FILTERS: ActivityLogFilterOption[] = [
  { label: 'History', value: 'history' },
];

export interface ActivityLogProps {
  /** Array of activity log events */
  logs: ActivityLogType[];
  /** Available workspace members to resolve actor profile */
  users?: User[];
  /** Optional filter for a specific card */
  cardId?: string;
  /** Optional header title (default: 'ACTIVITY') */
  title?: string;
  /** Maximum number of items to display */
  maxItems?: number;
  /** Custom container style */
  style?: CSSProperties;
  /** Custom CSS class */
  className?: string;
  /** Controlled active filter */
  filter?: ActivityLogFilter;
  /** Default filter if uncontrolled (default: 'all') */
  defaultFilter?: ActivityLogFilter;
  /** Callback fired when filter tab changes */
  onFilterChange?: (filter: ActivityLogFilter) => void;
  /** Whether to show the filter pills (default: true) */
  showFilters?: boolean;
  /** Whether to render with card background and border (default: true) */
  bordered?: boolean;
  /** Test identifier */
  testID?: string;
}
