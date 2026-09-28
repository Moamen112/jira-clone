import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Sidenav, type SidenavPage } from '../components/shared/sidenav';
import { useTheme } from '../hooks';
import { ROUTES } from '../routes/paths';
import { useProjects, useAuth, getInitials, type User } from '@jira-clone/shared';
import styles from './ProtectedLayout.module.css';

export function ProtectedLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { plainProjects: projects } = useProjects();

  const location = useLocation();
  const navigate = useNavigate();

  // Derive active project from space detail route when present, otherwise user selection
  const spaceMatch = location.pathname.match(/^\/spaces\/([^/]+)/);
  const matchedProject = spaceMatch?.[1]
    ? projects.find(
        (p) => p.id === spaceMatch[1] || p.key.toLowerCase() === spaceMatch[1].toLowerCase()
      )
    : undefined;

  const currentProject =
    matchedProject ??
    (selectedProjectId ? projects.find((p) => p.id === selectedProjectId) : undefined) ??
    projects[0] ??
    null;

  const currentUser: User | null = user
    ? {
        id: String(user.id),
        name: user.full_name || user.email,
        email: user.email,
        avatarUrl: user.avatar ?? undefined,
        initials: getInitials(user.full_name || user.email),
      }
    : null;

  // Map route to SidenavPage
  const getActivePage = (): SidenavPage => {
    const path = location.pathname;
    if (path.startsWith(ROUTES.PROTECTED.SPACES)) return 'projects';
    if (path.startsWith(ROUTES.PROTECTED.NOTIFICATIONS)) return 'notifications';
    if (path.startsWith(ROUTES.PROTECTED.PROFILE)) return 'settings';
    return 'home';
  };

  const handleNavigate = (page: SidenavPage) => {
    switch (page) {
      case 'home':
        navigate(ROUTES.PROTECTED.HOME);
        break;
      case 'projects':
      case 'board':
      case 'backlog':
      case 'activity':
        navigate(ROUTES.PROTECTED.SPACES);
        break;
      case 'notifications':
        navigate(ROUTES.PROTECTED.NOTIFICATIONS);
        break;
      case 'settings':
        navigate(ROUTES.PROTECTED.PROFILE);
        break;
      default:
        navigate(ROUTES.PROTECTED.HOME);
        break;
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate(ROUTES.AUTH.SIGN_IN);
  };

  return (
    <div className={styles.container}>
      {/* Sidenav rendered on PROTECTED route pages ONLY — fixed full page height */}
      <div className={styles.sidenavWrapper}>
        <Sidenav
          activePage={getActivePage()}
          onNavigate={handleNavigate}
          projects={projects}
          currentProject={currentProject}
          onSelectProject={(id) => {
            setSelectedProjectId(id);
            navigate(`/spaces/${id}`);
          }}
          currentUser={currentUser}
          unreadNotificationsCount={0}
          collapsed={collapsed}
          onToggleCollapse={(col) => setCollapsed(col)}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
          style={{ height: '100%' }}
        />
      </div>

      <main className={styles.contentWrapper}>
        <Outlet />
      </main>
    </div>
  );
}

export default ProtectedLayout;
