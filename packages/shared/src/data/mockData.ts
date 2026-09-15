import type { User } from '../types/user';
import type { Project } from '../types/project';
import type { Board, BoardColumn } from '../types/board';
import type { Card } from '../types/card';
import type { Comment } from '../types/comment';
import type { ActivityLog } from '../types/activity';
import type { SpaceItem, SpaceFilterOption } from '../types/space';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alex Morgan',
    email: 'alex@fieldnotes.dev',
    initials: 'AM',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  { id: 'user-2', name: 'Sarah Connor', email: 'sarah@fieldnotes.dev', initials: 'SC' },
  { id: 'user-3', name: 'David Kim', email: 'david@fieldnotes.dev', initials: 'DK' },
  { id: 'user-4', name: 'Elena Rostova', email: 'elena@fieldnotes.dev', initials: 'ER' },
  { id: 'user-5', name: 'James Wilson', email: 'james@fieldnotes.dev', initials: 'JW' },
];

export const mockCurrentUser = mockUsers[0]; // Alex Morgan

export const mockProject: Project = {
  id: 'proj-1',
  name: 'Fieldnotes Core',
  key: 'FIELD',
  description: 'Design system and core Kanban experience for Fieldnotes.',
  ownerId: 'user-1',
  startDate: '2026-09-01',
  dueDate: '2026-10-15',
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-12T15:30:00.000Z',
};

export const mockProjects: Project[] = [
  mockProject,
  {
    id: 'proj-2',
    name: 'Marketplace Mobile',
    key: 'MKT',
    description: 'Consumer marketplace app — discovery, checkout, and order tracking.',
    ownerId: 'user-2',
    startDate: '2026-09-03',
    dueDate: '2026-10-31',
    createdAt: '2026-09-03T09:00:00.000Z',
    updatedAt: '2026-09-11T11:45:00.000Z',
  },
  {
    id: 'proj-3',
    name: 'Billing & Invoicing',
    key: 'BILL',
    description: 'Invoices, payments, and dunning across the Fieldnotes platform.',
    ownerId: 'user-3',
    startDate: '2026-08-15',
    dueDate: '2026-09-10',
    createdAt: '2026-09-04T11:00:00.000Z',
    updatedAt: '2026-09-10T09:15:00.000Z',
  },
  {
    id: 'proj-4',
    name: 'Cloud Infrastructure & SRE',
    key: 'INFRA',
    description: 'Kubernetes cluster deployments, Terraform multi-region configs, and Datadog monitoring.',
    ownerId: 'user-1',
    startDate: '2026-09-02',
    dueDate: '2026-11-20',
    createdAt: '2026-09-02T14:00:00.000Z',
    updatedAt: '2026-09-09T18:20:00.000Z',
  },
  {
    id: 'proj-5',
    name: 'Customer Success & Support',
    key: 'CSS',
    description: 'Tier 2 technical escalation pipelines, user feedback triage, and knowledgebase articles.',
    ownerId: 'user-2',
    startDate: '2026-09-05',
    dueDate: '2026-10-05',
    createdAt: '2026-09-05T08:30:00.000Z',
    updatedAt: '2026-09-08T13:10:00.000Z',
  },
  {
    id: 'proj-6',
    name: 'Security & Compliance Audits',
    key: 'SEC',
    description: 'SOC2 Type II controls, automated vulnerability scanning, and IAM privilege reviews.',
    ownerId: 'user-3',
    startDate: '2026-08-20',
    dueDate: '2026-09-30',
    createdAt: '2026-09-06T13:00:00.000Z',
    updatedAt: '2026-09-07T16:00:00.000Z',
  },
  {
    id: 'proj-7',
    name: 'Analytics & Data Pipeline',
    key: 'DATA',
    description: 'Snowflake ETL workflows, dbt dimensional models, and real-time telemetry streaming.',
    ownerId: 'user-1',
    startDate: '2026-09-07',
    dueDate: '2026-12-15',
    createdAt: '2026-09-07T09:00:00.000Z',
    updatedAt: '2026-09-08T11:00:00.000Z',
  },
  {
    id: 'proj-8',
    name: 'Developer Tooling & CLI',
    key: 'DX',
    description: 'Internal developer portal, automated scaffolding commands, and local preview environments.',
    ownerId: 'user-2',
    startDate: '2026-09-08',
    dueDate: '2026-10-25',
    createdAt: '2026-09-08T10:30:00.000Z',
    updatedAt: '2026-09-09T14:15:00.000Z',
  },
  {
    id: 'proj-9',
    name: 'Growth & Lifecycle Marketing',
    key: 'MKTG',
    description: 'A/B landing experiments, onboarding email triggers, and referral loop analytics.',
    ownerId: 'user-4',
    startDate: '2026-09-09',
    dueDate: '2026-10-18',
    createdAt: '2026-09-09T12:00:00.000Z',
    updatedAt: '2026-09-10T15:30:00.000Z',
  },
  {
    id: 'proj-10',
    name: 'Design System & Tokens',
    key: 'DS',
    description: 'Universal Figma token sync, React primitives, accessible contrast scales, and themes.',
    ownerId: 'user-1',
    startDate: '2026-09-09',
    dueDate: '2026-11-10',
    createdAt: '2026-09-09T14:00:00.000Z',
    updatedAt: '2026-09-11T09:45:00.000Z',
  },
  {
    id: 'proj-11',
    name: 'Global Payments Gateway',
    key: 'PAY',
    description: 'Multi-currency settlement, regional checkout routing, and fraud screening webhooks.',
    ownerId: 'user-3',
    startDate: '2026-09-10',
    dueDate: '2026-11-30',
    createdAt: '2026-09-10T08:00:00.000Z',
    updatedAt: '2026-09-11T16:00:00.000Z',
  },
  {
    id: 'proj-12',
    name: 'AI Assistant & Copilot',
    key: 'AI',
    description: 'LLM retrieval-augmented generation, contextual issue summarization, and autocomplete.',
    ownerId: 'user-1',
    startDate: '2026-09-10',
    dueDate: '2026-12-31',
    createdAt: '2026-09-10T11:30:00.000Z',
    updatedAt: '2026-09-12T10:20:00.000Z',
  },
  {
    id: 'proj-13',
    name: 'Identity & Access Platform',
    key: 'AUTH',
    description: 'SAML 2.0 / OIDC enterprise single sign-on, SCIM user provisioning, and session controls.',
    ownerId: 'user-3',
    startDate: '2026-09-11',
    dueDate: '2026-10-20',
    createdAt: '2026-09-11T09:15:00.000Z',
    updatedAt: '2026-09-12T13:40:00.000Z',
  },
  {
    id: 'proj-14',
    name: 'Privacy & Legal Operations',
    key: 'LEGAL',
    description: 'GDPR / CCPA data subject request workflows, vendor review audits, and terms enforcement.',
    ownerId: 'user-2',
    startDate: '2026-09-11',
    dueDate: '2026-11-05',
    createdAt: '2026-09-11T13:00:00.000Z',
    updatedAt: '2026-09-12T15:10:00.000Z',
  },
  {
    id: 'proj-15',
    name: 'Real-time Messaging Service',
    key: 'NOTIF',
    description: 'WebSocket event fan-out, user push notifications, and daily email digest dispatchers.',
    ownerId: 'user-1',
    startDate: '2026-09-11',
    dueDate: '2026-10-30',
    createdAt: '2026-09-11T15:30:00.000Z',
    updatedAt: '2026-09-13T09:00:00.000Z',
  },
  {
    id: 'proj-16',
    name: 'People Operations & Culture',
    key: 'HR',
    description: 'Employee onboarding checklists, performance review cycles, and department headcount planning.',
    ownerId: 'user-4',
    startDate: '2026-09-12',
    dueDate: '2026-12-01',
    createdAt: '2026-09-12T08:00:00.000Z',
    updatedAt: '2026-09-13T11:20:00.000Z',
  },
  {
    id: 'proj-17',
    name: 'Automated Testing Pipeline',
    key: 'QA',
    description: 'End-to-end Playwright test suites, API contract testing, and regression benchmark runs.',
    ownerId: 'user-5',
    startDate: '2026-09-12',
    dueDate: '2026-10-10',
    createdAt: '2026-09-12T10:00:00.000Z',
    updatedAt: '2026-09-13T14:30:00.000Z',
  },
  {
    id: 'proj-18',
    name: 'Global Search Engine',
    key: 'SRCH',
    description: 'Elasticsearch cluster indexing, fuzzy typo correction, and sub-50ms query latency cache.',
    ownerId: 'user-1',
    startDate: '2026-09-12',
    dueDate: '2026-11-15',
    createdAt: '2026-09-12T12:00:00.000Z',
    updatedAt: '2026-09-14T08:00:00.000Z',
  },
];

export const mockSpaces: SpaceItem[] = [
  {
    project: mockProjects[0],
    members: [
      { id: 'user-1', name: 'Alex Morgan' },
      { id: 'user-2', name: 'Sarah Connor' },
      { id: 'user-3', name: 'David Kim' },
    ],
    issueCounts: { todo: 8, inProgress: 4, done: 22 },
    category: 'software',
  },
  {
    project: mockProjects[1],
    members: [
      { id: 'user-2', name: 'Sarah Connor' },
      { id: 'user-4', name: 'Elena Rostova' },
    ],
    issueCounts: { todo: 12, inProgress: 7, done: 38 },
    category: 'software',
  },
  {
    project: mockProjects[2],
    members: [
      { id: 'user-3', name: 'David Kim' },
      { id: 'user-1', name: 'Alex Morgan' },
      { id: 'user-5', name: 'James Wilson' },
    ],
    issueCounts: { todo: 5, inProgress: 3, done: 19 },
    category: 'business',
  },
  {
    project: mockProjects[3],
    members: [
      { id: 'user-1', name: 'Alex Morgan' },
      { id: 'user-4', name: 'Elena Rostova' },
    ],
    issueCounts: { todo: 14, inProgress: 9, done: 45 },
    category: 'infra',
  },
  {
    project: mockProjects[4],
    members: [
      { id: 'user-5', name: 'James Wilson' },
      { id: 'user-2', name: 'Sarah Connor' },
    ],
    issueCounts: { todo: 9, inProgress: 6, done: 31 },
    category: 'operations',
  },
  {
    project: mockProjects[5],
    members: [
      { id: 'user-3', name: 'David Kim' },
      { id: 'user-1', name: 'Alex Morgan' },
    ],
    issueCounts: { todo: 3, inProgress: 2, done: 14 },
    category: 'operations',
  },
  {
    project: mockProjects[6],
    members: [
      { id: 'user-1', name: 'Alex Morgan' },
      { id: 'user-3', name: 'David Kim' },
    ],
    issueCounts: { todo: 11, inProgress: 5, done: 27 },
    category: 'infra',
  },
  {
    project: mockProjects[7],
    members: [
      { id: 'user-2', name: 'Sarah Connor' },
      { id: 'user-5', name: 'James Wilson' },
    ],
    issueCounts: { todo: 6, inProgress: 8, done: 18 },
    category: 'software',
  },
  {
    project: mockProjects[8],
    members: [
      { id: 'user-4', name: 'Elena Rostova' },
      { id: 'user-2', name: 'Sarah Connor' },
    ],
    issueCounts: { todo: 15, inProgress: 4, done: 20 },
    category: 'business',
  },
  {
    project: mockProjects[9],
    members: [
      { id: 'user-1', name: 'Alex Morgan' },
      { id: 'user-4', name: 'Elena Rostova' },
    ],
    issueCounts: { todo: 7, inProgress: 11, done: 34 },
    category: 'software',
  },
  {
    project: mockProjects[10],
    members: [
      { id: 'user-3', name: 'David Kim' },
      { id: 'user-5', name: 'James Wilson' },
    ],
    issueCounts: { todo: 4, inProgress: 6, done: 28 },
    category: 'business',
  },
  {
    project: mockProjects[11],
    members: [
      { id: 'user-1', name: 'Alex Morgan' },
      { id: 'user-2', name: 'Sarah Connor' },
      { id: 'user-3', name: 'David Kim' },
    ],
    issueCounts: { todo: 16, inProgress: 10, done: 42 },
    category: 'software',
  },
  {
    project: mockProjects[12],
    members: [
      { id: 'user-3', name: 'David Kim' },
      { id: 'user-1', name: 'Alex Morgan' },
    ],
    issueCounts: { todo: 5, inProgress: 3, done: 25 },
    category: 'infra',
  },
  {
    project: mockProjects[13],
    members: [
      { id: 'user-2', name: 'Sarah Connor' },
      { id: 'user-4', name: 'Elena Rostova' },
    ],
    issueCounts: { todo: 8, inProgress: 2, done: 16 },
    category: 'operations',
  },
  {
    project: mockProjects[14],
    members: [
      { id: 'user-1', name: 'Alex Morgan' },
      { id: 'user-5', name: 'James Wilson' },
    ],
    issueCounts: { todo: 9, inProgress: 7, done: 33 },
    category: 'software',
  },
  {
    project: mockProjects[15],
    members: [
      { id: 'user-4', name: 'Elena Rostova' },
      { id: 'user-2', name: 'Sarah Connor' },
    ],
    issueCounts: { todo: 6, inProgress: 3, done: 12 },
    category: 'business',
  },
  {
    project: mockProjects[16],
    members: [
      { id: 'user-5', name: 'James Wilson' },
      { id: 'user-1', name: 'Alex Morgan' },
    ],
    issueCounts: { todo: 13, inProgress: 9, done: 51 },
    category: 'software',
  },
  {
    project: mockProjects[17],
    members: [
      { id: 'user-1', name: 'Alex Morgan' },
      { id: 'user-3', name: 'David Kim' },
    ],
    issueCounts: { todo: 10, inProgress: 8, done: 39 },
    category: 'infra',
  },
];

export const mockSpaceTypeOptions: SpaceFilterOption[] = [
  { label: 'All types', value: 'all' },
  { label: 'Software', value: 'software' },
  { label: 'Business', value: 'business' },
  { label: 'Operations', value: 'operations' },
];

export const mockSpaceOwnerOptions: SpaceFilterOption[] = [
  { label: 'All owners', value: 'all' },
  { label: 'Created by me', value: 'me' },
  { label: 'Shared with me', value: 'shared' },
];

export const mockSpaceSortOptions: SpaceFilterOption[] = [
  { label: 'Recently updated', value: 'updated' },
  { label: 'Name (A to Z)', value: 'name-asc' },
  { label: 'Name (Z to A)', value: 'name-desc' },
  { label: 'Most issues', value: 'issues' },
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
    startDate: '2026-09-02',
    dueDate: '2026-09-10',
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
    startDate: '2026-09-03',
    dueDate: '2026-09-15',
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
    startDate: '2026-09-05',
    dueDate: '2026-09-20',
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
  {
    id: 'log-4',
    cardId: 'card-1',
    actorId: 'user-2',
    action: 'WORK_LOGGED',
    details: { message: 'Logged 3h 30m of implementation work' },
    createdAt: '2026-09-04T17:00:00.000Z',
  },
];
