export type CardPriority = 'lowest' | 'low' | 'medium' | 'high' | 'highest';

export type CardRole = 'publisher' | 'assignee' | 'viewer';

export interface Card {
  id: string;
  key: string; // e.g. "PROJ-14"
  title: string;
  description?: string;
  projectId: string;
  columnId: string;
  publisherId: string; // creator / reporter
  assigneeId?: string | null;
  assigneeIds?: string[]; // for multi-assignee support
  priority: CardPriority;
  order: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}
