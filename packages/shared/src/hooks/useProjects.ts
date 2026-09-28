import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import {
  getProjectState,
  subscribeProjectState,
  setInternalProjectState,
} from '../store/projectStore';
import { projectService } from '../services/projectService';
import { parseErrorMessage } from '../utils/errors';
import { backendProjectToProject, backendProjectToSpaceItem } from '../utils/spaces';
import type {
  BackendProject,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectListParams,
  PaginatedResponse,
  Project,
} from '../types/project';
import type { SpaceItem } from '../types/space';

export interface UseProjectsOptions {
  search?: string;
  name?: string;
  status?: 'active' | 'done' | 'archived';
  owner?: number;
  ordering?: string;
  page?: number;
  pageSize?: number;
  autoFetch?: boolean;
}

/**
 * Universal hook for managing projects and spaces across Web and Mobile.
 * Synchronizes with backend REST API and provides reactive state updates.
 */
export function useProjects(options: UseProjectsOptions = {}) {
  const {
    search,
    name,
    status,
    owner,
    ordering,
    page = 1,
    pageSize = 36,
    autoFetch = true,
  } = options;

  const state = useSyncExternalStore(
    subscribeProjectState,
    getProjectState,
    getProjectState
  );

  /**
   * Fetches projects from the backend /api/projects/ endpoint.
   */
  const fetchProjects = useCallback(
    async (overrideParams?: ProjectListParams): Promise<PaginatedResponse<BackendProject>> => {
      setInternalProjectState({ isLoading: true, error: null });
      try {
        const params: ProjectListParams = {
          search: overrideParams?.search !== undefined ? overrideParams.search : search,
          name: overrideParams?.name !== undefined ? overrideParams.name : name,
          status: overrideParams?.status !== undefined ? overrideParams.status : status,
          owner: overrideParams?.owner !== undefined ? overrideParams.owner : owner,
          ordering: overrideParams?.ordering !== undefined ? overrideParams.ordering : ordering,
          page: overrideParams?.page !== undefined ? overrideParams.page : page,
          page_size: overrideParams?.page_size !== undefined ? overrideParams.page_size : pageSize,
        };

        // Remove undefined / empty string properties
        const cleanedParams = Object.entries(params).reduce<Record<string, unknown>>(
          (acc, [key, value]) => {
            if (value !== undefined && value !== '') {
              acc[key] = value;
            }
            return acc;
          },
          {}
        ) as ProjectListParams;

        const data = await projectService.getProjects(cleanedParams);
        setInternalProjectState({
          projects: data.results,
          totalCount: data.count,
          isLoading: false,
          error: null,
        });
        return data;
      } catch (err: unknown) {
        const errorMsg = parseErrorMessage(err);
        setInternalProjectState({ isLoading: false, error: errorMsg });
        throw new Error(errorMsg);
      }
    },
    [search, name, status, owner, ordering, page, pageSize]
  );

  /**
   * Creates a new project and prepends it to the project list.
   */
  const createProject = useCallback(
    async (payload: CreateProjectPayload): Promise<BackendProject> => {
      setInternalProjectState({ isLoading: true, error: null });
      try {
        const created = await projectService.createProject(payload);
        const currentState = getProjectState();
        setInternalProjectState({
          projects: [created, ...currentState.projects],
          totalCount: currentState.totalCount + 1,
          isLoading: false,
          error: null,
        });
        return created;
      } catch (err: unknown) {
        const errorMsg = parseErrorMessage(err);
        setInternalProjectState({ isLoading: false, error: errorMsg });
        throw new Error(errorMsg);
      }
    },
    []
  );

  /**
   * Updates an existing project in state and on backend.
   */
  const updateProject = useCallback(
    async (
      projectId: string | number,
      payload: UpdateProjectPayload
    ): Promise<BackendProject> => {
      setInternalProjectState({ isLoading: true, error: null });
      try {
        const updated = await projectService.updateProject(projectId, payload);
        const currentState = getProjectState();
        const updatedProjects = currentState.projects.map((p) =>
          p.id === updated.id ? updated : p
        );
        setInternalProjectState({
          projects: updatedProjects,
          isLoading: false,
          error: null,
        });
        return updated;
      } catch (err: unknown) {
        const errorMsg = parseErrorMessage(err);
        setInternalProjectState({ isLoading: false, error: errorMsg });
        throw new Error(errorMsg);
      }
    },
    []
  );

  /**
   * Deletes a project by ID and removes it from state.
   */
  const deleteProject = useCallback(
    async (projectId: string | number): Promise<void> => {
      setInternalProjectState({ isLoading: true, error: null });
      try {
        await projectService.deleteProject(projectId);
        const currentState = getProjectState();
        const numericId = Number(projectId);
        setInternalProjectState({
          projects: currentState.projects.filter((p) => p.id !== numericId),
          totalCount: Math.max(0, currentState.totalCount - 1),
          isLoading: false,
          error: null,
        });
      } catch (err: unknown) {
        const errorMsg = parseErrorMessage(err);
        setInternalProjectState({ isLoading: false, error: errorMsg });
        throw new Error(errorMsg);
      }
    },
    []
  );

  /**
   * Automatically fetch projects on parameter changes if autoFetch is true.
   */
  useEffect(() => {
    if (autoFetch) {
      let isMounted = true;
      fetchProjects().catch(() => {
        // Error is captured in state
      });
      return () => {
        isMounted = false;
      };
    }
  }, [fetchProjects, autoFetch]);

  // Derived SpaceItems for card layouts
  const spaces: SpaceItem[] = useMemo(() => {
    return state.projects.map(backendProjectToSpaceItem);
  }, [state.projects]);

  // Derived Projects for legacy/mobile components
  const plainProjects: Project[] = useMemo(() => {
    return state.projects.map(backendProjectToProject);
  }, [state.projects]);

  return {
    projects: state.projects,
    spaces,
    plainProjects,
    totalCount: state.totalCount,
    isLoading: state.isLoading,
    error: state.error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    refetch: () => fetchProjects(),
  };
}
