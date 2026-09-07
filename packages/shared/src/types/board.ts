export type DefaultColumnType = 'todo' | 'in_progress' | 'in_review' | 'done';

export interface BoardColumn {
  id: string;
  projectId: string;
  title: string;
  order: number;
  color?: string;
}

export interface Board {
  id: string;
  projectId: string;
  name: string;
  columns: BoardColumn[];
}
