import type { CSSProperties, ReactNode } from 'react';
import type { Project, User } from '@jira-clone/shared';
import type { BadgeVariant } from '../../base';

export type SidenavPage =
  | 'home'
  | 'projects'
  | 'board'
  | 'backlog'
  | 'activity'
  | 'notifications'
  | 'settings';

export interface SidenavNavItem {
  id: SidenavPage;
  label: string;
  icon: (props: { size?: number; active?: boolean }) => ReactNode;
  badge?: string | number;
  badgeVariant?: BadgeVariant;
  section: 'work' | 'planning' | 'system';
}

export interface SidenavProps {
  /** The currently active route / page ID */
  activePage?: SidenavPage | string;
  /** Navigation callback fired when a page item is clicked */
  onNavigate?: (page: SidenavPage) => void;
  /** Available projects for workspace switcher */
  projects?: Project[];
  /** The currently active project */
  currentProject?: Project | null;
  /** Project selection callback */
  onSelectProject?: (projectId: string) => void;
  /** Logged-in user */
  currentUser?: User | null;
  /** Unread notification badge count */
  unreadNotificationsCount?: number;
  /** Quick create issue callback */
  onCreateIssue?: () => void;
  /** Whether the sidebar is collapsed into an icon-only rail (default: false) */
  collapsed?: boolean;
  /** Callback fired when collapse state is toggled */
  onToggleCollapse?: (collapsed: boolean) => void;
  /** Dark mode state */
  isDark?: boolean;
  /** Dark mode toggle callback */
  onToggleTheme?: () => void;
  /** Logout callback */
  onLogout?: () => void;
  /** Custom container style */
  style?: CSSProperties;
  /** Custom CSS class name */
  className?: string;
  /** Test identifier */
  testID?: string;
}
