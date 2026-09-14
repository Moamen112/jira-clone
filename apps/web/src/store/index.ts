import { configureStore } from '@reduxjs/toolkit';
import { themeReducer, toggleTheme, setThemeMode, selectThemeMode, type ThemeMode } from '@jira-clone/shared';
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { toggleTheme, setThemeMode, selectThemeMode, type ThemeMode };
