import { getCookie, setCookie, deleteCookie } from '../utils/cookies';
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  STORAGE_KEYS,
  type AsyncStorageAdapter,
} from '../services/storageService';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const COOKIE_ACCESS_TOKEN = 'jira_access_token';
const COOKIE_REFRESH_TOKEN = 'jira_refresh_token';

let mobileTokenAdapter: AsyncStorageAdapter | undefined;

/**
 * Configure an AsyncStorage adapter for native mobile token persistence.
 */
export function setMobileTokenAdapter(adapter: AsyncStorageAdapter): void {
  mobileTokenAdapter = adapter;
  getStorageItem<AuthTokens>(STORAGE_KEYS.AUTH_TOKENS, 'mobile', null, adapter).then(
    (stored) => {
      if (stored?.accessToken && stored?.refreshToken) {
        tokens = stored;
      }
    }
  );
}

/**
 * Synchronously retrieves stored tokens from browser cookies or localStorage.
 */
function loadStoredTokens(): AuthTokens | null {
  // 1. Try reading from browser cookies
  const accessFromCookie = getCookie(COOKIE_ACCESS_TOKEN);
  const refreshFromCookie = getCookie(COOKIE_REFRESH_TOKEN);
  if (accessFromCookie && refreshFromCookie) {
    return {
      accessToken: accessFromCookie,
      refreshToken: refreshFromCookie,
    };
  }

  // 2. Fallback to localStorage on Web
  const stored = getStorageItem<AuthTokens>(STORAGE_KEYS.AUTH_TOKENS, 'web', null);
  if (stored?.accessToken && stored?.refreshToken) {
    return stored;
  }

  return null;
}

// Initial hydration from persistent storage
let tokens: AuthTokens | null = loadStoredTokens();

/**
 * Get current authentication tokens (hydrated from storage if not in memory).
 */
export function getAuthTokens(): AuthTokens | null {
  if (!tokens) {
    tokens = loadStoredTokens();
  }
  return tokens;
}

/**
 * Save authentication tokens to memory, cookies, and local/mobile storage.
 */
export function setAuthTokens(nextTokens: AuthTokens): void {
  tokens = nextTokens;

  // Persist to Cookies (Access token for 1 day, Refresh token for 7 days)
  setCookie(COOKIE_ACCESS_TOKEN, nextTokens.accessToken, 1);
  setCookie(COOKIE_REFRESH_TOKEN, nextTokens.refreshToken, 7);

  // Persist to Web localStorage
  setStorageItem(STORAGE_KEYS.AUTH_TOKENS, nextTokens, 'web');

  // Persist to Mobile storage if configured
  if (mobileTokenAdapter) {
    void setStorageItem(STORAGE_KEYS.AUTH_TOKENS, nextTokens, 'mobile', mobileTokenAdapter);
  }
}

/**
 * Clear authentication tokens from memory, cookies, and persistent storage.
 */
export function clearAuthTokens(): void {
  tokens = null;

  // Remove Cookies
  deleteCookie(COOKIE_ACCESS_TOKEN);
  deleteCookie(COOKIE_REFRESH_TOKEN);

  // Remove Web localStorage
  removeStorageItem(STORAGE_KEYS.AUTH_TOKENS, 'web');

  // Remove Mobile storage if configured
  if (mobileTokenAdapter) {
    void removeStorageItem(STORAGE_KEYS.AUTH_TOKENS, 'mobile', mobileTokenAdapter);
  }
}
