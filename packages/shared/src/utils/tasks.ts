import type {
  BackendTask,
  BackendTaskStatus,
  BackendTaskType,
  BackendComment,
  BackendActivityEntry,
} from '../types/task';
import type {
  BackendProjectMember,
  BackendProjectMemberUser,
  BackendProjectOwner,
} from '../types/project';
import type { Card, CardTypeOption } from '../types/card';
import type { BoardColumn } from '../types/board';
import type { Comment } from '../types/comment';
import type { ActivityLog, ActivityActionType } from '../types/activity';
import type { User } from '../types/user';

export const TASK_TYPE_COLORS: Record<string, string> = {
  bug: '#EF4444',
  feature: '#10B981',
  task: '#3B82F6',
  improvement: '#F59E0B',
  story: '#8B5CF6',
  epic: '#EC4899',
  spike: '#6366F1',
};

export function getTaskTypeColor(name: string): string {
  const normalized = name.trim().toLowerCase();
  return TASK_TYPE_COLORS[normalized] || '#3B82F6';
}

/**
 * Maps backend task status string to Kanban Board column ID.
 */
export function statusToColumnId(status?: string): string {
  if (!status) return 'col-todo';
  switch (status.toLowerCase()) {
    case 'in_progress':
      return 'col-progress';
    case 'in_review':
      return 'col-review';
    case 'qa_review':
      return 'col-qa';
    case 'done':
      return 'col-done';
    case 'todo':
    default:
      return 'col-todo';
  }
}

/**
 * Maps Kanban Board column ID to backend task status string.
 */
export function columnIdToStatus(columnId?: string): BackendTaskStatus {
  if (!columnId) return 'todo';
  const lower = columnId.toLowerCase();
  if (lower === 'col-todo' || lower === 'todo') return 'todo';
  if (lower === 'col-progress' || lower.includes('progress')) return 'in_progress';
  if (lower === 'col-review' || (lower.includes('review') && !lower.includes('qa'))) return 'in_review';
  if (lower === 'col-qa' || lower.includes('qa')) return 'qa_review';
  if (lower === 'col-done' || lower === 'done') return 'done';
  return 'todo';
}

/**
 * Generates standard 5-stage Kanban board columns for a given project.
 */
export function createDefaultBoardColumns(projectId: string | number): BoardColumn[] {
  const pid = String(projectId);
  return [
    { id: 'col-todo', projectId: pid, title: 'To Do', order: 0, color: '#6B6A63' },
    { id: 'col-progress', projectId: pid, title: 'In Progress', order: 1, color: '#1E6F5C' },
    { id: 'col-review', projectId: pid, title: 'In Review', order: 2, color: '#E37650' },
    { id: 'col-qa', projectId: pid, title: 'QA Review', order: 3, color: '#8B5CF6' },
    { id: 'col-done', projectId: pid, title: 'Done', order: 4, color: '#1E6F5C' },
  ];
}

/**
 * Converts a BackendTask entity into a frontend Card object.
 */
export function backendTaskToCard(task: BackendTask): Card {
  const columnId = statusToColumnId(task.status);
  const typeId = task.type?.id;
  const rawTypeName = task.type?.name || 'Task';
  const typeKey = typeId ? String(typeId) : rawTypeName.toLowerCase();

  return {
    id: String(task.id),
    key: task.key,
    title: task.title,
    description: task.description || '',
    projectId: task.project?.id ? String(task.project.id) : '',
    columnId,
    publisherId: task.reporter?.id ? String(task.reporter.id) : '',
    assigneeId: task.assignee?.id ? String(task.assignee.id) : null,
    assigneeIds: task.assignee?.id ? [String(task.assignee.id)] : [],
    priority: 'medium',
    type: typeKey,
    typeId: typeId,
    typeName: rawTypeName,
    order: 0,
    commentCount: task.comment_count ?? 0,
    dueDate: task.due_date ? task.due_date : undefined,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  };
}

/**
 * Converts BackendTaskType to frontend CardTypeOption for pickers and filters.
 */
export function taskTypeToCardTypeOption(type: BackendTaskType): CardTypeOption {
  return {
    id: String(type.id),
    label: type.name,
  };
}

/**
 * Converts BackendComment to frontend Comment.
 */
export function backendCommentToComment(bc: BackendComment, cardId: string): Comment {
  return {
    id: String(bc.id),
    cardId,
    authorId: String(bc.author.id),
    content: bc.body,
    createdAt: bc.created_at,
    updatedAt: bc.updated_at,
  };
}

/**
 * Converts BackendActivityEntry to frontend ActivityLog.
 */
export function backendActivityToActivityLog(
  ba: BackendActivityEntry,
  cardId: string
): ActivityLog {
  let action: ActivityActionType = 'CARD_CREATED';
  if (ba.action === 'created') {
    action = 'CARD_CREATED';
  } else if (ba.action === 'commented') {
    action = 'COMMENT_ADDED';
  } else if (ba.action === 'comment_deleted') {
    action = 'COMMENT_ADDED';
  } else if (ba.action === 'updated') {
    if (ba.field === 'status') action = 'STATUS_CHANGED';
    else if (ba.field === 'title') action = 'TITLE_UPDATED';
    else if (ba.field === 'assignee') action = 'ASSIGNEE_CHANGED';
    else if (ba.field === 'description') action = 'DESCRIPTION_UPDATED';
    else action = 'STATUS_CHANGED';
  }

  return {
    id: String(ba.id),
    cardId,
    actorId: ba.actor?.id ? String(ba.actor.id) : 'system',
    action,
    details: {
      from: ba.old_value || undefined,
      to: ba.new_value || undefined,
      message: ba.field ? `${ba.field} changed` : ba.action,
    },
    createdAt: ba.created_at,
  };
}

/**
 * Normalizes member or owner info into frontend User format.
 */
export function backendMemberToUser(
  item: BackendProjectMember | BackendProjectMemberUser | BackendProjectOwner
): User {
  const user = 'user' in item ? item.user : item;
  const name = user.full_name?.trim() || user.email;
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || name.slice(0, 2).toUpperCase();

  return {
    id: String(user.id),
    name,
    email: user.email,
    initials,
    avatarUrl: user.avatar || undefined,
  };
}
