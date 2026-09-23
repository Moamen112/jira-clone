export type PlatformType = 'web' | 'mobile';

export interface AsyncStorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

export const STORAGE_KEYS = {
  THEME_MODE: 'jira-theme-mode',
  CURRENT_USER: 'jira-current-user',
  RECENT_PROJECTS: 'jira-recent-projects',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS] | (string & {});

/**
 * Universal getter for storage items across Web and Mobile.
 * - On Web: Synchronous read from window.localStorage.
 * - On Mobile: Asynchronous read from AsyncStorage (via adapter).
 */
export function getStorageItem<T = string>(
  key: StorageKey,
  platform: 'web',
  fallback?: T | null
): T | null;

export function getStorageItem<T = string>(
  key: StorageKey,
  platform: 'mobile',
  fallback?: T | null,
  adapter?: AsyncStorageAdapter
): Promise<T | null>;

export function getStorageItem<T = string>(
  key: StorageKey,
  platform: PlatformType,
  fallback: T | null = null,
  adapter?: AsyncStorageAdapter
): (T | null) | Promise<T | null> {
  if (platform === 'web') {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as unknown as T;
      }
    } catch {
      return fallback;
    }
  }

  // Mobile (Asynchronous)
  return (async () => {
    if (!adapter) return fallback;
    try {
      const raw = await adapter.getItem(key);
      if (raw === null) return fallback;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as unknown as T;
      }
    } catch {
      return fallback;
    }
  })();
}

/**
 * Universal setter for storage items across Web and Mobile.
 * - On Web: Synchronous write to window.localStorage.
 * - On Mobile: Asynchronous write to AsyncStorage (via adapter).
 */
export function setStorageItem<T = unknown>(
  key: StorageKey,
  value: T,
  platform: 'web'
): void;

export function setStorageItem<T = unknown>(
  key: StorageKey,
  value: T,
  platform: 'mobile',
  adapter?: AsyncStorageAdapter
): Promise<void>;

export function setStorageItem<T = unknown>(
  key: StorageKey,
  value: T,
  platform: PlatformType,
  adapter?: AsyncStorageAdapter
): void | Promise<void> {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);

  if (platform === 'web') {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, serialized);
    } catch {
      // Ignore quota or access errors
    }
    return;
  }

  // Mobile (Asynchronous)
  return (async () => {
    if (!adapter) return;
    try {
      await adapter.setItem(key, serialized);
    } catch {
      // Ignore mobile storage errors
    }
  })();
}

/**
 * Universal removal of storage items across Web and Mobile.
 */
export function removeStorageItem(
  key: StorageKey,
  platform: 'web'
): void;

export function removeStorageItem(
  key: StorageKey,
  platform: 'mobile',
  adapter?: AsyncStorageAdapter
): Promise<void>;

export function removeStorageItem(
  key: StorageKey,
  platform: PlatformType,
  adapter?: AsyncStorageAdapter
): void | Promise<void> {
  if (platform === 'web') {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
    return;
  }

  // Mobile (Asynchronous)
  return (async () => {
    if (!adapter) return;
    try {
      await adapter.removeItem(key);
    } catch {
      // Ignore errors
    }
  })();
}
