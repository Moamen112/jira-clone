import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { TokenManager } from './tokenManager';
import type {
  AuthFailureCallback,
  AuthRequestConfig,
  RefreshTokens,
  ShouldInvalidateSession,
} from './types';

/** Writes the Bearer header through AxiosHeaders so casing stays normalized. */
function setAuthorizationHeader(
  config: InternalAxiosRequestConfig,
  accessToken: string
): void {
  config.headers.set('Authorization', `Bearer ${accessToken}`);
}

/** Adds the latest access token immediately before each request is sent. */
export function setupRequestInterceptor(
  instance: AxiosInstance,
  tokenManager: TokenManager
): number {
  return instance.interceptors.request.use(async (config) => {
    const authConfig = config as InternalAxiosRequestConfig & AuthRequestConfig;

    // Initialization is cached, so this only incurs an asynchronous storage
    // read on the first request made by the application.
    await tokenManager.initialize();

    if (authConfig.skipAuth || config.headers.has('Authorization')) {
      return config;
    }

    const accessToken = tokenManager.getAccessToken();
    authConfig._authToken = accessToken;

    if (accessToken) {
      setAuthorizationHeader(config, accessToken);
    }

    return config;
  });
}

interface ResponseInterceptorOptions {
  tokenManager: TokenManager;
  refreshTokens: RefreshTokens;
  shouldInvalidateSession: ShouldInvalidateSession;
  onAuthFailure?: AuthFailureCallback;
}

/**
 * Refreshes at most once for a burst of 401 responses. Every failed request
 * awaits the same promise and is replayed exactly once with the new token.
 */
export function setupResponseInterceptor(
  instance: AxiosInstance,
  options: ResponseInterceptorOptions
): number {
  const {
    tokenManager,
    refreshTokens,
    shouldInvalidateSession,
    onAuthFailure,
  } = options;
  let refreshPromise: Promise<string> | null = null;

  const getFreshAccessToken = (): Promise<string> => {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        const refreshRevision = tokenManager.getRevision();

        try {
          const tokens = await refreshTokens(tokenManager.getRefreshToken());

          if (!tokens.accessToken) {
            throw new Error('The refresh response did not include an access token.');
          }

          const accepted = await tokenManager.setTokensIfCurrent(tokens, refreshRevision);
          if (!accepted) {
            throw new Error('Discarded a stale token refresh result.');
          }

          return tokens.accessToken;
        } catch (error) {
          // Timeouts, offline errors, and server outages are temporary. Keep
          // the session so a later request can attempt refresh again.
          if (!shouldInvalidateSession(error)) {
            throw error;
          }

          // Do not let an old refresh failure clear a login/logout that happened
          // while the network call was in flight.
          if (tokenManager.getRevision() !== refreshRevision) {
            throw error;
          }

          const clearing = tokenManager.clearTokens();
          const clearedRevision = tokenManager.getRevision();
          await clearing;

          // Clear and notify once at the refresh boundary, not once per 401.
          if (tokenManager.getRevision() !== clearedRevision) {
            throw error;
          }

          try {
            await onAuthFailure?.(error);
          } catch {
            // Navigation/telemetry errors must not hide the refresh failure.
          }

          throw error;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    return refreshPromise;
  };

  return instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as
        | (InternalAxiosRequestConfig & AuthRequestConfig)
        | undefined;

      if (
        !originalRequest ||
        error.response?.status !== 401 ||
        originalRequest.skipAuthRefresh ||
        originalRequest._authRetry
      ) {
        throw error;
      }

      // Set the guard before awaiting the shared promise. This also protects
      // requests that joined an already-running refresh from retry loops.
      originalRequest._authRetry = true;

      // A slow response may carry a 401 for the token that another request has
      // already refreshed. Replay it with the current token without refreshing
      // the session a second time.
      const currentAccessToken = tokenManager.getAccessToken();
      if (
        originalRequest._authToken !== undefined &&
        currentAccessToken &&
        originalRequest._authToken !== currentAccessToken
      ) {
        originalRequest._authToken = currentAccessToken;
        setAuthorizationHeader(originalRequest, currentAccessToken);
        return instance(originalRequest);
      }

      const accessToken = await getFreshAccessToken();
      originalRequest._authToken = accessToken;
      setAuthorizationHeader(originalRequest, accessToken);

      return instance(originalRequest);
    }
  );
}
