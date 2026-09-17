import React from 'react';
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

export interface UseThemeReturn {
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

// Backwards-compatibility alias
export type ThemeContextValue = UseThemeReturn;

/**
 * Optional pass-through wrapper for backwards compatibility.
 * Redux Toolkit manages theme state globally under <Provider store={store}>,
 * so no React Context wrapper is needed.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  React.createElement(React.Fragment, null, children);

/**
 * Hook to access current theme state, active colors, and theme switchers
 * powered 100% by Redux Toolkit and native device appearance.
 * Safe to use anywhere within <Provider store={store}>.
 */
export function useTheme(): UseThemeReturn {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectThemeMode);
  const systemScheme = useColorScheme();

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

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
}

export default useTheme;
