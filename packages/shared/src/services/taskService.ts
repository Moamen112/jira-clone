import { apiClient } from '../lib/apiClient';
import { API_ENDPOINTS } from '../lib/endpoints';
import type {
  BackendTask,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskListParams,
  BackendTaskType,
  BackendComment,
  CreateCommentPayload,
  UpdateCommentPayload,
  BackendActivityEntry,
} from '../types/task';

/**
 * Service for tasks, task types, comments and activity audit logs.
 */
export const taskService = {
  /**
   * Fetches tasks list from the backend /api/tasks/ endpoint.
   * Can be filtered by project, project_key, status, type, assignee, search, etc.
   */
  async getTasks(params?: TaskListParams): Promise<BackendTask[]> {
    const response = await apiClient.get<BackendTask[]>(API_ENDPOINTS.TASKS.LIST, {
      params,
    });
    return response.data;
  },

  /**
   * Fetches single task detail including full allowed_statuses, comment_count, etc.
   */
  async getTask(taskId: string | number): Promise<BackendTask> {
    const response = await apiClient.get<BackendTask>(
      API_ENDPOINTS.TASKS.DETAIL(taskId)
    );
    return response.data;
  },

  /**
   * Creates a new task in a project. Server assigns key and initial 'todo' status.
   */
  async createTask(payload: CreateTaskPayload): Promise<BackendTask> {
    const response = await apiClient.post<BackendTask>(
      API_ENDPOINTS.TASKS.CREATE,
      payload
    );
    return response.data;
  },

  /**
   * Updates an existing task (title, description, assignee, due_date, type, status).
   */
  async updateTask(
    taskId: string | number,
    payload: UpdateTaskPayload
  ): Promise<BackendTask> {
    const response = await apiClient.patch<BackendTask>(
      API_ENDPOINTS.TASKS.UPDATE(taskId),
      payload
    );
    return response.data;
  },

  /**
   * Deletes a task by ID.
   */
  async deleteTask(taskId: string | number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.TASKS.DELETE(taskId));
  },

  /**
   * Fetches task types for a project. Pass { limit: 'all' } to get all types.
   */
  async getTaskTypes(
    projectId: string | number,
    params: { limit?: string | number } = { limit: 'all' }
  ): Promise<BackendTaskType[]> {
    const response = await apiClient.get<BackendTaskType[]>(
      API_ENDPOINTS.PROJECT_TASK_TYPES.LIST(projectId),
      { params }
    );
    return response.data;
  },

  /**
   * Creates a new task type for a project.
   */
  async createTaskType(
    projectId: string | number,
    payload: { name: string }
  ): Promise<BackendTaskType> {
    const response = await apiClient.post<BackendTaskType>(
      API_ENDPOINTS.PROJECT_TASK_TYPES.CREATE(projectId),
      payload
    );
    return response.data;
  },

  /**
   * Fetches comments for a task, oldest first.
   */
  async getComments(taskId: string | number): Promise<BackendComment[]> {
    const response = await apiClient.get<BackendComment[]>(
      API_ENDPOINTS.TASK_COMMENTS.LIST(taskId)
    );
    return response.data;
  },

  /**
   * Posts a new comment on a task.
   */
  async addComment(
    taskId: string | number,
    payload: CreateCommentPayload
  ): Promise<BackendComment> {
    const response = await apiClient.post<BackendComment>(
      API_ENDPOINTS.TASK_COMMENTS.ADD(taskId),
      payload
    );
    return response.data;
  },

  /**
   * Edits an existing comment.
   */
  async updateComment(
    taskId: string | number,
    commentId: string | number,
    payload: UpdateCommentPayload
  ): Promise<BackendComment> {
    const response = await apiClient.patch<BackendComment>(
      API_ENDPOINTS.TASK_COMMENTS.EDIT(taskId, commentId),
      payload
    );
    return response.data;
  },

  /**
   * Deletes a comment by ID.
   */
  async deleteComment(
    taskId: string | number,
    commentId: string | number
  ): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.TASK_COMMENTS.DELETE(taskId, commentId));
  },

  /**
   * Fetches activity logs for a task.
   */
  async getActivity(
    taskId: string | number,
    params?: { tab?: 'all' | 'comments' | 'history'; ordering?: string }
  ): Promise<BackendActivityEntry[]> {
    const response = await apiClient.get<BackendActivityEntry[]>(
      API_ENDPOINTS.TASK_ACTIVITY.LIST(taskId),
      { params }
    );
    return response.data;
  },
};
