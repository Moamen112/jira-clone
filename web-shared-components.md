# Web Shared Components — Developer Guide

The **Shared Components** are domain-facing UI patterns for the web app (`apps/web`) built by composing the [**Base Components**](./web-base-components.md) (Text, Button, Input, Badge, Avatar-free primitives), sibling shared primitives (`Avatar`, `AvatarGroup`, `Modal`), and headless domain types from `@jira-clone/shared`.

> 💡 **Sibling docs**: [`web-base-components.md`](./web-base-components.md) documents the base primitives and the CSS-variable design tokens. The mobile equivalents live in the mobile app.

---

## Table of Contents

1. [How to Import](#how-to-import)
2. [Status](#status)
3. [Avatar](#avatar)
4. [AvatarGroup](#avatargroup)
5. [Modal](#modal)
6. [Toast](#toast)
7. [EmptyState](#emptystate)
8. [CreateCardInline](#createcardinline)
9. [CreateProjectModal](#createprojectmodal)
10. [PriorityBadge](#prioritybadge)
11. [StatusBar](#statusbar)
12. [ProjectCard](#projectcard)
13. [ProjectHeader](#projectheader)
14. [PublisherInfo](#publisherinfo)
15. [UserBadge](#userbadge)
16. [UserChip](#userchip)
17. [Validation](#validation)

---

## How to Import

There is **no shared barrel yet** — import each component from its folder:

```tsx
import { PriorityBadge } from '@/components/shared/priority-badge';
import { Modal } from '@/components/shared/modal';
import { EmptyState } from '@/components/shared/empty-state';
```

> **Note**: shared components import siblings with folder-relative paths (e.g. `../avatar/Avatar`), so components inside `shared/` should do the same.

---

## Status

| Folder | Component | Status |
| :--- | :--- | :--- |
| `avatar` | `Avatar` | ✅ |
| `avatar-group` | `AvatarGroup` | ✅ |
| `create-card-inline` | `CreateCardInline` | ✅ |
| `create-project-modal` | `CreateProjectModal` | ✅ |
| `empty-state` | `EmptyState` | ✅ |
| `modal` | `Modal` | ✅ |
| `priority-badge` | `PriorityBadge` | ✅ |
| `project-card` | `ProjectCard` | ✅ |
| `project-header` | `ProjectHeader` | ✅ |
| `publisher-info` | `PublisherInfo` | ✅ |
| `status-bar` | `StatusBar` | ✅ |
| `toast` | `Toast` | ✅ |
| `user-badge` | `UserBadge` | ✅ |
| `user-chip` | `UserChip` | ✅ |
| `activity-log` / `assignee-select` / `board*` / `card*` / `card-detail` / `comment-section` / `confirm-dialog` / `accordion` / `navbar` / `sidenav` | — | 🕐 stubs, not yet implemented |

---

## Avatar

### Overview
Circular user avatar. Renders an image when available, otherwise a **hash-derived palette** with initials. Supports `unassigned` placeholders and bordered stacking.

**Location**: `apps/web/src/components/shared/avatar/Avatar.tsx`

### Props Specification
```typescript
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'; // 20 / 28 / 36 / 44 / 56

export interface AvatarProps {
  name?: string;        // used for initials + palette
  imageUrl?: string;    // rendered when valid (falls back on error)
  size?: AvatarSize | number;
  unassigned?: boolean; // dashed "?" placeholder
  bordered?: boolean;   // 2px ring (group stacking)
  borderColor?: string; // default: var(--color-paper)
  style?: CSSProperties;
}
```

### Usage Example
```tsx
<Avatar name="Alex Morgan" size="xl" bordered />
<Avatar name="Sarah Connor" imageUrl={user.avatarUrl} size="sm" />
<Avatar unassigned size="md" />
```

---

## AvatarGroup

### Overview
Overlapping avatar stack with a `+N` overflow badge. Used for project members and card assignees.

**Location**: `apps/web/src/components/shared/avatar-group/AvatarGroup.tsx`

### Props Specification
```typescript
export interface AvatarGroupUser {
  id?: string;
  name: string;
  avatarUrl?: string;
}

export interface AvatarGroupProps {
  users?: AvatarGroupUser[];
  max?: number;             // default: 3
  size?: AvatarSize;        // default: 'sm'
  borderColor?: string;     // ring color, default: paper
  style?: CSSProperties;
}
```

### Usage Example
```tsx
<AvatarGroup users={members} max={2} size="sm" />
```
---

## Modal

### Overview
General-purpose, theme-aware modal — the foundation for dialogs and bottom sheets. Fixed overlay with click-away backdrop, optional header (mono subtitle + bold title + ✕), scrollable body, and optional footer bar. Closes on <kbd>Escape</kbd>.

**Location**: `apps/web/src/components/shared/modal/Modal.tsx`

### Props Specification
```typescript
export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;                     // e.g. issue key or category tag
  presentation?: 'bottomSheet' | 'dialog'; // default: 'bottomSheet'
  maxHeightRatio?: number;               // bottomSheet max height, default: 0.88
  children: ReactNode;
  footer?: ReactNode;                    // bottom actions bar
  contentStyle?: CSSProperties;
}
```

### Usage Example
```tsx
<Modal
  visible={open}
  onClose={close}
  title="Confirm delete"
  subtitle="CARD"
  presentation="dialog"
  footer={
    <>
      <Button label="Cancel" variant="secondary" size="sm" onPress={close} />
      <Button label="Delete" variant="danger" size="sm" onPress={remove} />
    </>
  }
>
  <Text variant="body">This card will be permanently deleted.</Text>
</Modal>
```

---

## Toast

### Overview
Transient notification with enter/exit animations (CSS transitions), variant theming, auto-dismiss, optional action, and a close button.

**Location**: `apps/web/src/components/shared/toast/Toast.tsx`

### Props Specification
```typescript
export type ToastVariant = 'info' | 'success' | 'warn';

export interface ToastProps {
  visible: boolean;
  message: string;
  variant?: ToastVariant;      // default: 'info'
  position?: 'top' | 'bottom'; // default: 'bottom'
  duration?: number;           // ms; default: 3500, 0 disables auto-dismiss
  onDismiss?: () => void;
  actionLabel?: string;        // e.g. 'Undo'
  onAction?: () => void;
  style?: CSSProperties;
}
```

### Usage Example
```tsx
<Toast
  visible={toastVisible}
  message="Card moved to Done"
  variant="success"
  position="bottom"
  actionLabel="Undo"
  onAction={undoMove}
  onDismiss={() => setToastVisible(false)}
/>
```

---

## EmptyState

### Overview
Centered empty/“nothing here yet” state with a large icon circle, title, description, and up to two actions.

**Location**: `apps/web/src/components/shared/empty-state/EmptyState.tsx`

### Props Specification
```typescript
export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: ButtonVariant;       // default: 'primary'
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  iconContainerColor?: string;         // default: var(--color-accent-soft)
  style?: CSSProperties;
}
```

### Usage Example
```tsx
<EmptyState
  title="No spaces found"
  description="Try a different filter or create a new project."
  icon={<DocumentIcon />}
  actionLabel="New Project"
  onAction={openCreateProject}
  secondaryActionLabel="Clear Filter"
  onSecondaryAction={clearFilter}
/>
```

---

## CreateCardInline

### Overview
Jira-style inline quick-add composer for a board column. Collapsed: dashed “＋ Add card” row; expanded: auto-focus title input with **Add card / Cancel** and inline validation. Supports sync and async `onCreate`.

**Location**: `apps/web/src/components/shared/create-card-inline/CreateCardInline.tsx`

### Props Specification
```typescript
export interface CreateCardInlineProps {
  columnId?: string;                                    // passed through to onCreate
  placeholder?: string;                                 // default: 'What needs to be done?'
  autoExpand?: boolean;                                 // start expanded
  onCreate: (input: { title: string; columnId?: string }) => void | Promise<void>;
  loading?: boolean;                                    // spinner in Add card
  disabled?: boolean;
  style?: CSSProperties;
}
```

### Usage Example
```tsx
<CreateCardInline
  columnId="col-todo"
  onCreate={async ({ title, columnId }) => { await createCard({ title, columnId }); }}
/>
```

---

## CreateProjectModal

### Overview
**Create Project** dialog built on the shared `Modal` (`presentation="dialog"`). Collects name, key, and optional description — auto-derives the key from the name until the user types their own, and validates per the shared `validateProjectKey` rules (2–10 uppercase alphanumerics).

**Location**: `apps/web/src/components/shared/create-project-modal/CreateProjectModal.tsx`

### Props Specification
```typescript
export interface CreateProjectInput {
  name: string;
  key: string;                 // e.g. 'PROJ'
  description?: string;
}

export interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (input: CreateProjectInput) => void | Promise<void>;
  loading?: boolean;           // spinner in Create Project
  title?: string;              // default: 'Create Project'
  subtitle?: string;           // default: 'PROJECT'
}
```

### Usage Example
```tsx
<CreateProjectModal
  visible={showCreateProject}
  onClose={() => setShowCreateProject(false)}
  onCreate={async ({ name, key, description }) => {
    await createProject({ name, key, description });
  }}
/>
```
---

## PriorityBadge

### Overview
Priority indicator pill — 5 levels (`lowest` → `highest`) with a color dot + directional arrow + label. Colors come from CSS variables so they stay correct in dark mode.

**Location**: `apps/web/src/components/shared/priority-badge/PriorityBadge.tsx`

### Props Specification
```typescript
export interface PriorityBadgeProps {
  priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  size?: 'sm' | 'md';          // default: 'sm'
  withIcon?: boolean;          // dot + arrow, default: true
  showLabel?: boolean;         // default: true
  style?: CSSProperties;
}
```

### Usage Example
```tsx
<PriorityBadge priority={card.priority} size="md" />
<PriorityBadge priority="highest" showLabel={false} />
```

---

## StatusBar

### Overview
A status chip for a card/board — colored dot + status title driven by a `BoardColumn`. Dot color falls back to the accent when the column has no explicit color.

**Location**: `apps/web/src/components/shared/status-bar/StatusBar.tsx`

### Props Specification
```typescript
export interface StatusBarProps {
  status: BoardColumn;              // from @jira-clone/shared
  size?: 'sm' | 'md';               // default: 'sm'
  withDot?: boolean;                // default: true
  style?: CSSProperties;
}
```

### Usage Example
```tsx
<StatusBar status={column} size="md" />
```

---

## ProjectCard

### Overview
A project summary card for lists/grids: key badge, name, description, overlapping member avatars, and optional To Do / Active / Done issue-count pills. Renders as a `<button>` when `onPress` is provided.

**Location**: `apps/web/src/components/shared/project-card/ProjectCard.tsx`

### Props Specification
```typescript
export interface ProjectIssueCounts {
  todo: number;
  inProgress: number;
  done: number;
}

export interface ProjectCardProps {
  project: Project;                    // from @jira-clone/shared
  members?: AvatarGroupUser[];
  issueCounts?: ProjectIssueCounts;
  onPress?: () => void;
  style?: CSSProperties;
}
```

### Usage Example
```tsx
<ProjectCard
  project={project}
  members={getProjectMembers(project.id)}
  issueCounts={getProjectIssueCounts(project.id)}
  onPress={() => openProject(project.id)}
/>
```

---

## ProjectHeader

### Overview
The big project header used above a project board: key badge, large `display` title, description, member avatars, and an optional action button.

**Location**: `apps/web/src/components/shared/project-header/ProjectHeader.tsx`

### Props Specification
```typescript
export interface ProjectHeaderProps {
  project: Project;
  members?: AvatarGroupUser[];
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: ButtonVariant;       // default: 'primary'
  style?: CSSProperties;
}
```

### Usage Example
```tsx
<ProjectHeader project={project} members={members} />
```

---

## PublisherInfo

### Overview
“Created by {user}” attribution row with a relative timestamp (`just now` → `Nd ago` → compact date).

**Location**: `apps/web/src/components/shared/publisher-info/PublisherInfo.tsx`

### Props Specification
```typescript
export interface PublisherInfoProps {
  publisher: User;                     // from @jira-clone/shared
  createdAt?: string;                  // ISO-8601
  label?: string;                      // default: 'Created by'
  showLabel?: boolean;                 // default: true
  style?: CSSProperties;
}
```

### Usage Example
```tsx
<PublisherInfo publisher={publisher} createdAt={card.createdAt} />
```

---

## UserBadge

### Overview
A horizontal user row — avatar + bold name and an optional muted subtitle (email or custom). Prints as a `<button>` with pressed feedback when `onPress` is provided.

**Location**: `apps/web/src/components/shared/user-badge/UserBadge.tsx`

### Props Specification
```typescript
export interface UserBadgeProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';           // default: 'md'
  showEmail?: boolean;
  subtitle?: string;                   // overrides email
  onPress?: () => void;
  style?: CSSProperties;
}
```

### Usage Example
```tsx
<UserBadge user={assignee} size="md" showEmail />
```

---

## UserChip

### Overview
A compact fully-rounded pill chip for a user — avatar + name, with an optional `×` remove affordance and press feedback. `default` (outlined) and `accent` (soft accent) variants.

**Location**: `apps/web/src/components/shared/user-chip/UserChip.tsx`

### Props Specification
```typescript
export interface UserChipProps {
  user: User;
  variant?: 'default' | 'accent';      // default: 'default'
  size?: 'sm' | 'md';                  // default: 'md'
  removable?: boolean;
  onRemove?: () => void;
  onPress?: () => void;
  style?: CSSProperties;
}
```

### Usage Example
```tsx
<UserChip user={user} variant="accent" removable onRemove={() => removeAssignee(user.id)} />
```

---

## Validation

From the repo root or `apps/web`:

```bash
npm run build --workspace=apps/web   # tsc -b && vite build
# or, just typecheck the web app sources:
npx tsc -p apps/web/tsconfig.app.json --noEmit

# run the dev server
npm run web                          # from the repo root
```