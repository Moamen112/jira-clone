import { useEffect, useState } from "react";
import type { CSSProperties, FC } from "react";
import type { User } from "@jira-clone/shared";
import { Text, Badge, Button, IconButton, Input, Divider } from "../../base";
import { Avatar } from "../avatar";

/* --------------------------------------------------------------------------
   Public types & mode resolution
   -------------------------------------------------------------------------- */

/** The page the navbar is rendered on. */
export type NavbarPage = "home" | "landing";

/**
 * The three conditional-render cases ("stamps") the navbar supports:
 *   - guest-landing:          Case 2 — not authenticated, on the landing page
 *   - authenticated-landing:  Case 1 — authenticated, on the landing page
 *   - authenticated-home:     Case 3 — authenticated, inside the app (home)
 */
export type NavbarMode =
  | "guest-landing"
  | "authenticated-landing"
  | "authenticated-home";

/** A single center/nav link renderable by the navbar. */
export interface NavbarLink {
  label: string;
  href: string;
  /** Marks the current page (accent color + aria-current="page"). */
  active?: boolean;
}

/** A single row in the notifications dropdown panel (home case). */
export interface NavbarNotification {
  id: string;
  title: string;
  message?: string;
  time?: string;
  unread?: boolean;
}

/** Which dropdown popover is currently open. */
type NavbarPopover = "none" | "profile" | "notifications";

export interface NavbarProps {
  /** The signed-in user; `null`/`undefined` means logged out (Case 2). */
  user?: User | null;
  /** Which page this navbar is rendered on (default: 'landing'). */
  page?: NavbarPage;
  /** Brand text shown next to the logo mark (default: 'Jira Clone'). */
  brand?: string;
  /** Brand mark letter/initials (default: 'J'). */
  logoLabel?: string;
  /** Overrides the per-mode default links. */
  links?: NavbarLink[];
  /** Fired when the brand or a link is pressed. */
  onNavigate?: (href: string) => void;
  /** "Log in" CTA (Case 2 — guest landing). */
  onLogIn?: () => void;
  /** "Sign up" CTA (Case 2 — guest landing). */
  onSignUp?: () => void;
  /** "Open app" CTA (Case 1 — authenticated landing). */
  onOpenApp?: () => void;
  /** "Log out" action (authenticated states). */
  onLogout?: () => void;
  /** "+" quick-create action (Case 3 — authenticated home). */
  onCreate?: () => void;
  /** Notifications action (Case 3 — authenticated home). */
  onOpenNotifications?: () => void;
  /** Profile / account menu action (authenticated states). */
  onOpenProfile?: () => void;
  /** Current search query (authenticated-home search field). */
  searchValue?: string;
  /** Search change handler — renders the search input when provided. */
  onSearchChange?: (value: string) => void;
  /** Fired on Enter in the search field. */
  onSearchSubmit?: (value: string) => void;
  /** Search field placeholder (default: 'Search issues, projects...'). */
  searchPlaceholder?: string;
  /** Whether the app is in dark mode — drives the profile-menu theme switch. */
  isDark?: boolean;
  /** Theme toggle handler (profile menu switch). */
  onToggleTheme?: () => void;
  /** Notifications shown in the bell dropdown panel (home case). */
  notifications?: NavbarNotification[];
  /** Renders a small mode badge (e.g. "AUTH · HOME") for demos. */
  showModeBadge?: boolean;
  /** Pin the navbar to the top of the viewport (default: true). */
  sticky?: boolean;
  /** Container style override (merged last). */
  style?: CSSProperties;
  /** Test identifier. */
  testID?: string;
}

/* --------------------------------------------------------------------------
   Default link sets per context
   -------------------------------------------------------------------------- */

const LANDING_LINKS: NavbarLink[] = [];


const MODE_LABELS: Record<NavbarMode, string> = {
  "guest-landing": "GUEST · LANDING",
  "authenticated-landing": "AUTH · LANDING",
  "authenticated-home": "AUTH · HOME",
};

/* --------------------------------------------------------------------------
   Mode resolution — computes the conditional-render case
   -------------------------------------------------------------------------- */

function getNavbarMode(
  user: User | null | undefined,
  page: NavbarPage,
): NavbarMode {
  if (!user) return "guest-landing"; // Case 2
  return page === "home" ? "authenticated-home" : "authenticated-landing"; // Cases 3 / 1
}

interface IconProps {
  size?: number;
}

const HomeIcon: FC<IconProps> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="6" y="10" width="12" height="9" />
    <polyline points="6 10 10 5 14 5 18 10" />
  </svg>
);

/*
const BellIcon: FC<IconProps> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="10" r="5" />
    <line x1="12" y1="10" x2="12" y2="16" />
    <circle cx="12" cy="17.5" r="1.6" />
  </svg>
);

const PlusIcon: FC<IconProps> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
*/

const ChevronDownIcon: FC<IconProps> = ({ size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SearchIcon: FC<IconProps> = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.4" y2="16.4" />
  </svg>
);

const PersonIcon: FC<IconProps> = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="7" r="4" />
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
  </svg>
);

const MoonIcon: FC<IconProps> = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="8" />
    <circle cx="16.5" cy="8.5" r="4.5" />
  </svg>
);

const SunIcon: FC<IconProps> = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="3" x2="12" y2="7" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <line x1="3" y1="12" x2="7" y2="12" />
    <line x1="17" y1="12" x2="21" y2="12" />
    <line x1="5.5" y1="5.5" x2="8.5" y2="8.5" />
    <line x1="18.5" y1="5.5" x2="15.5" y2="8.5" />
    <line x1="5.5" y1="18.5" x2="8.5" y2="15.5" />
    <line x1="18.5" y1="18.5" x2="15.5" y2="15.5" />
  </svg>
);

const JiraLogoIcon: FC<{ size?: number }> = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
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

/* --------------------------------------------------------------------------
   Navbar
   -------------------------------------------------------------------------- */

export const Navbar: FC<NavbarProps> = ({
  user,
  page = "landing",
  brand = "Jira Clone",
  logoLabel: _logoLabel = "J",
  links,
  onNavigate,
  onLogIn,
  onSignUp,
  onOpenApp,
  onLogout,
  onCreate: _onCreate,
  onOpenNotifications: _onOpenNotifications,
  onOpenProfile,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder,
  isDark,
  onToggleTheme,
  notifications: _notifications,
  showModeBadge = false,
  sticky = true,
  style,
  testID,
}) => {
  const mode = getNavbarMode(user, page);
  const resolvedLinks =
    links ?? (mode === "authenticated-home" ? [] : LANDING_LINKS);

  const handleBrandPress = () => onNavigate?.("/");
  const handleLinkPress = (link: NavbarLink) => onNavigate?.(link.href);

  // Popover (dropdown) state for the notifications + profile menus.
  const [activePopover, setActivePopover] = useState<NavbarPopover>("none");

  // Close any open popover with Escape.
  useEffect(() => {
    if (activePopover === "none") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActivePopover("none");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activePopover]);

  const togglePopover = (name: NavbarPopover) =>
    setActivePopover((current) => (current === name ? "none" : name));

  const closePopover = () => setActivePopover("none");

  const handleViewProfile = () => {
    closePopover();
    if (onOpenProfile) {
      onOpenProfile();
    } else {
      onNavigate?.("/profile");
    }
  };

  /*
  const handleViewAllNotifications = () => {
    closePopover();
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      onNavigate?.("/notifications");
    }
  };
  */

  const handleLogout = () => {
    closePopover();
    onLogout?.();
  };

  // const unreadCount = notifications?.filter((n) => n.unread).length ?? 0;

  const renderAvatarButton = (
    onPress: (() => void) | null,
    withChevron: boolean,
  ) => (
    <button
      type="button"
      onClick={() => onPress?.()}
      aria-expanded={withChevron && activePopover === "profile"}
      title={user?.name}
      aria-label={`Open profile menu of ${user?.name ?? "user"}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        border: "none",
        background: "transparent",
        padding: 0,
        cursor: onPress ? "pointer" : "default",
        borderRadius: "var(--radius-pill)",
      }}
    >
      <Avatar
        name={user?.name}
        imageUrl={user?.avatarUrl}
        size="sm"
        bordered
        borderColor="var(--color-surface)"
      />
      {withChevron && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            color: "var(--color-ink-muted)",
          }}
        >
          <ChevronDownIcon size={11} />
        </span>
      )}
    </button>
  );

  const renderSearch = () => (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearchSubmit?.(searchValue ?? "");
      }}
      style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}
    >
      <Input
        value={searchValue ?? ""}
        onChangeText={onSearchChange}
        placeholder={searchPlaceholder ?? "Search issues, projects..."}
        leftIcon={<SearchIcon size={14} />}
        containerStyle={{ width: 200, marginBottom: 0 }}
        inputWrapperStyle={{ minHeight: 36, paddingInline: 10 }}
      />
    </form>
  );

  /*
  const renderNotificationsPanel = () => {
    const items = _notifications ?? [];

    return (
      <div
        role="region"
        aria-label="Notifications"
        style={{
          position: "absolute",
          top: "100%",
          right: 0,
          marginTop: 8,
          width: 320,
          maxHeight: 380,
          overflowY: "auto",
          zIndex: 999,
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-line)",
          borderRadius: "var(--radius-card)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.16)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text variant="label" bold>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Badge label={String(unreadCount)} variant="warn" size="sm" />
          )}
        </div>

        <div style={{ borderTop: "1px solid var(--color-line)" }}>
          {items.length === 0 ? (
            <Text
              variant="caption"
              muted
              style={{ display: "block", padding: "16px 14px" }}
            >
              No notifications yet.
            </Text>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  padding: "10px 14px",
                  borderBottom: "1px solid var(--color-line)",
                  backgroundColor: item.unread
                    ? "var(--color-accent-soft)"
                    : "transparent",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Text
                    variant="bodySmall"
                    bold
                    numberOfLines={1}
                    style={{ flex: 1 }}
                  >
                    {item.title}
                  </Text>
                  {item.unread && (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "var(--radius-pill)",
                        backgroundColor: "var(--color-accent)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
                {item.message && (
                  <Text variant="caption" muted numberOfLines={2}>
                    {item.message}
                  </Text>
                )}
                {item.time && (
                  <Text variant="monoSmall" muted>
                    {item.time}
                  </Text>
                )}
              </div>
            ))
          )}
        </div>

        {_onOpenNotifications && (
          <Button
            label="View all notifications"
            variant="ghost"
            size="sm"
            fullWidth
            onPress={handleViewAllNotifications}
            style={{
              borderTop: "1px solid var(--color-line)",
              borderRadius: 0,
              marginTop: 4,
            }}
          />
        )}
      </div>
    );
  };
  */

  const renderThemeToggle = () => {
    if (!onToggleTheme) return null;
    return (
      <IconButton
        variant="ghost"
        size="sm"
        rounded
        label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        icon={isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
        onPress={onToggleTheme}
      />
    );
  };

  const renderProfileMenu = () => {
    const menuItem: CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: 10,
      width: "100%",
      padding: "8px 12px",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      borderRadius: "var(--radius-input)",
      textAlign: "left",
      color: "var(--color-ink)",
    };

    return (
      <div
        role="menu"
        aria-label="Account menu"
        style={{
          position: "absolute",
          top: "100%",
          right: 0,
          marginTop: 8,
          minWidth: 220,
          zIndex: 999,
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-line)",
          borderRadius: "var(--radius-card)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.16)",
          display: "flex",
          flexDirection: "column",
          padding: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
          }}
        >
          <Avatar name={user?.name} imageUrl={user?.avatarUrl} size="xs" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text variant="bodySmall" bold numberOfLines={1}>
              {user?.name ?? "User"}
            </Text>
            <Text variant="caption" muted numberOfLines={1}>
              {user?.email ?? ""}
            </Text>
          </div>
        </div>

        <Divider margin={4} />

        <button
          type="button"
          role="menuitem"
          onClick={handleViewProfile}
          style={menuItem}
        >
          <span style={{ display: "inline-flex", color: "var(--color-ink-muted)" }}>
            <PersonIcon size={14} />
          </span>
          <Text variant="label" style={{ flex: 1 }}>
            View profile
          </Text>
        </button>

        {onToggleTheme && (
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(isDark)}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={onToggleTheme}
            style={{
              ...menuItem,
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                flex: 1,
              }}
            >
              <span style={{ display: "inline-flex", color: "var(--color-ink-muted)" }}>
                {isDark ? <SunIcon size={14} /> : <MoonIcon size={14} />}
              </span>
              <Text variant="label">{isDark ? "Light mode" : "Dark mode"}</Text>
            </span>
            <span
              aria-hidden="true"
              style={{
                width: 34,
                height: 20,
                flexShrink: 0,
                borderRadius: "var(--radius-pill)",
                backgroundColor: isDark
                  ? "var(--color-accent)"
                  : "var(--color-line)",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  left: isDark ? 16 : 2,
                  width: 16,
                  height: 16,
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: "#FFFFFF",
                }}
              />
            </span>
          </button>
        )}

        <Divider margin={4} />

        <button
          type="button"
          role="menuitem"
          onClick={handleLogout}
          style={{ ...menuItem, marginTop: 4 }}
        >
          <span style={{ display: "inline-flex", color: "var(--color-warn)" }}>
            <PersonIcon size={14} />
          </span>
          <Text variant="label" color="var(--color-warn)" style={{ flex: 1 }}>
            Log out
          </Text>
        </button>
      </div>
    );
  };

  return (
    <header
      data-testid={testID}
      style={{
        position: sticky ? "sticky" : undefined,
        top: sticky ? 0 : undefined,
        zIndex: sticky ? 100 : undefined,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: "var(--navbar-height, 48px)",
        height: "var(--navbar-height, 48px)",
        flexShrink: 0,
        padding: "0 24px",
        boxSizing: "border-box",
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-line)",
        ...style,
      }}
    >
      {/* Brand + Center Links */}
      <nav
        aria-label="Primary"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Brand */}
        <button
          type="button"
          onClick={handleBrandPress}
          aria-label={`${brand} home`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "none",
            background: "transparent",
            padding: 0,
            cursor: onNavigate ? "pointer" : "default",
            borderRadius: "var(--radius-input)",
            flexShrink: 0,
          }}
        >
          <JiraLogoIcon size={24} />
          <Text variant="subheading" bold>
            {brand}
          </Text>
        </button>

        {/* Center links */}
        {resolvedLinks.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginLeft: 8,
              flexWrap: "wrap",
            }}
          >
            {resolvedLinks.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => handleLinkPress(link)}
                aria-current={link.active ? "page" : undefined}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  minHeight: 32,
                  padding: "0 12px",
                  border: "none",
                  background: "transparent",
                  cursor: onNavigate ? "pointer" : "default",
                  borderRadius: "var(--radius-pill)",
                  fontSize: 13,
                  fontWeight: link.active ? 600 : 500,
                  transition: "color 150ms ease",
                }}
              >
                {link.active && <HomeIcon size={14} />}
                <Text
                  variant="label"
                  color={
                    link.active ? "var(--color-accent)" : "var(--color-ink)"
                  }
                  style={{ marginLeft: link.active ? 4 : 0 }}
                >
                  {link.label}
                </Text>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Right Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        {/* Optional mode stamp label (demo aid) */}
        {showModeBadge && (
          <Badge label={MODE_LABELS[mode]} variant="mono" size="sm" />
        )}

        {mode === "guest-landing" && (
          <>
            {renderThemeToggle()}
            {onLogIn && (
              <Button
                label="Log in"
                variant={onSignUp ? "ghost" : "primary"}
                size="sm"
                onPress={onLogIn}
              />
            )}
            {onSignUp && (
              <Button
                label="Sign up"
                variant="primary"
                size="sm"
                onPress={onSignUp}
              />
            )}
          </>
        )}

        {mode === "authenticated-landing" && (
          <>
            {onOpenApp && (
              <Button
                label="Open app"
                variant="primary"
                size="sm"
                onPress={onOpenApp}
              />
            )}
            {renderThemeToggle()}
            {user && renderAvatarButton(handleViewProfile, false)}
            {onLogout && (
              <Button
                label="Log out"
                variant="ghost"
                size="sm"
                onPress={onLogout}
              />
            )}
          </>
        )}

        {mode === "authenticated-home" && (
          <>
            {onSearchChange && renderSearch()}


            {/* Theme mode toggle */}
            {renderThemeToggle()}

            {/* Avatar → profile dropdown menu */}
            {user && (
              <div style={{ position: "relative" }}>
                {renderAvatarButton(() => togglePopover("profile"), true)}
                {activePopover === "profile" && renderProfileMenu()}
              </div>
            )}
          </>
        )}
      </div>

      {/* Click-away backdrop to close dropdown panels */}
      {activePopover !== "none" && (
        <div
          onClick={closePopover}
          aria-hidden="true"
          style={{ position: "fixed", inset: 0, zIndex: 998 }}
        />
      )}
    </header>
  );
};

export default Navbar;
