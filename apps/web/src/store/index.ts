import { configureStore } from '@reduxjs/toolkit';
import {
  themeReducer,
  toggleTheme,
  setThemeMode,
  selectThemeMode,
  type ThemeMode,
  getStorageItem,
  setStorageItem,
  STORAGE_KEYS,
} from '@jira-clone/shared';
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
  preloadedState: {
    theme: {
      mode: getStorageItem<ThemeMode>(STORAGE_KEYS.THEME_MODE, 'web', 'light') ?? 'light',
    },
  },
});

if (typeof window !== 'undefined') {
  let previousMode = store.getState().theme.mode;

  store.subscribe(() => {
    const currentMode = store.getState().theme.mode;
    if (currentMode !== previousMode) {
      previousMode = currentMode;
      setStorageItem(STORAGE_KEYS.THEME_MODE, currentMode, 'web');
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
