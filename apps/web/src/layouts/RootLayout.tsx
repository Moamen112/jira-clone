import { Outlet, useLocation, useNavigate } from 'react-router';
import { Navbar, type NavbarPage } from '../components/shared/navbar';
import { useTheme } from '../hooks';
import { ROUTES } from '../routes/paths';
import { mockCurrentUser } from '@jira-clone/shared';
import styles from './RootLayout.module.css';

export function RootLayout() {
  const { isDark, toggleTheme } = useTheme();

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
        user={isProtectedPath ? mockCurrentUser : null}
        page={pageMode}
        links={[]}
        brand="Jira Clone"
        logoLabel="J"
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onNavigate={(href) => navigate(href)}
        onLogIn={() => navigate(ROUTES.AUTH.SIGN_IN)}
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
