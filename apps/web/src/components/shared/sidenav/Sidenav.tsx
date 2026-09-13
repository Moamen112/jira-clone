import { useState, useRef, useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import { Text, Badge, Button, Divider } from '../../base';
import { Avatar } from '../avatar';
import type { SidenavProps, SidenavPage } from './types';

// ============================================================================
// ICONS
// ============================================================================

const JiraLogoIcon: FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path
      d="M11.5 2.5C7.36 6.64 7.36 13.36 11.5 17.5L7 22C0.92 15.92 0.92 6.08 7 0L11.5 2.5Z"
      fill="var(--color-accent)"
    />
    <path
      d="M12.5 6.5C14.71 8.71 14.71 12.29 12.5 14.5L17 19C21.42 14.58 21.42 7.42 17 3L12.5 6.5Z"
      fill="var(--color-ink)"
    />
  </svg>
);

const PlusIcon: FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const KanbanIcon: FC<{ size?: number }> = ({ size = 17 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </svg>
);

const BacklogIcon: FC<{ size?: number }> = ({ size = 17 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const HomeIcon: FC<{ size?: number }> = ({ size = 17 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ProjectsIcon: FC<{ size?: number }> = ({ size = 17 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ActivityIcon: FC<{ size?: number }> = ({ size = 17 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const BellIcon: FC<{ size?: number }> = ({ size = 17 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SettingsIcon: FC<{ size?: number }> = ({ size = 17 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const ChevronLeftIcon: FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon: FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronDownIcon: FC<{ size?: number }> = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SunIcon: FC<{ size?: number }> = ({ size = 15 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon: FC<{ size?: number }> = ({ size = 15 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const LogOutIcon: FC<{ size?: number }> = ({ size = 15 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const Sidenav: FC<SidenavProps> = ({
  activePage = 'board',
  onNavigate,
  projects = [],
  currentProject,
  onSelectProject,
  currentUser,
  unreadNotificationsCount = 0,
  onCreateIssue,
  collapsed = false,
  onToggleCollapse,
  isDark = false,
  onToggleTheme,
  onLogout,
  style,
  className,
  testID,
}) => {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const projectMenuRef = useRef<HTMLDivElement>(null);

  // Close project switcher menu on click outside
  useEffect(() => {
    if (!projectMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (projectMenuRef.current && !projectMenuRef.current.contains(e.target as Node)) {
        setProjectMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [projectMenuOpen]);

  const width = collapsed ? 68 : 248;

  const renderNavItem = (
    id: SidenavPage,
    label: string,
    icon: ReactNode,
    badge?: ReactNode
  ) => {
    const isActive = activePage === id;

    return (
      <button
        key={id}
        type="button"
        onClick={() => onNavigate?.(id)}
        aria-current={isActive ? 'page' : undefined}
        title={collapsed ? label : undefined}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 12,
          padding: collapsed ? '10px 0' : '8px 12px',
          borderRadius: 'var(--radius-card)',
          border: 'none',
          backgroundColor: isActive
            ? 'var(--color-accent-soft, rgba(37, 99, 235, 0.1))'
            : 'transparent',
          color: isActive ? 'var(--color-accent)' : 'var(--color-ink)',
          cursor: 'pointer',
          textAlign: 'left',
          position: 'relative',
          transition: 'background-color 150ms ease, color 150ms ease',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'var(--color-paper)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isActive ? 'var(--color-accent)' : 'var(--color-ink-muted)',
              flexShrink: 0,
            }}
          >
            {icon}
          </span>

          {!collapsed && (
            <Text
              variant="bodySmall"
              bold={isActive}
              color={isActive ? 'var(--color-accent)' : 'var(--color-ink)'}
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {label}
            </Text>
          )}
        </div>

        {/* Badge or indicator */}
        {!collapsed && badge}

        {/* Collapsed active indicator pip */}
        {collapsed && isActive && (
          <span
            style={{
              position: 'absolute',
              left: 2,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 3,
              height: 18,
              borderRadius: 2,
              backgroundColor: 'var(--color-accent)',
            }}
          />
        )}
      </button>
    );
  };

  return (
    <aside
      data-testid={testID}
      className={className}
      style={{
        width,
        minWidth: width,
        height: '100%',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-line)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        transition: 'width 200ms cubic-bezier(0.2, 0, 0, 1), min-width 200ms cubic-bezier(0.2, 0, 0, 1)',
        position: 'relative',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* ================================================================= */}
      {/* TOP HEADER: BRAND & COLLAPSE TOGGLE */}
      {/* ================================================================= */}
      <div
        style={{
          padding: collapsed ? '16px 12px 12px' : '16px 14px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--color-line)',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <JiraLogoIcon size={22} />
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <Text variant="subheading" bold style={{ whiteSpace: 'nowrap' }}>
                Jira Clone
              </Text>
              <Badge label="Web" variant="neutral" size="sm" />
            </div>
          )}
        </div>

        {/* Collapse / Expand Toggle Button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={() => onToggleCollapse(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 26,
              height: 26,
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-line)',
              backgroundColor: 'var(--color-paper)',
              color: 'var(--color-ink-muted)',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background-color 150ms ease, color 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              e.currentTarget.style.color = 'var(--color-ink)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-paper)';
              e.currentTarget.style.color = 'var(--color-ink-muted)';
            }}
          >
            {collapsed ? <ChevronRightIcon size={14} /> : <ChevronLeftIcon size={14} />}
          </button>
        )}
      </div>

      {/* ================================================================= */}
      {/* QUICK CREATE ISSUE ACTION */}
      {/* ================================================================= */}
      {onCreateIssue && (
        <div style={{ padding: collapsed ? '12px 10px 6px' : '12px 12px 6px' }}>
          {collapsed ? (
            <button
              type="button"
              onClick={onCreateIssue}
              title="Create Issue"
              aria-label="Create Issue"
              style={{
                width: '100%',
                height: 38,
                borderRadius: 'var(--radius-card)',
                border: 'none',
                backgroundColor: 'var(--color-accent)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'opacity 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <PlusIcon size={18} />
            </button>
          ) : (
            <Button
              label="Create Issue"
              leftIcon={<PlusIcon size={16} />}
              variant="primary"
              size="sm"
              fullWidth
              onPress={onCreateIssue}
              style={{ justifyContent: 'center' }}
            />
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* CURRENT PROJECT CONTEXT & SWITCHER */}
      {/* ================================================================= */}
      {currentProject && (
        <div
          ref={projectMenuRef}
          style={{
            position: 'relative',
            padding: collapsed ? '8px 10px' : '8px 12px',
          }}
        >
          <button
            type="button"
            onClick={() => setProjectMenuOpen((v) => !v)}
            title={currentProject.name}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
              gap: 10,
              padding: collapsed ? '6px 0' : '6px 8px',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-line)',
              backgroundColor: 'var(--color-paper)',
              cursor: projects.length > 1 ? 'pointer' : 'default',
              textAlign: 'left',
              transition: 'background-color 150ms ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <Badge label={currentProject.key} variant="accent" size="sm" />
              {!collapsed && (
                <div style={{ minWidth: 0 }}>
                  <Text
                    variant="caption"
                    bold
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block',
                    }}
                  >
                    {currentProject.name}
                  </Text>
                  <Text
                    variant="caption"
                    muted
                    style={{ fontSize: 10, display: 'block', textTransform: 'uppercase' }}
                  >
                    Software Project
                  </Text>
                </div>
              )}
            </div>

            {!collapsed && projects.length > 1 && (
              <span style={{ color: 'var(--color-ink-muted)', flexShrink: 0 }}>
                <ChevronDownIcon size={12} />
              </span>
            )}
          </button>

          {/* Project Switcher Popover Menu */}
          {projectMenuOpen && projects.length > 1 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 12,
                width: 220,
                zIndex: 100,
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-line)',
                borderRadius: 'var(--radius-card)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                padding: 6,
                marginTop: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Text
                variant="caption"
                muted
                bold
                style={{
                  padding: '4px 8px',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                }}
              >
                Switch Project
              </Text>
              {projects.map((p) => {
                const isSelected = p.id === currentProject.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectProject?.(p.id);
                      setProjectMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-card)',
                      border: 'none',
                      backgroundColor: isSelected
                        ? 'var(--color-accent-soft, rgba(37, 99, 235, 0.1))'
                        : 'transparent',
                      color: isSelected ? 'var(--color-accent)' : 'var(--color-ink)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    <Badge label={p.key} variant="mono" size="sm" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* SCROLLABLE NAVIGATION LIST */}
      {/* ================================================================= */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: collapsed ? '8px 8px' : '8px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Section 1: PLANNING & PROJECT WORK */}
        <div>
          {!collapsed && (
            <Text
              variant="sectionLabel"
              muted
              style={{
                display: 'block',
                padding: '4px 8px',
                marginBottom: 4,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
              }}
            >
              Planning
            </Text>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {renderNavItem('board', 'Kanban Board', <KanbanIcon size={17} />)}
            {renderNavItem('backlog', 'Backlog', <BacklogIcon size={17} />)}
          </div>
        </div>

        {/* Section 2: GENERAL WORKSPACE */}
        <div>
          {!collapsed && (
            <Text
              variant="sectionLabel"
              muted
              style={{
                display: 'block',
                padding: '4px 8px',
                marginBottom: 4,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
              }}
            >
              Your Work
            </Text>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {renderNavItem('home', 'My Work / Tasks', <HomeIcon size={17} />)}
            {renderNavItem('projects', 'All Projects', <ProjectsIcon size={17} />)}
          </div>
        </div>

        {/* Section 3: ACTIVITY & NOTIFICATIONS */}
        <div>
          {!collapsed && (
            <Text
              variant="sectionLabel"
              muted
              style={{
                display: 'block',
                padding: '4px 8px',
                marginBottom: 4,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
              }}
            >
              Collaboration
            </Text>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {renderNavItem('activity', 'Activity Stream', <ActivityIcon size={17} />)}
            {renderNavItem(
              'notifications',
              'Notifications',
              <BellIcon size={17} />,
              unreadNotificationsCount > 0 ? (
                <Badge
                  label={String(unreadNotificationsCount)}
                  variant="accent"
                  size="sm"
                />
              ) : undefined
            )}
          </div>
        </div>

        {/* Section 4: ADMINISTRATION */}
        <div>
          {!collapsed && (
            <Text
              variant="sectionLabel"
              muted
              style={{
                display: 'block',
                padding: '4px 8px',
                marginBottom: 4,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
              }}
            >
              Settings
            </Text>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {renderNavItem('settings', 'Project Settings', <SettingsIcon size={17} />)}
          </div>
        </div>
      </nav>

      {/* ================================================================= */}
      {/* BOTTOM FOOTER: THEME TOGGLE & USER PROFILE */}
      {/* ================================================================= */}
      <div
        style={{
          borderTop: '1px solid var(--color-line)',
          padding: collapsed ? '10px 8px' : '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          backgroundColor: 'var(--color-surface)',
        }}
      >
        {/* Theme Mode Toggle */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 10,
              padding: collapsed ? '8px 0' : '6px 8px',
              borderRadius: 'var(--radius-card)',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--color-ink-muted)',
              cursor: 'pointer',
              transition: 'background-color 150ms ease, color 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-paper)';
              e.currentTarget.style.color = 'var(--color-ink)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-ink-muted)';
            }}
          >
            <span style={{ display: 'inline-flex' }}>
              {isDark ? <SunIcon size={15} /> : <MoonIcon size={15} />}
            </span>
            {!collapsed && (
              <Text variant="caption" color="inherit">
                {isDark ? 'Light Appearance' : 'Dark Appearance'}
              </Text>
            )}
          </button>
        )}

        <Divider margin={2} />

        {/* User Profile Row */}
        {currentUser && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
              gap: 8,
              padding: collapsed ? '4px 0' : '4px 6px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                minWidth: 0,
              }}
              title={currentUser.name}
            >
              <Avatar
                name={currentUser.name}
                imageUrl={currentUser.avatarUrl}
                size="sm"
              />
              {!collapsed && (
                <div style={{ minWidth: 0 }}>
                  <Text
                    variant="bodySmall"
                    bold
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block',
                      lineHeight: '1.2',
                    }}
                  >
                    {currentUser.name}
                  </Text>
                  <Text
                    variant="caption"
                    muted
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block',
                      fontSize: 10,
                      marginTop: 2,
                    }}
                  >
                    {currentUser.email}
                  </Text>
                </div>
              )}
            </div>

            {/* Optional Logout Button */}
            {!collapsed && onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Log out"
                aria-label="Log out"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-ink-muted)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background-color 150ms ease, color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-paper)';
                  e.currentTarget.style.color = 'var(--color-warn, #ef4444)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-ink-muted)';
                }}
              >
                <LogOutIcon size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidenav;
