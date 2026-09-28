export interface BackendProjectOwner {
  id: number;
  email: string;
  full_name: string;
  job_title?: string;
  avatar?: string | null;
}

export interface BackendProjectMemberUser {
  id: number;
  email: string;
  full_name: string;
  job_title?: string;
  avatar?: string | null;
}

export interface BackendProjectMember {
  user: BackendProjectMemberUser;
  role: 'owner' | 'member';
  joined_at: string;
}

export type { BackendTaskType, BackendTask } from './task';

export interface BackendProject {
  id: number;
  name: string;
  key: string;
  description?: string;
  status: 'active' | 'done' | 'archived';
  owner: BackendProjectOwner;
  task_count: number;
  open_task_count: number;
  created_at: string;
  updated_at: string;
  members?: BackendProjectMember[];
  task_types?: BackendTaskType[];
  tasks?: BackendTask[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ProjectListParams {
  search?: string;
  name?: string;
  status?: 'active' | 'done' | 'archived';
  owner?: number;
  ordering?: string; // 'created_at', 'updated_at', 'name', 'key', 'status', 'task_count', 'open_task_count' (prefix with - for desc)
  page?: number;
  page_size?: number;
}

export interface CreateProjectPayload {
  name: string;
  key: string;
  description?: string;
  members?: number[];
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  status?: 'active' | 'done' | 'archived';
}

export interface Project {
  id: string;
  name: string;
  key: string; // e.g. "PROJ", "FIELD"
  description?: string;
  ownerId: string;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  openTaskCount?: number;
  status?: 'active' | 'done' | 'archived';
  owner?: BackendProjectOwner;
}
