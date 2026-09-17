import { useEffect, useState } from 'react';
import {
  useAppDispatch,
  useAppSelector,
  selectThemeMode,
  toggleTheme,
  setThemeMode,
  type ThemeMode,
} from '../store';

export interface UseThemeReturn {
  mode: ThemeMode;
  isDark: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export function useTheme(): UseThemeReturn {
  const mode = useAppSelector(selectThemeMode);
  const dispatch = useAppDispatch();

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const effectiveTheme: 'light' | 'dark' =
    mode === 'system' ? (systemIsDark ? 'dark' : 'light') : mode;
  const isDark = effectiveTheme === 'dark';

  return {
    mode,
    isDark,
    theme: effectiveTheme,
    toggleTheme: () => dispatch(toggleTheme()),
    setThemeMode: (newMode: ThemeMode) => dispatch(setThemeMode(newMode)),
  };
}

export default useTheme;
