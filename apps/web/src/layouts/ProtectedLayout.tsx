import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Sidenav, type SidenavPage } from '../components/shared/sidenav';
import { useAppDispatch, useAppSelector, selectThemeMode, toggleTheme } from '../store';
import { ROUTES } from '../routes/paths';
import { mockProjects, mockCurrentUser } from '@jira-clone/shared';
import styles from './ProtectedLayout.module.css';

export function ProtectedLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(mockProjects[0].id);

  const mode = useAppSelector(selectThemeMode);
  const isDark = mode === 'dark';
  const dispatch = useAppDispatch();

  const location = useLocation();
  const navigate = useNavigate();

  // Derive active project from space detail route when present, otherwise user selection
  const spaceMatch = location.pathname.match(/^\/spaces\/([^/]+)/);
  const matchedProject = spaceMatch?.[1]
    ? mockProjects.find(
        (p) => p.id === spaceMatch[1] || p.key.toLowerCase() === spaceMatch[1].toLowerCase()
      )
    : undefined;

  const currentProject =
    matchedProject ??
    mockProjects.find((p) => p.id === selectedProjectId) ??
    mockProjects[0];

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

  return (
    <div className={styles.container}>
      {/* Sidenav rendered on PROTECTED route pages ONLY — fixed full page height */}
      <div className={styles.sidenavWrapper}>
        <Sidenav
          activePage={getActivePage()}
          onNavigate={handleNavigate}
          projects={mockProjects}
          currentProject={currentProject}
          onSelectProject={(id) => {
            setSelectedProjectId(id);
            navigate(`/spaces/${id}`);
          }}
          currentUser={mockCurrentUser}
          unreadNotificationsCount={2}
          collapsed={collapsed}
          onToggleCollapse={(col) => setCollapsed(col)}
          isDark={isDark}
          onToggleTheme={() => dispatch(toggleTheme())}
          onLogout={() => navigate(ROUTES.AUTH.SIGN_IN)}
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
