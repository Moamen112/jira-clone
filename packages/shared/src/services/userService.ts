import { apiClient } from '../lib/apiClient';
import { API_ENDPOINTS } from '../lib/endpoints';
import type { BackendProjectOwner, PaginatedResponse } from '../types/project';
import type { User, DashboardResponse } from '../types/user';
import { getInitials } from '../utils/spaces';

/**
 * Service for fetching and interacting with users from the directory.
 */
export const userService = {
  /**
   * Retrieves users from the directory with optional search filter.
   */
  async getUsers(search?: string): Promise<User[]> {
    const response = await apiClient.get<PaginatedResponse<BackendProjectOwner>>(
      API_ENDPOINTS.USERS.LIST,
      { params: search ? { search } : undefined }
    );
    return response.data.results.map((u) => ({
      id: String(u.id),
      name: u.full_name || u.email,
      email: u.email,
      avatarUrl: u.avatar ?? undefined,
      initials: getInitials(u.full_name || u.email),
    }));
  },

  /**
   * Retrieves the currently logged-in user profile.
   */
  async getMe(): Promise<BackendProjectOwner> {
    const response = await apiClient.get<BackendProjectOwner>(API_ENDPOINTS.USERS.ME);
    return response.data;
  },

  /**
   * Retrieves dashboard statistics and recent tasks for the current user.
   */
  async getDashboard(params?: {
    limit?: number;
    created_after?: string;
    created_before?: string;
  }): Promise<DashboardResponse> {
    const response = await apiClient.get<DashboardResponse>(
      API_ENDPOINTS.USERS.DASHBOARD,
      { params }
    );
    return response.data;
  },
};

