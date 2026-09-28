import type { BackendProjectOwner, BackendProjectMemberUser } from './project';

export type BackendTaskStatus =
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'qa_review'
  | 'done';

export interface BackendTaskType {
  id: number;
  project?: number;
  name: string;
  is_active: boolean;
  task_count?: number;
  created_at?: string;
}

export interface BackendTaskProject {
  id: number;
  key: string;
  name: string;
  status: 'active' | 'done' | 'archived';
}

export interface BackendTask {
  id: number;
  key: string;
  title: string;
  description?: string;
  type: BackendTaskType;
  status: BackendTaskStatus | string;
  reporter?: BackendProjectOwner;
  assignee?: BackendProjectMemberUser | null;
  due_date?: string | null;
  allowed_statuses?: (BackendTaskStatus | string)[];
  created_at: string;
  updated_at: string;
  project?: BackendTaskProject;
  comment_count?: number;
  activity_count?: number;
}

export interface CreateTaskPayload {
  project: number;
  title: string;
  type: number;
  description?: string;
  assignee?: number | null;
  due_date?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  type?: number;
  assignee?: number | null;
  due_date?: string | null;
  status?: BackendTaskStatus | string;
}

export interface TaskListParams {
  project?: number | string;
  project_key?: string;
  status?: BackendTaskStatus | string;
  type?: number;
  assignee?: number;
  reporter?: number;
  unassigned?: boolean;
  mine?: boolean;
  created_after?: string;
  created_before?: string;
  due_after?: string;
  due_before?: string;
  search?: string;
  ordering?: string;
}

export interface BackendCommentAuthor {
  id: number;
  email: string;
  full_name: string;
  job_title?: string;
  avatar?: string | null;
}

export interface BackendComment {
  id: number;
  author: BackendCommentAuthor;
  body: string;
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCommentPayload {
  body: string;
}

export interface UpdateCommentPayload {
  body: string;
}

export interface BackendActivityEntry {
  id: number;
  actor: BackendCommentAuthor | null;
  action: 'created' | 'updated' | 'commented' | 'comment_deleted';
  field: string;
  old_value: string;
  new_value: string;
  comment: BackendComment | null;
  created_at: string;
}
