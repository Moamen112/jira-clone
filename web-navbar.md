# Web Navbar — Developer Guide

The **Navbar** is the top application bar for the web app (`apps/web`). It is a single component that renders **three different layouts** depending on the authentication state and the page it appears on:

| Case | `user` | `page` | Navbar shows |
| :--- | :--- | :--- | :--- |
| **1 — `authenticated-landing`** | a `User` | `'landing'` | Marketing links · **Open app** · avatar · **Log out** |
| **2 — `guest-landing`** | `null` | `'landing'` | Marketing links · **Log in** · **Sign up** |
| **3 — `authenticated-home`** | a `User` | `'home'` | App links · 🔎 **search** · ➕ create · 🔔 **notifications dropdown** · avatar **profile menu** |

It is a **shared component** (`apps/web/src/components/shared/navbar`), composed from the [**Base Components**](./web-base-components.md) (`Text`, `Button`, `IconButton`, `Badge`, `Input`, `Divider`) and the shared `Avatar`, styled entirely with the CSS-variable design tokens from `apps/web/src/globals.css` (so it respects `[data-theme='dark']` automatically).

> 💡 **Sibling docs**: [`web-base-components.md`](./web-base-components.md) documents the base primitives and tokens. [`web-shared-components.md`](./web-shared-components.md) documents the other shared components.

---

## Table of Contents

1. [How to Import](#how-to-import)
2. [The Three Conditional-Render Cases](#the-three-conditional-render-cases)
3. [Mode Resolution (`getNavbarMode`)](#mode-resolution-getnavbarmode)
4. [Props Specification](#props-specification)
5. [Default Links](#default-links)
6. [Usage Examples](#usage-examples)
   - [Case 3 — Authenticated Home (full feature demo)](#case-3--authenticated-home-full-feature-demo)
   - [Case 1 — Authenticated Landing](#case-1--authenticated-landing)
   - [Case 2 — Guest Landing](#case-2--guest-landing)
   - [Minimal / Static](#minimal--static)
7. [Feature Deep-Dives](#feature-deep-dives)
   - [Search Field](#search-field)
   - [Notifications Dropdown](#notifications-dropdown)
   - [Profile Menu & Theme Toggle](#profile-menu--theme-toggle)
   - [Popover Behavior](#popover-behavior)
8. [Live Playground](#live-playground)
9. [Validation](#validation)

---

## How to Import

```tsx
import { Navbar, getNavbarMode } from '@/components/shared/navbar';
import type {
  NavbarMode,
  NavbarPage,
  NavbarLink,
  NavbarNotification,
  NavbarProps,
} from '@/components/shared/navbar';
```

A default export also exists: `import Navbar from '@/components/shared/navbar';`

**File structure**

```txt
apps/web/src/components/shared/navbar/
├── Navbar.tsx   ← component + all types + getNavbarMode
└── index.ts     ← barrel
```

---

## The Three Conditional-Render Cases

Pass `user` and `page`, and the navbar picks the layout:

```tsx
case 1 → <Navbar user={currentUser} page="landing" ... />
case 2 → <Navbar page="landing" ... />                 //  user omitted / null
case 3 → <Navbar user={currentUser} page="home" ... />
```

| Prop | Case 1 | Case 2 | Case 3 |
| :--- | :--- | :--- | :--- |
| `user` | required | omit / `null` | required |
| `page` | `'landing'` | `'landing'` | `'home'` |
| Center links | Features / Pricing / Docs | Features / Pricing / Docs | Home (active) / Spaces |
| Right side | **Open app** · avatar · Log out | **Log in** · **Sign up** | Search · ➕ · 🔔 menu · avatar menu |

Useful when you want to show the exact same `user` + `page` across screens — derive the mode once:

```tsx
const mode = getNavbarMode(user, page); // 'guest-landing' | 'authenticated-landing' | 'authenticated-home'
```

Or render a mode badge for demos: `showModeBadge` renders `GUEST · LANDING` / `AUTH · LANDING` / `AUTH · HOME` on the right.

---

## Mode Resolution (`getNavbarMode`)

```typescript
export type NavbarPage = 'home' | 'landing';

export type NavbarMode =
  | 'guest-landing'           // Case 2
  | 'authenticated-landing'   // Case 1
  | 'authenticated-home';     // Case 3

export function getNavbarMode(
  user: User | null | undefined,
  page: NavbarPage
): NavbarMode;
```

---

## Props Specification

```typescript
export interface NavbarLink {
  label: string;
  href: string;
  active?: boolean; // accent color + aria-current="page"
}

export interface NavbarNotification {
  id: string;
  title: string;
  message?: string;
  time?: string;     // e.g. "12m ago"
  unread?: boolean;  // highlighted row + accent dot + count badge
}

export interface NavbarProps {
  /* --- State (determines the rendered case) --- */
  user?: User | null;                    // signed-in user; null/undefined = logged out
  page?: NavbarPage;                     // default: 'landing'

  /* --- Branding --- */
  brand?: string;                        // default: 'Jira Clone'
  logoLabel?: string;                    // default: 'J'
  links?: NavbarLink[];                  // overrides per-mode default links

  /* --- Navigation --- */
  onNavigate?: (href: string) => void;   // brand + center links
  onLogIn?: () => void;                  // Case 2
  onSignUp?: () => void;                 // Case 2
  onOpenApp?: () => void;                // Case 1
  onLogout?: () => void;                 // authenticated states
  onCreate?: () => void;                 // Case 3 "+" quick-create
  onOpenNotifications?: () => void;      // Case 3 bell panel footer → notifications page
  onOpenProfile?: () => void;            // profile menu "View profile"

  /* --- Search (Case 3) --- */
  searchValue?: string;
  onSearchChange?: (value: string) => void;  // RENDERS the search field when provided
  onSearchSubmit?: (value: string) => void;  // fired on Enter
  searchPlaceholder?: string;                // default: 'Search issues, projects...'

  /* --- Theme (profile menu switch) --- */
  isDark?: boolean;                      // drives the switch knob + label
  onToggleTheme?: () => void;            // both are needed to show the row

  /* --- Notifications (Case 3 bell panel) --- */
  notifications?: NavbarNotification[];

  /* --- Presentation --- */
  showModeBadge?: boolean;               // renders the state "stamp" badge
  sticky?: boolean;                      // default: true (sticky top, z-index 100)
  style?: CSSProperties;                 // merged last
  testID?: string;
}
```

---

## Default Links

| Context | Links |
| :--- | :--- |
| `'landing'` | Features → `#features` · Pricing → `#pricing` · Docs → `#docs` |
| `'home'` | Home → `/home` (**active**) · Spaces → `/spaces` |

Pass `links` to override.

---

## Usage Examples

### Case 3 — Authenticated Home (full feature demo)

```tsx
import { Navbar } from '@/components/shared/navbar';
import { mockCurrentUser } from '@jira-clone/shared';

const notifications = [
  { id: 'n1', title: 'FIELD-1 moved to Done', message: '…', time: '12m ago', unread: true },
  { id: 'n2', title: 'New comment on FIELD-2', message: '…', time: '1h ago', unread: true },
  // …
];

<Navbar
  user={mockCurrentUser}
  page="home"
  showModeBadge
  searchValue={searchQuery}
  onSearchChange={setSearchQuery}
  onSearchSubmit={(value) => runSearch(value)}
  onCreate={() => openCreateCard()}
  notifications={notifications}
  onOpenNotifications={() => router.push('/notifications')}
  isDark={isDark}
  onToggleTheme={toggleTheme}
  onOpenProfile={() => router.push('/profile')}
  onLogout={handleLogout}
  onNavigate={(href) => router.push(href)}
/>
```

### Case 1 — Authenticated Landing

```tsx
<Navbar
  user={mockCurrentUser}
  page="landing"
  onOpenApp={() => router.push('/home')}
  onLogout={handleLogout}
  onNavigate={(href) => router.push(href)}
/>
```

### Case 2 — Guest Landing

```tsx
<Navbar
  page="landing"
  onLogIn={() => router.push('/auth?mode=login')}
  onSignUp={() => router.push('/auth?mode=register')}
  onNavigate={(href) => router.push(href)}
/>
```

### Minimal / Static

```tsx
<Navbar /> // renders guest-landing with brand + links, no actions
```

---

## Feature Deep-Dives

### Search Field

- Rendered **only** in Case 3 **(home)** and **only when `onSearchChange` is provided**.
- Controlled input (base `Input` with a search icon): `value={searchValue}`, `onChangeText={onSearchChange}`.
- Pressing **Enter** submits via a `role="search"` form → `onSearchSubmit(searchValue)`.
- Placeholder defaults to `'Search issues, projects...'`.

### Notifications Dropdown

- The 🔔 **bell** button opens a dropdown panel (320 px wide) listing `notifications`.
- An **unread-count badge** (`--color-warn` pill, e.g. `3`) sits on the bell corner; the panel header also shows the count.
- Unread rows are highlighted (`--color-accent-soft`) with an accent dot.
- Footer **"View all notifications"** button → `onOpenNotifications()` (falls back to `onNavigate('/notifications')`).

### Profile Menu & Theme Toggle

Clicking the **avatar** opens the account menu showing:

| Item | Behavior |
| :--- | :--- |
| User summary | avatar + name + email (read-only header) |
| **View profile** | → `onOpenProfile()` (falls back to `onNavigate('/profile')`) |
| **Dark mode** toggle | full-row `role="switch"` — shows 🌙 **Dark mode** when light, ☀️ **Light mode** when dark; calls `onToggleTheme()`; knob + accent track reflect `isDark` |
| **Log out** | → `onLogout()` (warn color) |

The theme row is only rendered when **both** `isDark` and `onToggleTheme` are provided. The switch keeps the menu open while toggling, so the page flip + knob movement are visible.

### Popover Behavior

- Click a trigger to open, click it again to close (**toggle**).
- **Escape** key closes, and a fixed **click-away backdrop** closes on outside click.
- Only one popover is open at a time (`'profile' | 'notifications'`).
- Panels render at `z-index: 999` above the `sticky` header (`z-index: 100`).

---

## Live Playground

The web app's `apps/web/src/App.tsx` mounts a **Navbar showcase** (first section) with:

- A **case switcher** — buttons `2 · Guest / Landing`, `1 · Auth / Landing`, `3 · Auth / Home` (defaults to **Auth / Home**).
- A mode **stamp badge** in the section header.
- `onLogIn` / `onOpenApp` / `onLogout` actually flip the rendered case, so the three states can be tested end-to-end.
- 4 sample notifications and a live **dark/light switch** bound to the playground theme.

Run it and see it at http://localhost:3000.

---

## Validation

```bash
npx tsc -p apps/web/tsconfig.app.json --noEmit   # typecheck
npm run build --workspace=apps/web               # tsc -b && vite build
npm run web                                      # dev server (http://localhost:3000)
```