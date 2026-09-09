import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import {
  ThemeMode,
  setThemeMode as setThemeModeAction,
  toggleTheme as toggleThemeAction,
  selectThemeMode,
} from '@jira-clone/shared';
import { useAppDispatch, useAppSelector } from '../store';
import { colors } from './colors';
import { theme, Theme } from './theme';

export type ThemeColors = typeof colors.light | typeof colors.dark;
export type ThemeObject = typeof theme.light | typeof theme.dark;
export type { ThemeMode };

export interface ThemeContextValue {
  /** Current active theme mode setting ('light' | 'dark' | 'system') */
  mode: ThemeMode;
  /** Whether dark mode is currently effective */
  isDark: boolean;
  /** Active color palette tokens based on current appearance */
  colors: ThemeColors;
  /** Full theme object (colors, typography, radius, spacing, layout, motion) */
  theme: ThemeObject;
  /** Change the active theme mode */
  setThemeMode: (mode: ThemeMode) => void;
  /** Toggle between light and dark modes */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider component that computes the active theme from Redux state
 * and native device appearance, passing it via React Context.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectThemeMode);
  const systemScheme = useColorScheme();

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const value = useMemo<ThemeContextValue>(() => {
    const activeColors = isDark ? colors.dark : colors.light;
    const activeTheme = isDark ? theme.dark : theme.light;

    return {
      mode,
      isDark,
      colors: activeColors,
      theme: activeTheme,
      setThemeMode: (newMode: ThemeMode) => dispatch(setThemeModeAction(newMode)),
      toggleTheme: () => dispatch(toggleThemeAction()),
    };
  }, [mode, isDark, dispatch]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

/**
 * Hook to access current theme state, active colors, and theme mode switchers.
 * Safe to use anywhere within <Provider store={store}><ThemeProvider>...</ThemeProvider></Provider>.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    // Graceful fallback if invoked outside ThemeProvider
    return {
      mode: 'light',
      isDark: false,
      colors: colors.light,
      theme: theme.light,
      setThemeMode: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}
