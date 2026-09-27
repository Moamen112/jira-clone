/**
 * Base URL for the backend server on localhost port 5000.
 */
export const DEFAULT_BASE_URL = 'http://localhost:5000';
export const API_BASE_URL = DEFAULT_BASE_URL;

/**
 * Endpoints directly mapped from Jira-Clone.postman_collection.json
 * Base URL defaults to http://localhost:5000 (as specified in the collection)
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/api/auth/register/',
    LOGIN: '/api/auth/login/',
    LOGIN_VERIFY: '/api/auth/login/verify/',
    REFRESH: '/api/auth/refresh/',
    LOGOUT: '/api/auth/logout/',
  },

  // Users
  USERS: {
    LIST: '/api/users/',
    ME: '/api/users/me/',
    DASHBOARD: '/api/users/me/dashboard/',
    DETAIL: (userId: string | number) => `/api/users/${userId}/`,
  },

  // Projects
  PROJECTS: {
    LIST: '/api/projects/',
    CREATE: '/api/projects/',
    DETAIL: (projectId: string | number) => `/api/projects/${projectId}/`,
    UPDATE: (projectId: string | number) => `/api/projects/${projectId}/`,
    DELETE: (projectId: string | number) => `/api/projects/${projectId}/`,
    MEMBERS: (projectId: string | number) => `/api/projects/${projectId}/members/`,
    MEMBER_DETAIL: (projectId: string | number, memberId: string | number) =>
      `/api/projects/${projectId}/members/${memberId}/`,
    TASK_TYPES: (projectId: string | number) => `/api/projects/${projectId}/task-types/`,
    TASK_TYPE_DETAIL: (projectId: string | number, taskTypeId: string | number) =>
      `/api/projects/${projectId}/task-types/${taskTypeId}/`,
  },

  // Project members
  PROJECT_MEMBERS: {
    LIST: (projectId: string | number) => `/api/projects/${projectId}/members/`,
    ADD: (projectId: string | number) => `/api/projects/${projectId}/members/`,
    DETAIL: (projectId: string | number, memberId: string | number) =>
      `/api/projects/${projectId}/members/${memberId}/`,
    REMOVE: (projectId: string | number, memberId: string | number) =>
      `/api/projects/${projectId}/members/${memberId}/`,
  },

  // Project task types
  PROJECT_TASK_TYPES: {
    LIST: (projectId: string | number) => `/api/projects/${projectId}/task-types/`,
    CREATE: (projectId: string | number) => `/api/projects/${projectId}/task-types/`,
    DETAIL: (projectId: string | number, taskTypeId: string | number) =>
      `/api/projects/${projectId}/task-types/${taskTypeId}/`,
    UPDATE: (projectId: string | number, taskTypeId: string | number) =>
      `/api/projects/${projectId}/task-types/${taskTypeId}/`,
    DELETE: (projectId: string | number, taskTypeId: string | number) =>
      `/api/projects/${projectId}/task-types/${taskTypeId}/`,
  },

  // Tasks
  TASKS: {
    LIST: '/api/tasks/',
    CREATE: '/api/tasks/',
    DETAIL: (taskId: string | number) => `/api/tasks/${taskId}/`,
    UPDATE: (taskId: string | number) => `/api/tasks/${taskId}/`,
    DELETE: (taskId: string | number) => `/api/tasks/${taskId}/`,
    COMMENTS: (taskId: string | number) => `/api/tasks/${taskId}/comments/`,
    COMMENT_DETAIL: (taskId: string | number, commentId: string | number) =>
      `/api/tasks/${taskId}/comments/${commentId}/`,
    ACTIVITY: (taskId: string | number) => `/api/tasks/${taskId}/activity/`,
    ACTIVITY_DETAIL: (taskId: string | number, activityId: string | number) =>
      `/api/tasks/${taskId}/activity/${activityId}/`,
  },

  // Task comments
  TASK_COMMENTS: {
    LIST: (taskId: string | number) => `/api/tasks/${taskId}/comments/`,
    ADD: (taskId: string | number) => `/api/tasks/${taskId}/comments/`,
    DETAIL: (taskId: string | number, commentId: string | number) =>
      `/api/tasks/${taskId}/comments/${commentId}/`,
    EDIT: (taskId: string | number, commentId: string | number) =>
      `/api/tasks/${taskId}/comments/${commentId}/`,
    DELETE: (taskId: string | number, commentId: string | number) =>
      `/api/tasks/${taskId}/comments/${commentId}/`,
  },

  // Task activity
  TASK_ACTIVITY: {
    LIST: (taskId: string | number) => `/api/tasks/${taskId}/activity/`,
    DETAIL: (taskId: string | number, activityId: string | number) =>
      `/api/tasks/${taskId}/activity/${activityId}/`,
  },
} as const;
