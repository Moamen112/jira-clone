import type { Project } from './project';

export interface SpaceMember {
  id?: string;
  name: string;
  avatarUrl?: string;
}

export interface SpaceIssueCounts {
  todo: number;
  inProgress: number;
  done: number;
}

export interface SpaceItem {
  project: Project;
  members: SpaceMember[];
  issueCounts: SpaceIssueCounts;
  category?: 'software' | 'business' | 'operations' | 'infra';
}

export interface SpaceFilterOption {
  label: string;
  value: string;
}
