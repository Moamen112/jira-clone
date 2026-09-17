import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';
import { store, useAppSelector, selectThemeMode } from './store';
import { router } from './routes';

function ThemeSync() {
  const mode = useAppSelector(selectThemeMode);

  useEffect(() => {
    const applyTheme = (effectiveTheme: 'dark' | 'light') => {
      document.documentElement.setAttribute('data-theme', effectiveTheme);
    };

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches ? 'dark' : 'light');

      const handler = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(mode);
    }
  }, [mode]);

  return <RouterProvider router={router} />;
}

export function App() {
  return (
    <Provider store={store}>
      <ThemeSync />
    </Provider>
  );
}

export default App;
