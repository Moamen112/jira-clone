import { configureStore } from '@reduxjs/toolkit';
import {
  themeReducer,
  authReducer,
  projectReducer,
  initialAuthState,
  initialProjectState,
  toggleTheme,
  setThemeMode,
  selectThemeMode,
  type ThemeMode,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  STORAGE_KEYS,
} from '@jira-clone/shared';
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    project: projectReducer,
  },
  preloadedState: {
    theme: {
      mode: getStorageItem<ThemeMode>(STORAGE_KEYS.THEME_MODE, 'web', 'light') ?? 'light',
    },
    auth: initialAuthState,
    project: initialProjectState,
  },
});

if (typeof window !== 'undefined') {
  let previousMode = store.getState().theme.mode;
  let previousUser = store.getState().auth.user;

  store.subscribe(() => {
    const currentMode = store.getState().theme.mode;
    if (currentMode !== previousMode) {
      previousMode = currentMode;
      setStorageItem(STORAGE_KEYS.THEME_MODE, currentMode, 'web');
    }

    const currentUser = store.getState().auth.user;
    if (currentUser !== previousUser) {
      previousUser = currentUser;
      if (currentUser) {
        setStorageItem(STORAGE_KEYS.CURRENT_USER, currentUser, 'web');
      } else {
        removeStorageItem(STORAGE_KEYS.CURRENT_USER, 'web');
      }
    }
  });
}

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
