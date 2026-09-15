import type { CardRole } from '../types/card';

export function getCardRole(
  currentUserId: string,
  card: { publisherId: string; assigneeId?: string | null; assigneeIds?: string[] }
): CardRole {
  if (card.publisherId === currentUserId) return 'publisher';
  if (
    card.assigneeId === currentUserId ||
    (card.assigneeIds && card.assigneeIds.includes(currentUserId))
  ) {
    return 'assignee';
  }
  return 'viewer';
}

export const cardPermissions = {
  canEditTitle: (role: CardRole): boolean => role === 'publisher',
  canEditDescription: (role: CardRole): boolean => role === 'publisher' || role === 'assignee',
  canChangeAssignee: (role: CardRole): boolean => role === 'publisher',
  canMoveStatus: (role: CardRole): boolean => role === 'publisher' || role === 'assignee',
  canEditDates: (role: CardRole): boolean => role === 'publisher' || role === 'assignee',
  canDeleteCard: (role: CardRole): boolean => role === 'publisher',
  canComment: (_role: CardRole): boolean => true, // all authenticated members can comment
};
