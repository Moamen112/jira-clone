import { BoardColumn } from '../types/board';

export const DEFAULT_COLUMNS: Omit<BoardColumn, 'id' | 'projectId'>[] = [
  { title: 'To Do', order: 0, color: '#6B6A63' },
  { title: 'In Progress', order: 1, color: '#1E6F5C' },
  { title: 'In Review', order: 2, color: '#E37650' },
  { title: 'Done', order: 3, color: '#1E6F5C' },
];

export function getNextColumn(
  currentColumnId: string,
  columns: BoardColumn[]
): BoardColumn | undefined {
  const sorted = [...columns].sort((a, b) => a.order - b.order);
  const currentIndex = sorted.findIndex((c) => c.id === currentColumnId);
  if (currentIndex >= 0 && currentIndex < sorted.length - 1) {
    return sorted[currentIndex + 1];
  }
  return undefined;
}
