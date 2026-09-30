import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { projectActions, selectProjectState } from '../store/projectStore';
import { projectService } from '../services/projectService';
import { parseErrorMessage } from '../utils/errors';
import { backendProjectToProject, backendProjectToSpaceItem } from '../utils/spaces';
import type {
  BackendProject,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectListParams,
  PaginatedResponse,
} from '../types/project';

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

/** Projects and spaces used by both web and mobile. */
export function useProjects(options: UseProjectsOptions = {}) {
  const { search, name, status, owner, ordering, page = 1, pageSize = 36, autoFetch = true } = options;
  const dispatch = useDispatch();
  const { projects, totalCount, isLoading, error } = useSelector(selectProjectState);

  const fetchProjects = useCallback(async (overrideParams?: ProjectListParams): Promise<PaginatedResponse<BackendProject>> => {
    dispatch(projectActions.setLoading(true));
    try {
      const params = {
        search, name, status, owner, ordering, page, page_size: pageSize,
        ...overrideParams,
      };
      const cleanedParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
      ) as ProjectListParams;
      const data = await projectService.getProjects(cleanedParams);
      dispatch(projectActions.setProjects(data));
      return data;
    } catch (caught) {
      const message = parseErrorMessage(caught);
      dispatch(projectActions.setError(message));
      throw new Error(message);
    }
  }, [dispatch, search, name, status, owner, ordering, page, pageSize]);

  const createProject = useCallback(async (payload: CreateProjectPayload): Promise<BackendProject> => {
    dispatch(projectActions.setLoading(true));
    try {
      const created = await projectService.createProject(payload);
      dispatch(projectActions.addProject(created));
      return created;
    } catch (caught) {
      const message = parseErrorMessage(caught);
      dispatch(projectActions.setError(message));
      throw new Error(message);
    }
  }, [dispatch]);

  const updateProject = useCallback(async (id: string | number, payload: UpdateProjectPayload): Promise<BackendProject> => {
    dispatch(projectActions.setLoading(true));
    try {
      const updated = await projectService.updateProject(id, payload);
      dispatch(projectActions.updateProject(updated));
      return updated;
    } catch (caught) {
      const message = parseErrorMessage(caught);
      dispatch(projectActions.setError(message));
      throw new Error(message);
    }
  }, [dispatch]);

  const deleteProject = useCallback(async (id: string | number): Promise<void> => {
    dispatch(projectActions.setLoading(true));
    try {
      await projectService.deleteProject(id);
      dispatch(projectActions.removeProject(id));
    } catch (caught) {
      const message = parseErrorMessage(caught);
      dispatch(projectActions.setError(message));
      throw new Error(message);
    }
  }, [dispatch]);

  useEffect(() => {
    if (autoFetch) void fetchProjects().catch(() => {});
  }, [autoFetch, fetchProjects]);

  const spaces = useMemo(() => projects.map(backendProjectToSpaceItem), [projects]);
  const plainProjects = useMemo(() => projects.map(backendProjectToProject), [projects]);

  return {
    projects,
    spaces,
    plainProjects,
    totalCount,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    refetch: () => fetchProjects(),
  };
}
