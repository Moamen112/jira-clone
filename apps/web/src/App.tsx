import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';
import { store, useAppSelector, selectThemeMode } from './store';
import { router } from './routes';

function ThemeSync() {
  const mode = useAppSelector(selectThemeMode);

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
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
