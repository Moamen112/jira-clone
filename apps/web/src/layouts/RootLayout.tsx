import { Outlet, useLocation, useNavigate } from 'react-router';
import { Navbar, type NavbarPage } from '../components/shared/navbar';
import { useTheme } from '../hooks';
import { ROUTES } from '../routes/paths';
import { useAuth } from '@jira-clone/shared';
import styles from './RootLayout.module.css';

export function RootLayout() {
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, signOut } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const isProtectedPath =
    location.pathname.startsWith(ROUTES.PROTECTED.HOME) ||
    location.pathname.startsWith(ROUTES.PROTECTED.SPACES) ||
    location.pathname.startsWith(ROUTES.PROTECTED.PROFILE) ||
    location.pathname.startsWith(ROUTES.PROTECTED.NOTIFICATIONS);

  const pageMode: NavbarPage = isProtectedPath ? 'home' : 'landing';

  const navbarUser =
    isAuthenticated && user
      ? {
          id: String(user.id),
          name: user.full_name,
          email: user.email,
          avatarUrl: user.avatar ?? undefined,
          initials: (user.full_name || user.email)
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2),
        }
      : null;

  const handleLogout = async () => {
    await signOut();
    navigate(ROUTES.AUTH.SIGN_IN);
  };

  return (
    <div className={styles.container}>
      {/* Universal Navbar for ALL pages */}
      <Navbar
        user={navbarUser}
        page={pageMode}
        links={[]}
        brand="Jira Clone"
        logoLabel="J"
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onNavigate={(href) => navigate(href)}
        onLogIn={() => navigate(ROUTES.AUTH.SIGN_IN)}
        onLogout={handleLogout}
        onOpenProfile={() => navigate(ROUTES.PROTECTED.PROFILE)}
      />

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
