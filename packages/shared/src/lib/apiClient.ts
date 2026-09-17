import axios, { type AxiosInstance } from 'axios';
import { setupRequestInterceptor, setupResponseInterceptor } from './interceptors';
import { TokenManager } from './tokenManager';
import type { ApiClientConfig, AuthTokens, RefreshTokens } from './types';

/** Only explicit refresh rejection is terminal; network/5xx failures can retry. */
function defaultShouldInvalidateSession(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return true;

  const status = error.response?.status;
  return status === 400 || status === 401 || status === 403;
}

/** Validates the default refresh response without tying it to an `any` shape. */
function parseRefreshTokens(responseData: unknown): AuthTokens {
  if (
    typeof responseData !== 'object' ||
    responseData === null ||
    !('accessToken' in responseData) ||
    typeof responseData.accessToken !== 'string'
  ) {
    throw new Error('The refresh response did not include an access token.');
  }

  const refreshToken =
    'refreshToken' in responseData &&
    (typeof responseData.refreshToken === 'string' || responseData.refreshToken === null)
      ? responseData.refreshToken
      : undefined;

  return { accessToken: responseData.accessToken, refreshToken };
}

/**
 * Creates one configured Axios instance. Pass the same TokenManager to login
 * code so successful auth can call `await tokenManager.setTokens(tokens)`.
 */
export function createApiClient(
  config: ApiClientConfig = {},
  providedTokenManager?: TokenManager
): AxiosInstance {
  const {
    baseURL = '',
    timeout = 15_000,
    withCredentials = true,
    refreshEndpoint = '/auth/refresh',
    storageAdapter,
    refreshTokens: customRefreshTokens,
    shouldInvalidateSession = defaultShouldInvalidateSession,
    onAuthFailure,
  } = config;

  const tokenManager = providedTokenManager ?? new TokenManager(storageAdapter);
  if (providedTokenManager && storageAdapter) {
    tokenManager.setStorageAdapter(storageAdapter);
  }

  const instance = axios.create({
    baseURL,
    timeout,
    withCredentials,
    headers: { Accept: 'application/json' },
  });

  setupRequestInterceptor(instance, tokenManager);

  let refreshTokens: RefreshTokens | undefined = customRefreshTokens;

  if (!refreshTokens && refreshEndpoint !== false) {
    // A separate bare instance ensures the refresh call cannot recursively
    // trigger the response interceptor that it is trying to satisfy.
    const refreshClient = axios.create({
      baseURL,
      timeout,
      withCredentials,
      headers: { Accept: 'application/json' },
    });

    refreshTokens = async (storedRefreshToken) => {
      const body = storedRefreshToken
        ? { refreshToken: storedRefreshToken }
        : undefined;
      const response = await refreshClient.post<unknown>(refreshEndpoint, body);

      return parseRefreshTokens(response.data);
    };
  }

  if (refreshTokens) {
    setupResponseInterceptor(instance, {
      tokenManager,
      refreshTokens,
      shouldInvalidateSession,
      onAuthFailure,
    });
  }

  return instance;
}
