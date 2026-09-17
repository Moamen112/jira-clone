import type { AxiosRequestConfig } from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Prevents a request from entering a second refresh/retry cycle. */
    _authRetry?: boolean;
    /** Internal snapshot used to recognize late 401s from an older token. */
    _authToken?: string | null;
    /** Sends this request without the access-token header. */
    skipAuth?: boolean;
    /** Returns a 401 directly instead of attempting to refresh the session. */
    skipAuthRefresh?: boolean;
  }
}

export interface AuthRequestConfig extends AxiosRequestConfig {
  _authRetry?: boolean;
  _authToken?: string | null;
  skipAuth?: boolean;
  skipAuthRefresh?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string | null;
}

/**
 * Small storage contract that works with localStorage wrappers, AsyncStorage,
 * Expo SecureStore, or an in-memory implementation.
 */
export interface TokenStorageAdapter {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
}

export type RefreshTokens = (refreshToken: string | null) => Promise<AuthTokens>;
export type AuthFailureCallback = (error: unknown) => void | Promise<void>;
export type ShouldInvalidateSession = (error: unknown) => boolean;

export interface ApiClientConfig {
  /** Base URL for all API requests. Configure it in the consuming app. */
  baseURL?: string;
  /** Request timeout in milliseconds. Defaults to 15 seconds. */
  timeout?: number;
  /** Sends cookies with cross-origin requests. Defaults to true. */
  withCredentials?: boolean;
  /** Default refresh route. Set to false to disable automatic refresh. */
  refreshEndpoint?: string | false;
  /** Optional persistence adapter. Prefer secure storage on mobile. */
  storageAdapter?: TokenStorageAdapter;
  /**
   * Overrides the default POST refresh request when the backend uses a
   * different payload or response shape.
   */
  refreshTokens?: RefreshTokens;
  /** Overrides which refresh failures should clear the session. */
  shouldInvalidateSession?: ShouldInvalidateSession;
  /** Called once when a refresh attempt fails, typically to navigate to login. */
  onAuthFailure?: AuthFailureCallback;
}
