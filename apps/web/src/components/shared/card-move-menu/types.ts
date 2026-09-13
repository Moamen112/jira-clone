import type { CSSProperties } from 'react';
import type { Card as CardType, BoardColumn, CardRole } from '@jira-clone/shared';

export type CardPosition = 'top' | 'bottom';

export interface CardMoveMenuProps {
  /** Visibility toggle */
  visible: boolean;
  /** The target card to move */
  card: CardType | null;
  /** Available columns on the board */
  columns: BoardColumn[];
  /** Close callback */
  onClose: () => void;
  /** Callback fired when a column is selected */
  onMoveColumn: (
    targetColumnId: string,
    card: CardType,
    position: CardPosition
  ) => void | Promise<void>;
  /** Current user ID for permission check */
  currentUserId?: string;
  /** Current user role override */
  currentUserRole?: CardRole;
  /** Loading state during move operation */
  loading?: boolean;
  /** Custom container style */
  style?: CSSProperties;
  /** Custom CSS class name */
  className?: string;
  /** Test identifier */
  testID?: string;
}
