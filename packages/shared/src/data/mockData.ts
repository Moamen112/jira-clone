import { User } from '../types/user';
import { Project } from '../types/project';
import { Board, BoardColumn } from '../types/board';
import { Card } from '../types/card';
import { Comment } from '../types/comment';
import { ActivityLog } from '../types/activity';

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Alex Morgan', email: 'alex@fieldnotes.dev', initials: 'AM' },
  { id: 'user-2', name: 'Sarah Connor', email: 'sarah@fieldnotes.dev', initials: 'SC' },
  { id: 'user-3', name: 'David Kim', email: 'david@fieldnotes.dev', initials: 'DK' },
];

export const mockCurrentUser = mockUsers[0]; // Alex Morgan

export const mockProject: Project = {
  id: 'proj-1',
  name: 'Fieldnotes Core',
  key: 'FIELD',
  description: 'Design system and core Kanban experience for Fieldnotes.',
  ownerId: 'user-1',
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-07T12:00:00.000Z',
};

export const mockProjects: Project[] = [
  mockProject,
  {
    id: 'proj-2',
    name: 'Marketplace Mobile',
    key: 'MKT',
    description: 'Consumer marketplace app — discovery, checkout, and order tracking.',
    ownerId: 'user-2',
    createdAt: '2026-09-03T09:00:00.000Z',
    updatedAt: '2026-09-06T14:30:00.000Z',
  },
  {
    id: 'proj-3',
    name: 'Billing & Invoicing',
    key: 'BILL',
    description: 'Invoices, payments, and dunning across the Fieldnotes platform.',
    ownerId: 'user-3',
    createdAt: '2026-09-04T11:00:00.000Z',
    updatedAt: '2026-09-05T16:45:00.000Z',
  },
];

export const mockColumns: BoardColumn[] = [
  { id: 'col-todo', projectId: 'proj-1', title: 'To Do', order: 0 },
  { id: 'col-progress', projectId: 'proj-1', title: 'In Progress', order: 1 },
  { id: 'col-review', projectId: 'proj-1', title: 'In Review', order: 2 },
  { id: 'col-done', projectId: 'proj-1', title: 'Done', order: 3 },
];

export const mockBoard: Board = {
  id: 'board-1',
  projectId: 'proj-1',
  name: 'Fieldnotes Core Sprint',
  columns: mockColumns,
};

export const mockCards: Card[] = [
  {
    id: 'card-1',
    key: 'FIELD-1',
    title: 'Implement design tokens and typography hierarchy',
    description: 'Set up IBM Plex Sans, IBM Plex Mono, and color scales for both light and dark modes.',
    projectId: 'proj-1',
    columnId: 'col-done',
    publisherId: 'user-1', // Alex (Publisher)
    assigneeId: 'user-2',  // Sarah (Assignee)
    assigneeIds: ['user-1', 'user-2'],
    priority: 'high',
    order: 0,
    commentCount: 2,
    createdAt: '2026-09-02T14:00:00.000Z',
    updatedAt: '2026-09-04T16:30:00.000Z',
  },
  {
    id: 'card-2',
    key: 'FIELD-2',
    title: 'Design card-level permission system',
    description: 'Enforce Publisher vs Assignee permissions for title edits, reassignments, and deletions.',
    projectId: 'proj-1',
    columnId: 'col-progress',
    publisherId: 'user-1', // Alex (Publisher)
    assigneeId: 'user-1',  // Alex (Assignee)
    priority: 'highest',
    order: 0,
    commentCount: 1,
    createdAt: '2026-09-03T09:00:00.000Z',
    updatedAt: '2026-09-07T11:00:00.000Z',
  },
  {
    id: 'card-3',
    key: 'FIELD-3',
    title: 'Add activity audit logs to card detail view',
    description: 'Capture timestamps and actor names whenever card moves or is reassigned.',
    projectId: 'proj-1',
    columnId: 'col-todo',
    publisherId: 'user-2', // Sarah (Publisher)
    assigneeId: 'user-3',  // David (Assignee)
    priority: 'medium',
    order: 0,
    commentCount: 0,
    createdAt: '2026-09-05T15:00:00.000Z',
    updatedAt: '2026-09-05T15:00:00.000Z',
  },
];

export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    cardId: 'card-1',
    authorId: 'user-1',
    content: 'Tokens are verified against the design-system doc. Both light and dark palettes match.',
    createdAt: '2026-09-04T10:00:00.000Z',
  },
  {
    id: 'comment-2',
    cardId: 'card-1',
    authorId: 'user-2',
    content: 'Awesome, moving this card to Done!',
    createdAt: '2026-09-04T16:25:00.000Z',
  },
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    cardId: 'card-1',
    actorId: 'user-1',
    action: 'CARD_CREATED',
    details: { to: 'To Do' },
    createdAt: '2026-09-02T14:00:00.000Z',
  },
  {
    id: 'log-2',
    cardId: 'card-1',
    actorId: 'user-1',
    action: 'ASSIGNEE_CHANGED',
    details: { to: 'Sarah Connor' },
    createdAt: '2026-09-02T14:05:00.000Z',
  },
  {
    id: 'log-3',
    cardId: 'card-1',
    actorId: 'user-2',
    action: 'STATUS_CHANGED',
    details: { from: 'In Progress', to: 'Done' },
    createdAt: '2026-09-04T16:30:00.000Z',
  },
];
