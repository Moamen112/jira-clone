import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { clearAuthTokens, getAuthTokens, setAuthTokens } from './authTokens';
import { API_ENDPOINTS } from './endpoints';

interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Creates the Axios instance used by an application.
 * Create it once and reuse it for every API request.
 */
export function createApiClient(baseURL: string): AxiosInstance {
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
          { refreshToken: currentTokens.refreshToken }
        );

        const nextTokens = {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken ?? currentTokens.refreshToken,
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
