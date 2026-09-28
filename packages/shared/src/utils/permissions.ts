import type { CardRole } from '../types/card';
import type { BackendTaskStatus } from '../types/task';
import { columnIdToStatus } from './tasks';

/**
 * Status permissions depend strictly on the destination status:
 * - Publisher (reporter): 'todo', 'done'
 * - Assignee: 'in_progress', 'in_review', 'qa_review'
 * - Publisher who is also Assignee: all five ('todo', 'in_progress', 'in_review', 'qa_review', 'done')
 * - Anyone else (viewer / other team members): none
 */
export const PUBLISHER_ALLOWED_STATUSES: BackendTaskStatus[] = ['todo', 'done'];
export const ASSIGNEE_ALLOWED_STATUSES: BackendTaskStatus[] = [
  'in_progress',
  'in_review',
  'qa_review',
];
export const ALL_TASK_STATUSES: BackendTaskStatus[] = [
  'todo',
  'in_progress',
  'in_review',
  'qa_review',
  'done',
];

export interface CardParticipantInfo {
  publisherId?: string | number | null;
  reporterId?: string | number | null;
  reporter?: { id?: string | number } | null;
  publisher?: { id?: string | number } | null;
  assigneeId?: string | number | null;
  assigneeIds?: (string | number)[];
  assignee?: { id?: string | number } | null;
  allowedStatuses?: (BackendTaskStatus | string)[];
}

/**
 * Checks whether the given user is the publisher (reporter) of the card.
 */
export function isCardPublisher(
  currentUserId: string | number | undefined,
  card?: CardParticipantInfo | null
): boolean {
  if (!currentUserId || !card) return false;
  const uid = String(currentUserId).trim();
  if (!uid) return false;
  if (card.publisherId && String(card.publisherId).trim() === uid) return true;
  if (card.reporterId && String(card.reporterId).trim() === uid) return true;
  if (card.reporter?.id && String(card.reporter.id).trim() === uid) return true;
  if (card.publisher?.id && String(card.publisher.id).trim() === uid) return true;
  return false;
}

/**
 * Checks whether the given user is an assignee of the card.
 */
export function isCardAssignee(
  currentUserId: string | number | undefined,
  card?: CardParticipantInfo | null
): boolean {
  if (!currentUserId || !card) return false;
  const uid = String(currentUserId).trim();
  if (!uid) return false;
  if (card.assigneeId && String(card.assigneeId).trim() === uid) return true;
  if (card.assignee?.id && String(card.assignee.id).trim() === uid) return true;
  if (card.assigneeIds && card.assigneeIds.some((id) => String(id).trim() === uid)) return true;
  return false;
}

export function getCardRole(
  currentUserId: string | number | undefined,
  card?: CardParticipantInfo | null
): CardRole {
  if (!currentUserId || !card) return 'viewer';
  if (isCardPublisher(currentUserId, card)) return 'publisher';
  if (isCardAssignee(currentUserId, card)) return 'assignee';
  return 'viewer';
}

/**
 * Returns the destination statuses that the current user is permitted to transition to:
 * - Publisher: ['todo', 'done']
 * - Assignee: ['in_progress', 'in_review', 'qa_review']
 * - Publisher who is also Assignee: all five ('todo', 'in_progress', 'in_review', 'qa_review', 'done')
 * - Other: []
 */
export function getAllowedStatusesForUser(
  currentUserId: string | number | undefined,
  card?: CardParticipantInfo | null
): BackendTaskStatus[] {
  if (!currentUserId || !card) return [];
  const publisher = isCardPublisher(currentUserId, card);
  const assignee = isCardAssignee(currentUserId, card);

  // When publisher is also assignee, all 5 statuses are allowed
  if (publisher && assignee) {
    return ALL_TASK_STATUSES;
  }
  if (publisher) {
    return PUBLISHER_ALLOWED_STATUSES;
  }
  if (assignee) {
    return ASSIGNEE_ALLOWED_STATUSES;
  }
  if ((publisher || assignee) && card.allowedStatuses && card.allowedStatuses.length > 0) {
    return card.allowedStatuses as BackendTaskStatus[];
  }
  return [];
}

/**
 * Validates whether the current user is permitted to transition the card to the target status or column.
 */
export function isStatusAllowedForUser(
  currentUserId: string | number | undefined,
  card: CardParticipantInfo | null | undefined,
  targetStatusOrColumnId: string
): boolean {
  if (!currentUserId || !card) return false;
  const targetStatus = columnIdToStatus(targetStatusOrColumnId);
  const allowed = getAllowedStatusesForUser(currentUserId, card);
  return allowed.includes(targetStatus);
}

/**
 * Returns a human-friendly explanation of why a user can or cannot transition a status.
 */
export function getStatusPermissionHint(
  currentUserId: string | number | undefined,
  card?: CardParticipantInfo | null
): string {
  if (!currentUserId) return 'You must be signed in to change card status.';
  if (!card) return '';
  const publisher = isCardPublisher(currentUserId, card);
  const assignee = isCardAssignee(currentUserId, card);

  if (publisher && assignee) {
    return 'You are both publisher and assignee. You can set any status.';
  }
  if (publisher) {
    return 'As publisher, you can only set status to To Do or Done.';
  }
  if (assignee) {
    return 'As assignee, you can only set status to In Progress, In Review, or QA Review.';
  }
  return 'Only the publisher or assignee can change the status of this card.';
}

export const cardPermissions = {
  canEditTitle: (role: CardRole): boolean => role === 'publisher',
  canEditDescription: (role: CardRole): boolean => role === 'publisher',
  canChangeAssignee: (role: CardRole): boolean => role === 'publisher',
  canMoveStatus: (role: CardRole): boolean => role === 'publisher' || role === 'assignee',
  canEditDates: (role: CardRole): boolean => role === 'publisher',
  canDeleteCard: (role: CardRole): boolean => role === 'publisher',
  canComment: (_role: CardRole): boolean => true, // all authenticated members can comment
};
