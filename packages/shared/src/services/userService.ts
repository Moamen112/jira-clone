import { apiClient } from '../lib/apiClient';
import { API_ENDPOINTS } from '../lib/endpoints';
import type { BackendProjectOwner, PaginatedResponse } from '../types/project';
import type { User } from '../types/user';
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
};
