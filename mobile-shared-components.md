# Mobile Shared Components — Feature Set (10 Components)

This document covers the ten **domain-facing shared components** built for the mobile app's sprint workflow. Each component composes the reusable **Base Components** (`Text`, `Button`, `Input`, `Textarea`, `Modal`, `Badge`, `Avatar`, `AvatarGroup`, `Divider`) with **Fieldnotes design tokens** and headless domain types from `@jira-clone/shared`.

> 💡 **Sibling doc**: for the board-oriented shared components (`Card`, `Board`, `CardDetail`, `CommentSection`, …), see [`shared-components-docs.md`](./shared-components-docs.md).

---

## Table of Contents

1. [Theming & Dark Mode](#theming--dark-mode)
2. [CreateCardInline](#createcardinline)
3. [CreateProjectModal](#createprojectmodal)
4. [EmptyState](#emptystate)
5. [PriorityBadge](#prioritybadge)
6. [ProjectCard](#projectcard)
7. [ProjectHeader](#projectheader)
8. [PublisherInfo](#publisherinfo)
9. [StatusBar](#statusbar)
10. [UserBadge](#userbadge)
11. [UserChip](#userchip)
12. [Planned Integrations](#planned-integrations)

---

## Theming & Dark Mode

All ten components resolve colors through the `useTheme()` hook (from `@/tokens`), exactly like the base and board components:

```tsx
import { useTheme } from '../../../tokens';

const MyComponent = () => {
  const { colors, isDark } = useTheme(); // colors = active palette (light | dark)
  // ...
};
```

**Rules followed in this set:**

- No component imports `colors.light.*` / `colors.dark.*` directly.
- Static `StyleSheet.create({...})` blocks contain **only layout** (spacing, radius, sizes); all color values are applied **inline** in the render body so they follow the active theme.
- Where a raw hex was previously hardcoded for light mode, it is now resolved conditionally against `isDark` (see `PriorityBadge.high`).

---

## CreateCardInline

### Overview
A Jira-style **inline quick-add composer** for a board column. Collapsed it renders a dashed “＋ Add card” ghost row; expanded it shows a title input with **Add card / Cancel** actions and inline validation. Supports sync and async `onCreate` handlers.

**Location**: `apps/mobile/src/components/shared/create-card-inline/`

### Composed Base Primitives
| Primitive | Usage |
| :--- | :--- |
| `Pressable` | Collapsed ghost row trigger |
| `Input` | Title field (auto-focus, `returnKeyType="done"`, Enter submits) |
| `Button` | `Add card` (primary/sm) and `Cancel` (ghost/sm) |
| `Text` | “＋” glyph, `Add card` label, error feedback |

### Props Specification
```typescript
interface CreateCardInlineProps {
  columnId?: string;
  placeholder?: string;                    // default: 'What needs to be done?'
  autoExpand?: boolean;                    // start expanded
  onCreate: (input: { title: string; columnId?: string }) => void | Promise<void>;
  loading?: boolean;                       // spinner in Add card
  disabled?: boolean;
  style?: ViewStyle;
}
```

### Usage Example
```tsx
<CreateCardInline
  columnId="col-todo"
  onCreate={async ({ title, columnId }) => {
    await createCard({ title, columnId });
  }}
/>
```

---

## CreateProjectModal

### Overview
A centered **Create Project** dialog built on the base `Modal` (`presentation="dialog"`). Collects a project name, key, and optional description; auto-derives the key from the name until the user types their own; validates against the shared `validateProjectKey` rules (2–10 uppercase alphanumerics).

**Location**: `apps/mobile/src/components/shared/create-project-modal/`

### Composed Base Primitives
| Primitive | Usage |
| :--- | :--- |
| `Modal` | Centered dialog shell with footer |
| `Input` | Project name (auto-focus) + project key (auto-uppercase) |
| `Textarea` | Optional description with char counter |
| `Button` | `Cancel` (secondary/sm) + `Create Project` (primary/sm, spinner while busy) |
| `Text` | Behavior on `formError` (warn color) |

### Props Specification
```typescript
interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (input: CreateProjectInput) => void | Promise<void>;
  loading?: boolean;
  title?: string;      // default: 'Create Project'
  subtitle?: string;   // default: 'PROJECT'
}
```

### Usage Example
```tsx
<CreateProjectModal
  visible={isOpen}
  onClose={() => setIsOpen(false)}
  onCreate={({ name, key, description }) => createProject({ name, key, description })}
/>
```

---

## EmptyState

### Overview
A centered “nothing here yet” panel: optional icon in a soft accent circle, heading title, description, and up to two action buttons. Only renders sections when their data is present.

**Location**: `apps/mobile/src/components/shared/empty-state/`

### Composed Base Primitives
| Primitive | Usage |
| :--- | :--- |
| `Text` | Title (`heading`), description (`body` muted) |
| `Button` | Primary + secondary CTA (`size="sm"`) |
| `View` | Icon container (72px accent circle, `radius.pill`) |

### Props Specification
```typescript
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: ButtonVariant;            // default: 'primary'
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  iconContainerColor?: string;              // falls back to colors.accentSoft
  style?: ViewStyle;
}
```
---

## PriorityBadge

### Overview
Renders a card's **priority** as a pill badge with a colored direction arrow and label. Fully theme-aware — per-priority colors resolve against the active palette, with `high` and `highest` specifically handling dark mode.

**Location**: `apps/mobile/src/components/shared/priority-badge/`

### Composed Base Primitives
| Primitive | Usage |
| :--- | :--- |
| `Badge` | Pill container (`variant="default"`, bg/text overridden) |
| `Text` | Arrow glyph (`↓ → → ↑ ⤴`) |
| `View` | Status dot + arrow wrapper |

### Props Specification
```typescript
interface PriorityBadgeProps {
  priority: CardPriority;                  // 'lowest'|'low'|'medium'|'high'|'highest'
  size?: 'sm' | 'md';                       // default: 'sm'
  withIcon?: boolean;                       // default: true
  showLabel?: boolean;                      // default: true
  style?: ViewStyle;
}
```

### Priority Color Legend
| Priority | Light | Dark |
| :--- | :--- | :--- |
| `lowest` | surface bg / inkMuted | surface bg / inkMuted |
| `low` | accentSoft bg / accent | accentSoft bg / accent |
| `medium` | warnSoft bg / warn | warnSoft bg / warn |
| `high` | warnSoft bg / `#B8460E` | warnSoft bg / `colors.warn` |
| `highest` | warnSoft bg / warn | `colors.warn` bg / warn |

### Usage Example
```tsx
<PriorityBadge priority={card.priority} />
```

---

## ProjectCard

### Overview
A tappable **project summary card** — key badge + name, member avatars, description, and optional issue-count pills (To Do / Active / Done). Pressing the card (when `onPress` is set) gives pressed feedback.

**Location**: `apps/mobile/src/components/shared/project-card/`

### Composed Base Primitives
| Primitive | Usage |
| :--- | :--- |
| `Badge` | Project key (`variant="mono"`) |
| `Text` | Name (`heading` bold), description (`bodySmall` muted), counts (`caption`) |
| `AvatarGroup` | Member avatars (`size="sm"`, `max={2}`) |
| `Divider` | Separator above counts (theme line color) |
| `Pressable` | Optional tap target with pressed states |

### Props Specification
```typescript
interface ProjectCardProps {
  project: Project;
  members?: AvatarGroupUser[];
  issueCounts?: { todo: number; inProgress: number; done: number };
  onPress?: () => void;
  style?: ViewStyle;
}
```

### Usage Example
```tsx
<ProjectCard
  project={project}
  members={team}
  issueCounts={{ todo: 4, inProgress: 2, done: 12 }}
  onPress={() => openProject(project)}
/>
```

---

## ProjectHeader

### Overview
A **page header** for a project — key badge + display-size title, member avatars, description, and an optional header action button.

**Location**: `apps/mobile/src/components/shared/project-header/`

### Composed Base Primitives
| Primitive | Usage |
| :--- | :--- |
| `Badge` | Project key (`variant="mono"`) |
| `Text` | Title (`display` bold), description (`bodySmall` muted) |
| `AvatarGroup` | Member avatars (`size="sm"`, `max={2}`) |
| `Button` | Optional action (`size="sm"`, default `primary`) |

### Props Specification
```typescript
interface ProjectHeaderProps {
  project: Project;
  members?: AvatarGroupUser[];
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: ButtonVariant;            // default: 'primary'
  style?: ViewStyle;
}
```

### Usage Example
```tsx
<ProjectHeader
  project={project}
  members={team}
  actionLabel="+ New Issue"
  onAction={createIssue}
/>
```

### Usage Example
```tsx
<EmptyState
  title="No cards in this column"
  description="Create your first card to get started."
  icon={<Ionicons name="layers-outline" size={28} color={colors.inkMuted} />}
  actionLabel="Add a card"
  onAction={onAdd}
/>
---

## PublisherInfo

### Overview
A compact **“Created by …” attribution row** — small avatar, publisher name, and a relative/compact timestamp when `createdAt` is provided.

**Location**: `apps/mobile/src/components/shared/publisher-info/`

### Composed Base Primitives
| Primitive | Usage |
| :--- | :--- |
| `Avatar` | Publisher avatar (`size="sm"`) |
| `Text` | Label + bold name (`bodySmall`), timestamp (`monoData` muted) |

### Props Specification
```typescript
interface PublisherInfoProps {
  publisher: User;
  createdAt?: string;                       // ISO-8601
  label?: string;                           // default: 'Created by'
  showLabel?: boolean;                      // default: true
  style?: ViewStyle;
}
```

### Usage Example
```tsx
<PublisherInfo publisher={creator} createdAt={card.createdAt} />
```

---

## StatusBar

### Overview
A **status chip** for a card row — colored dot + status title, driven by a `BoardColumn` (the domain's status type). Dot color falls back to `colors.accent` when the column has no explicit color.

**Location**: `apps/mobile/src/components/shared/status-bar/`

### Composed Base Primitives
| Primitive | Usage |
| :--- | :--- |
| `Badge` | Pill chip (`variant="default"`, `size="sm"`) |
| `View` | Colored status dot (`radius.pill`) |

### Props Specification
```typescript
interface StatusBarProps {
  status: BoardColumn;
  size?: 'sm' | 'md';                       // default: 'sm'
  withDot?: boolean;                        // default: true
  style?: ViewStyle;
}
```

### Usage Example
```tsx
<StatusBar status={column} />
```

---

## UserBadge

### Overview
A **horizontal user row** — avatar + bold name and an optional muted subtitle (email or custom). Sized `sm | md | lg`, and optionally pressable with a soft accent pressed background.

**Location**: `apps/mobile/src/components/shared/user-badge/`

### Composed Base Primitives
| Primitive | Usage |
| :--- | :--- |
| `Avatar` | Sized to the badge tier |
| `Text` | Name (bold, 1-line), subtitle (muted, 1-line) |
| `Pressable` | Optional pressed feedback |

### Props Specification
```typescript
interface UserBadgeProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';                // default: 'md'
  showEmail?: boolean;
  subtitle?: string;                        // overrides email
  onPress?: () => void;
  style?: ViewStyle;
}
```

### Usage Example
```tsx
<UserBadge user={assignee} size="md" showEmail />
```

---

## UserChip

### Overview
A **compact fully-rounded pill chip** for a user — avatar + name, with an optional `×` remove affordance and optional press feedback. Available in `default` (outlined) and `accent` (soft accent) variants.

**Location**: `apps/mobile/src/components/shared/user-chip/`

### Composed Base Primitives
| Primitive | Usage |
| :--- | :--- |
| `Avatar` | User avatar (`xs`/`sm` by chip size) |
| `Text` | Name (caption/bodySmall bold) + remove glyph |
| `Pressable` | Chip press + nested remove press |

### Props Specification
```typescript
interface UserChipProps {
  user: User;
  variant?: 'default' | 'accent';           // default: 'default'
  size?: 'sm' | 'md';                       // default: 'md'
  removable?: boolean;
  onRemove?: () => void;
  onPress?: () => void;
  style?: ViewStyle;
}
```

### Usage Example
```tsx
<UserChip user={user} variant="accent" removable onRemove={() => removeAssignee(user.id)} />
```

---

## Planned Integrations

These ten components are **not yet consumed** by the board screens. Tracked slots / follow-ups:

- **`Card` footer** (`shared/card/Card.tsx`) reserves a slot labeled `// TODO: Integrate PriorityBadge once implemented` — wire `<PriorityBadge priority={card.priority} size="sm" />` there.
- **`BoardColumn`** currently maintains its own inline-create state; plan is to swap it for `CreateCardInline` while keeping the header/empty-state **plus** triggers.
- **`apps/mobile/src/components/shared/index.ts`** exports only the board components today; the ten above should be added to that barrel when consumed.
- **`ProjectCard` / `ProjectHeader` / `PublisherInfo` / `UserBadge` / `UserChip`** are available for the Spaces/People screens (e.g. replacing the mock space-card rows in `app/(tabs)/spaces.tsx`).
```