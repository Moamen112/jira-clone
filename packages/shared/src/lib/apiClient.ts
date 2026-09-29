import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { clearAuthTokens, getAuthTokens, setAuthTokens } from './authTokens';
import { API_BASE_URL, API_ENDPOINTS } from './endpoints';

interface RefreshResponse {
  access?: string;
  refresh?: string;
  accessToken?: string;
  refreshToken?: string;
}

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Creates the Axios instance used by an application.
 * Create it once and reuse it for every API request.
 * Defaults to http://localhost:5000 if no baseURL is provided.
 */
export function createApiClient(baseURL: string = API_BASE_URL): AxiosInstance {
  const apiClient = axios.create({ baseURL });
  const refreshClient = axios.create({ baseURL });

  apiClient.interceptors.request.use((config) => {
    const accessToken = getAuthTokens()?.accessToken;

    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const request = error.config as RetryRequestConfig | undefined;
      const currentTokens = getAuthTokens();

      if (error.response?.status !== 401 || !request || request._retry || !currentTokens) {
        return Promise.reject(error);
      }

      request._retry = true;

      try {
        const response = await refreshClient.post<RefreshResponse>(
          API_ENDPOINTS.AUTH.REFRESH,
          {
            refresh: currentTokens.refreshToken,
            refreshToken: currentTokens.refreshToken,
          },
          { baseURL: apiClient.defaults.baseURL }
        );

        const data = response.data;
        const nextAccessToken = data.access ?? data.accessToken;
        const nextRefreshToken = data.refresh ?? data.refreshToken ?? currentTokens.refreshToken;

        if (!nextAccessToken) {
          throw new Error('No access token received from refresh endpoint');
        }

        const nextTokens = {
          accessToken: nextAccessToken,
          refreshToken: nextRefreshToken,
        };

        setAuthTokens(nextTokens);
        request.headers.set('Authorization', `Bearer ${nextTokens.accessToken}`);

        return apiClient(request);
      } catch (refreshError) {
        clearAuthTokens();
        return Promise.reject(refreshError);
      }
    }
  );

  return apiClient;
}

/**
 * Default shared API client pointing to API_BASE_URL.
 */
export const apiClient = createApiClient();

/** Use the same API server for regular requests and token refresh. */
export function setApiBaseUrl(baseURL: string): void {
  apiClient.defaults.baseURL = baseURL.replace(/\/$/, '');
}
