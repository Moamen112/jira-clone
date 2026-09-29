import { configureStore } from '@reduxjs/toolkit';
import {
  themeReducer,
  authReducer,
  projectReducer,
  initialAuthState,
  initialProjectState,
  setMobileTokenAdapter,
  getAuthTokens,
  setAuthSuccess,
  toggleTheme,
  setThemeMode,
  selectThemeMode,
  type ThemeMode,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  STORAGE_KEYS,
  type AsyncStorageAdapter,
  type UserProfile,
} from '@jira-clone/shared';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// In Expo Web or environments with window.localStorage available, pre-load synchronously
const initialMode: ThemeMode =
  typeof window !== 'undefined'
    ? (getStorageItem<ThemeMode>(STORAGE_KEYS.THEME_MODE, 'web', 'light') ?? 'light')
    : 'light';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    project: projectReducer,
  },
  preloadedState: {
    theme: {
      mode: initialMode,
    },
    auth: initialAuthState,
    project: initialProjectState,
  },
});

let mobileStorageAdapter: AsyncStorageAdapter | undefined;

/**
 * Configure an optional AsyncStorage adapter for native mobile persistence.
 * When set, it immediately reads any persisted theme mode and keeps it synchronized.
 */
export async function setMobileStorageAdapter(adapter: AsyncStorageAdapter) {
  mobileStorageAdapter = adapter;
  await setMobileTokenAdapter(adapter);

  const storedUser = await getStorageItem<UserProfile>(STORAGE_KEYS.CURRENT_USER, 'mobile', null, adapter);
  if (storedUser && getAuthTokens()) {
    store.dispatch(setAuthSuccess(storedUser));
  }

  getStorageItem<ThemeMode>(STORAGE_KEYS.THEME_MODE, 'mobile', null, adapter).then((stored) => {
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      store.dispatch(setThemeMode(stored));
    }
  });
}

let previousMode = store.getState().theme.mode;
let previousUser = store.getState().auth.user;

store.subscribe(() => {
  const currentMode = store.getState().theme.mode;
  if (currentMode !== previousMode) {
    previousMode = currentMode;
    // Persist to web storage if available
    if (typeof window !== 'undefined') {
      setStorageItem(STORAGE_KEYS.THEME_MODE, currentMode, 'web');
    }
    // Persist to mobile adapter if configured
    if (mobileStorageAdapter) {
      setStorageItem(STORAGE_KEYS.THEME_MODE, currentMode, 'mobile', mobileStorageAdapter);
    }
  }

  const currentUser = store.getState().auth.user;
  if (currentUser !== previousUser) {
    previousUser = currentUser;
    if (mobileStorageAdapter) {
      if (currentUser) {
        void setStorageItem(STORAGE_KEYS.CURRENT_USER, currentUser, 'mobile', mobileStorageAdapter);
      } else {
        void removeStorageItem(STORAGE_KEYS.CURRENT_USER, 'mobile', mobileStorageAdapter);
      }
    }
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export {
  toggleTheme,
  setThemeMode,
  selectThemeMode,
  type ThemeMode,
};
