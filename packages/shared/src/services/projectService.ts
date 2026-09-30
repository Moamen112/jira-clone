import { apiClient } from '../lib/apiClient';
import { API_ENDPOINTS } from '../lib/endpoints';
import type {
  BackendProject,
  BackendProjectMember,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectListParams,
  PaginatedResponse,
} from '../types/project';

/**
 * Service for managing projects and spaces via the backend REST API.
 */
export const projectService = {
  /**
   * Fetches paginated list of projects the current user is a member of.
   * Supports filtering by search, name, status, owner, ordering, page, and page_size.
   */
  async getProjects(params?: ProjectListParams): Promise<PaginatedResponse<BackendProject>> {
    const response = await apiClient.get<PaginatedResponse<BackendProject>>(
      API_ENDPOINTS.PROJECTS.LIST,
      { params }
    );
    return response.data;
  },

  /**
   * Fetches single project detail including members, task types and tasks.
   */
  async getProject(projectId: string | number): Promise<BackendProject> {
    const response = await apiClient.get<BackendProject>(
      API_ENDPOINTS.PROJECTS.DETAIL(projectId)
    );
    return response.data;
  },

  /**
   * Creates a new project with owner set to authenticated user.
   */
  async createProject(payload: CreateProjectPayload): Promise<BackendProject> {
    const response = await apiClient.post<BackendProject>(
      API_ENDPOINTS.PROJECTS.CREATE,
      payload
    );
    return response.data;
  },

  /**
   * Updates an existing project (name, description, status).
   */
  async updateProject(
    projectId: string | number,
    payload: UpdateProjectPayload
  ): Promise<BackendProject> {
    const response = await apiClient.patch<BackendProject>(
      API_ENDPOINTS.PROJECTS.UPDATE(projectId),
      payload
    );
    return response.data;
  },

  /**
   * Deletes a project by ID.
   */
  async deleteProject(projectId: string | number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PROJECTS.DELETE(projectId));
  },

  /**
   * Fetches the members list for a project.
   */
  async getProjectMembers(projectId: string | number): Promise<BackendProjectMember[]> {
    const response = await apiClient.get<BackendProjectMember[]>(
      API_ENDPOINTS.PROJECT_MEMBERS.LIST(projectId)
    );
    return response.data;
  },

  /**
   * Adds users as members to a project.
   * Backend expects { users: number[] }
   */
  async addProjectMembers(
    projectId: string | number,
    userIds: number[]
  ): Promise<BackendProjectMember[]> {
    const response = await apiClient.post<BackendProjectMember[]>(
      API_ENDPOINTS.PROJECT_MEMBERS.ADD(projectId),
      { users: userIds }
    );
    return response.data;
  },

  /**
   * Removes a member from a project by user ID.
   */
  async removeProjectMember(
    projectId: string | number,
    userId: string | number
  ): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PROJECT_MEMBERS.REMOVE(projectId, userId));
  },
};
