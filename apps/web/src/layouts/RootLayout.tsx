import { Outlet, useLocation, useNavigate } from 'react-router';
import { Navbar, type NavbarPage } from '../components/shared/navbar';
import { useAppDispatch, useAppSelector, selectThemeMode, toggleTheme } from '../store';
import { ROUTES } from '../routes/paths';
import type { User } from '@jira-clone/shared';
import styles from './RootLayout.module.css';

const MOCK_USER: User = {
  id: 'user-1',
  name: 'Alex Morgan',
  email: 'alex@fieldnotes.dev',
  initials: 'AM',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
};

export function RootLayout() {
  const mode = useAppSelector(selectThemeMode);
  const isDark = mode === 'dark';
  const dispatch = useAppDispatch();

  const location = useLocation();
  const navigate = useNavigate();

  const isProtectedPath =
    location.pathname.startsWith(ROUTES.PROTECTED.HOME) ||
    location.pathname.startsWith(ROUTES.PROTECTED.SPACES) ||
    location.pathname.startsWith(ROUTES.PROTECTED.PROFILE) ||
    location.pathname.startsWith(ROUTES.PROTECTED.NOTIFICATIONS);

  const pageMode: NavbarPage = isProtectedPath ? 'home' : 'landing';

  return (
    <div className={styles.container}>
      {/* Universal Navbar for ALL pages */}
      <Navbar
        user={isProtectedPath ? MOCK_USER : null}
        page={pageMode}
        links={isProtectedPath ? [] : undefined}
        brand="Jira Clone"
        logoLabel="J"
        isDark={isDark}
        onToggleTheme={() => dispatch(toggleTheme())}
        onNavigate={(href) => navigate(href)}
        onLogIn={() => navigate(ROUTES.AUTH.SIGN_IN)}
        onSignUp={() => navigate(ROUTES.AUTH.SIGN_UP)}
        onLogout={() => navigate(ROUTES.AUTH.SIGN_IN)}
        onOpenProfile={() => navigate(ROUTES.PROTECTED.PROFILE)}
        onOpenNotifications={() => navigate(ROUTES.PROTECTED.NOTIFICATIONS)}
        onCreate={() => navigate(ROUTES.PROTECTED.HOME)}
      />

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
