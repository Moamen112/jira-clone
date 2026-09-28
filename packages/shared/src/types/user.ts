import type { BackendTask } from './task';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
}

export interface DashboardStats {
  active_projects: number;
  assigned_tasks: number;
  reported_tasks: number;
  overdue_tasks: number;
  tasks_by_status: {
    todo: number;
    in_progress: number;
    in_review: number;
    qa_review: number;
    done: number;
  };
}

export interface DashboardResponse {
  stats: DashboardStats;
  recent_tasks: BackendTask[];
}

