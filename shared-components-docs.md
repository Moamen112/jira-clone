# Shared Components Documentation

This document serves as the developer guide for the composite **Shared Components** in `apps/mobile/src/components/shared/`.

Shared components represent domain-specific UI patterns built strictly by composing the reusable **Base Components** (`Text`, `Badge`, `Avatar`, `IconButton`, `Button`, `Input`, `Textarea`, `Modal`, `Toast`, etc.) alongside Fieldnotes design tokens and headless business logic from `@jira-clone/shared`.

---

## Table of Contents

1. [Architecture & Reusability Principles](#architecture--reusability-principles)
2. [Card Component](#card-component)
   - [Overview](#overview)
   - [Composed Base Primitives](#composed-base-primitives)
   - [Props Specification](#props-specification)
   - [Usage Examples](#usage-examples)
3. [CardDetail Component](#carddetail-component)
   - [Overview](#overview-1)
   - [Composed Base Primitives](#composed-base-primitives-1)
   - [Permission Enforcement Matrix](#permission-enforcement-matrix)
   - [Props Specification](#props-specification-1)
   - [Usage Example with Card Integration](#usage-example-with-card-integration)
4. [ActivityLog & ActivityLogItem Components](#activitylog--activitylogitem-components)
   - [Overview](#overview-2)
   - [Composed Base Primitives](#composed-base-primitives-2)
   - [Supported Action Types](#supported-action-types)
   - [Props Specifications](#props-specifications)
   - [Usage Examples](#usage-examples-1)
5. [AssigneeSelect Component](#assigneeselect-component)
   - [Overview](#overview-3)
   - [Composed Base Primitives](#composed-base-primitives-3)
   - [Props Specification](#props-specification-2)
   - [Usage Examples](#usage-examples-2)
6. [ConfirmDialog Component](#confirmdialog-component)
   - [Overview](#overview-4)
   - [Composed Base Primitives](#composed-base-primitives-4)
   - [Variants & Visual Intent](#variants--visual-intent)
   - [Props Specification](#props-specification-3)
   - [Usage Examples](#usage-examples-3)
7. [CommentSection & CommentItem Components](#commentsection--commentitem-components)
   - [Overview](#overview-5)
   - [Composed Base Primitives](#composed-base-primitives-5)
   - [Props Specifications](#props-specifications-1)
   - [Usage Examples](#usage-examples-4)
8. [CardMoveMenu Component](#cardmovemenu-component)
   - [Overview](#overview-6)
   - [Composed Base Primitives](#composed-base-primitives-6)
   - [Props Specification](#props-specification-4)
   - [Usage Examples](#usage-examples-5)
9. [BoardFilterBar Component](#boardfilterbar-component)
   - [Overview](#overview-7)
   - [Composed Base Primitives](#composed-base-primitives-7)
   - [filterCards Pure Helper](#filtercards-pure-helper)
   - [Props Specification](#props-specification-5)
   - [Usage Examples](#usage-examples-6)
10. [BoardColumn Component](#boardcolumn-component)
   - [Overview](#overview-8)
   - [Composed Base Primitives](#composed-base-primitives-8)
   - [Props Specification](#props-specification-6)
   - [Usage Examples](#usage-examples-7)
11. [Board Component](#board-component)
   - [Overview](#overview-9)
   - [Composed Base Primitives](#composed-base-primitives-9)
   - [Props Specification](#props-specification-7)
   - [Usage Examples](#usage-examples-8)
12. [Theming & Redux Toolkit Architecture](#theming--redux-toolkit-architecture)
   - [Overview](#overview-10)
   - [Redux Theme Slice](#redux-theme-slice)
   - [useTheme Hook & Dynamic Tokens](#usetheme-hook--dynamic-tokens)
   - [Theme Mode Switcher](#theme-mode-switcher)
13. [Planned Components & Future Integrations](#planned-components--future-integrations)
14. [Role & Permission Integration](#role--permission-integration)

---

## Architecture & Reusability Principles

- **No Raw Styles When Tokens Exist**: Colors, spacing, and typography always draw from `colors.light`, `spacing`, and `radius`.
- **Composition Over Duplication**: Composite components must assemble existing base components rather than re-implementing badges, buttons, typography, or avatars from scratch.
- **Decoupled from Data Sources**: Shared components accept standard domain interfaces (`Card`, `User`, `BoardColumn`, `ActivityLog`) defined in `@jira-clone/shared` and trigger callbacks (`onPress`, `onSave`, `onDelete`, `onSelect`, etc.) instead of binding directly to global network state.

---

## Card Component

### Overview

The `Card` component renders a Kanban issue card. It displays the issue key, title, optional description snippet, comment counter, and assignee avatar. It also supports showing the user's role on the card (`Publisher`, `Assignee`, or `Viewer`), triggering card tap inspection, and quick action callbacks.

> **Note**: A slot is reserved in the footer for future integration of the upcoming `PriorityBadge` component.

**Location**: `apps/mobile/src/components/shared/card/Card.tsx`  
**Barrel Export**: `apps/mobile/src/components/shared`

### Composed Base Primitives

| Base Component / Primitive | Usage in `Card` |
| :--- | :--- |
| `Text (variant="monoKey")` | Renders the issue key (e.g. `FIELD-1`) with monospace letter spacing |
| `Text (variant="bodySmall")` | Renders the card title with bold weight and multi-line clamping |
| `Text (variant="caption")` | Renders the optional description snippet and comment count |
| `AssigneeSelect (variant="avatarOnly")` | Renders single `Avatar` or multi-assignee `AvatarGroup` with in-card reassignment modal |
| `Badge` | Renders the card role badge (`Publisher` / `Assignee`) |
| `IconButton` | Renders the optional ellipsis action menu button |

---

### Props Specification

```typescript
export interface CardProps {
  /** The card entity from @jira-clone/shared */
  card: CardType;

  /** Optional assigned user details (single mode) */
  assignee?: User | null;

  /** Optional list of assigned users (multi-assignee support) */
  assignees?: User[];

  /** Workspace members available for in-card reassignment */
  users?: User[];

  /** The role of the viewing user for this card ('publisher' | 'assignee' | 'viewer') */
  currentUserRole?: CardRole;

  /** Whether to show the role badge in the header (default: false) */
  showRoleBadge?: boolean;

  /** Whether to render description snippet if available (default: true) */
  showDescription?: boolean;

  /** Press handler to inspect or open card details */
  onPress?: (card: CardType) => void;

  /** Quick move or actions menu callback */
  onMove?: (card: CardType) => void;

  /** Callback when assignee is changed directly from the card */
  onAssigneeChange?: (userId: string | null, card: CardType) => void;

  /** Callback when multiple assignees are changed directly from the card */
  onAssigneesChange?: (userIds: string[], card: CardType) => void;

  /** Custom container style override */
  style?: ViewStyle;

  /** Optional test identifier */
  testID?: string;
}
```

---

### Usage Examples

#### 1. Basic Interactive Card

```tsx
import React from 'react';
import { Card } from '@/components/shared';
import { Card as CardType } from '@jira-clone/shared';

const myCard: CardType = {
  id: 'card-1',
  key: 'FIELD-1',
  title: 'Implement design tokens and typography hierarchy',
  projectId: 'proj-1',
  columnId: 'col-todo',
  publisherId: 'user-1',
  priority: 'high',
  order: 0,
  commentCount: 2,
  createdAt: '2026-09-02T14:00:00.000Z',
  updatedAt: '2026-09-04T16:30:00.000Z',
};

export function ExampleScreen() {
  return (
    <Card
      card={myCard}
      onPress={(c) => console.log('Card tapped:', c.key)}
    />
  );
}
```

---

## CardDetail Component

### Overview

The `CardDetail` component presents a bottom-sheet modal to inspect, edit, and manage an issue card. It integrates card-level permissions automatically to ensure only authorized users can edit specific fields.

**Location**: `apps/mobile/src/components/shared/card-detail/CardDetail.tsx`  
**Barrel Export**: `apps/mobile/src/components/shared`

### Composed Base Primitives

| Base Component | Usage in `CardDetail` |
| :--- | :--- |
| `Modal (presentation="bottomSheet")` | Houses the bottom-sheet container with drag-to-dismiss and safe scrolling |
| `Text` | Renders typography hierarchy (`heading`, `label`, `caption`, `sectionLabel`) |
| `Input` | Renders the editable title field with disabled state enforcement |
| `Textarea` | Renders the multi-line description field |
| `Button` | Renders the primary "Save Changes", danger "Delete", and ghost "Cancel" actions |
| `Badge` | Displays the user's role on the card (`Publisher`, `Assignee`, `Viewer`) |
| `Avatar` | Renders the assignee and reporter avatars with initials/image fallbacks |
| `Divider` | Visually separates form sections (Status, Details, People) |
| `ActivityLog` | Embedded audit timeline for the card |

---

### Permission Enforcement Matrix

| Field / Action | Publisher (Creator) | Assignee (Worker) | Viewer (Observer) |
| :--- | :---: | :---: | :---: |
| **Edit Title** | Yes | Read-only | Read-only |
| **Edit Description** | Yes | Yes | Read-only |
| **Move Column / Status** | Yes | Yes | Read-only |
| **Change Priority** | Yes | Read-only | Read-only |
| **Change Assignee** | Yes | Read-only | Read-only |
| **Delete Card** | Yes | Hidden | Hidden |

---

### Props Specification

```typescript
export interface CardDetailProps {
  /** Visibility toggle */
  visible: boolean;

  /** The card entity to view or edit */
  card: CardType | null;

  /** Available board columns (e.g. To Do, In Progress, Done) */
  columns?: BoardColumn[];

  /** Available workspace members for reassignment */
  users?: User[];

  /** Activity audit logs for this card */
  activityLogs?: ActivityLogType[];

  /** The logged-in user ID (used to compute permissions automatically) */
  currentUserId?: string;

  /** Explicit role override (if precomputed) */
  currentUserRole?: CardRole;

  /** Close callback */
  onClose: () => void;

  /** Callback fired when user saves changes */
  onSave?: (updatedCard: CardType) => void;

  /** Callback fired when user deletes the card (publisher only) */
  onDelete?: (cardId: string) => void;

  /** Loading state for the save action button */
  loading?: boolean;
}
```

---

## ActivityLog & ActivityLogItem Components

### Overview

`ActivityLog` and `ActivityLogItem` render an audit timeline of events for an issue card or project. It formats event details into human-readable action messages, status transitions, assignee changes, and relative timestamps.

**Location**: `apps/mobile/src/components/shared/activity-log/`  
**Barrel Export**: `apps/mobile/src/components/shared`

### Composed Base Primitives

| Base Component | Usage in `ActivityLog` |
| :--- | :--- |
| `Avatar (size="xs")` | Displays the actor profile image or initials |
| `Text (variant="bodySmall" bold)` | Displays the actor user name |
| `Text (variant="bodySmall" muted)` | Displays action descriptions (e.g. "changed status", "created this card") |
| `Text (variant="caption" muted)` | Displays formatted timestamps |
| `Badge` | Highlights transition states (e.g. `In Progress` $\rightarrow$ `Done`) |
| `Divider` / Timeline connector | Connects events visually down the vertical line |

---

### Supported Action Types

- `CARD_CREATED`: Initial column placement chip.
- `STATUS_CHANGED`: Column transition chip with directional arrow (`from` $\rightarrow$ `to`).
- `ASSIGNEE_CHANGED`: Assignee name chip or unassigned notice.
- `TITLE_UPDATED`: Notice that the title was renamed.
- `DESCRIPTION_UPDATED`: Notice that description details were modified.
- `COMMENT_ADDED`: Notice that a team member left feedback.

---

### Props Specifications

#### `ActivityLogProps`

```typescript
export type ActivityLogFilter = 'all' | 'history' | 'working';

export interface ActivityLogProps {
  /** Array of activity log events */
  logs: ActivityLogType[];

  /** Available workspace members to resolve actor profile */
  users?: User[];

  /** Optional filter for a specific card */
  cardId?: string;

  /** Optional header title (default: 'ACTIVITY') */
  title?: string;

  /** Maximum number of items to display */
  maxItems?: number;

  /** Custom container style */
  style?: ViewStyle;

  /** Controlled active filter */
  filter?: ActivityLogFilter;

  /** Default filter if uncontrolled (default: 'all') */
  defaultFilter?: ActivityLogFilter;

  /** Callback fired when filter tab changes */
  onFilterChange?: (filter: ActivityLogFilter) => void;

  /** Whether to show the filter pills (default: true) */
  showFilters?: boolean;
}
```

#### `ActivityLogItemProps`

```typescript
export interface ActivityLogItemProps {
  /** The activity log record */
  log: ActivityLog;

  /** The actor user who performed the action */
  actor?: User | null;

  /** Whether this is the final item in the timeline (hides bottom connector) */
  isLast?: boolean;

  /** Custom container style */
  style?: ViewStyle;
}
```

---

## AssigneeSelect Component

### Overview

`AssigneeSelect` provides a dedicated UI trigger and bottom-sheet member selector. It displays the currently selected assignee's avatar, name, and email with a clean chevron indicator. When pressed, it presents a searchable modal sheet with an "Unassign" option and all team members.

**Location**: `apps/mobile/src/components/shared/assignee-select/AssigneeSelect.tsx`  
**Barrel Export**: `apps/mobile/src/components/shared`

### Composed Base Primitives

| Base Component | Usage in `AssigneeSelect` |
| :--- | :--- |
| `Avatar` | Renders user profile images and initials in both trigger card and member list |
| `Text (variant="label")` | Renders field label above trigger |
| `Text (variant="bodySmall" bold)` | Displays user full name |
| `Text (variant="caption" muted)` | Displays email address and placeholder info |
| `Input` | Search filter inside the bottom sheet picker modal |
| `Modal (presentation="bottomSheet")` | Houses the selection list sheet with smooth gesture dismiss |
| `Ionicons` | Chevron-down, search icon, checkmark, and dashed unassigned indicator |

---

### Props Specification

```typescript
export interface AssigneeSelectProps {
  /** Currently selected user ID (null for unassigned) */
  selectedUserId?: string | null;

  /** List of workspace members */
  users?: User[];

  /** Selection callback (userId is null when unassigned) */
  onSelect?: (userId: string | null) => void;

  /** Field label placed above the trigger (default: 'Assignee') */
  label?: string;

  /** Placeholder when unassigned (default: 'Unassigned') */
  placeholder?: string;

  /** Read-only or disabled state */
  disabled?: boolean;

  /** Optional helper or permission text below trigger */
  helperText?: string;

  /** Custom style override */
  style?: ViewStyle;
}
```

---

### Usage Examples

#### 1. Standard Assignee Selection

```tsx
import React, { useState } from 'react';
import { AssigneeSelect } from '@/components/shared';
import { mockUsers } from '@jira-clone/shared';

export function EditCardAssignee() {
  const [assigneeId, setAssigneeId] = useState<string | null>('user-2');

  return (
    <AssigneeSelect
      selectedUserId={assigneeId}
      users={mockUsers}
      onSelect={(id) => setAssigneeId(id)}
    />
  );
}
```

#### 2. Disabled / Read-Only Assignee View

```tsx
<AssigneeSelect
  selectedUserId={card.assigneeId}
  users={mockUsers}
  disabled={true}
  helperText="Only the publisher can reassign this card."
/>
```

---

## ConfirmDialog Component

### Overview

`ConfirmDialog` is a focused, modal confirmation dialog built for destructive, irreversible, or high-impact actions (e.g. deleting cards, discarding unsaved edits, or archiving boards). It renders a centered modal dialog with an intent icon badge, heading title, consequence message, and action buttons (`Cancel` and `Confirm`).

**Location**: `apps/mobile/src/components/shared/confirm-dialog/ConfirmDialog.tsx`  
**Barrel Export**: `apps/mobile/src/components/shared`

### Composed Base Primitives

| Base Component / Primitive | Usage in `ConfirmDialog` |
|---|---|
| `Modal` (`presentation="dialog"`) | Provides animated centered dialog frame and dimming backdrop overlay. |
| `Text` (`heading`, `bodySmall`, `monoKey`) | Emphatic title, consequence text, and optional issue key identifier. |
| `Button` (`variant="danger" \| "primary" \| "ghost"`) | Primary confirm and secondary dismiss actions with loading indicators. |
| `Ionicons` | Visual intent badge (trash, warning, information). |

### Variants & Visual Intent

* **`danger`** (Default): Terracotta/red theme (`colors.light.warn`, `warnSoft`), trash icon, danger button. Used for card deletion.
* **`warning`**: Warm amber theme, warning icon, secondary confirm button. Used for discarding unsaved changes.
* **`info`**: Forest green/teal theme (`colors.light.accent`, `accentSoft`), info icon, primary button. Used for confirmations and archiving.

### Props Specification

| Prop | Type | Default | Description |
|---|---|---|---|
| `visible` | `boolean` | **Required** | Visibility toggle. |
| `title` | `string` | **Required** | Main dialog heading (e.g. `"Delete Issue?"`). |
| `message` | `string` | **Required** | Detailed description explaining consequences. |
| `variant` | `'danger' \| 'warning' \| 'info'` | `'danger'` | Visual intent styling. |
| `itemKey` | `string` | `undefined` | Optional entity key (e.g. `"FIELD-1"`). |
| `confirmLabel` | `string` | `'Delete'` / `'Confirm'` | Confirm button label. |
| `cancelLabel` | `string` | `'Cancel'` | Cancel button label. |
| `onConfirm` | `() => void \| Promise<void>` | **Required** | Action fired when confirmed. |
| `onCancel` | `() => void` | **Required** | Action fired when dismissed. |
| `loading` | `boolean` | `false` | Displays spinner in confirm button during async calls. |
| `dismissOnBackdropPress` | `boolean` | `true` | Whether tapping the backdrop triggers `onCancel`. |
| `icon` | `React.ReactNode` | `undefined` | Custom icon override. |

### Usage Examples

#### 1. Destructive Card Deletion (inside `CardDetail`)

```tsx
<ConfirmDialog
  visible={isDeleteOpen}
  title="Delete Issue?"
  itemKey="FIELD-12"
  message="Are you sure you want to permanently delete this issue? All comments, attachments, and logs will be removed."
  variant="danger"
  confirmLabel="Delete"
  cancelLabel="Keep Issue"
  loading={isDeleting}
  onConfirm={async () => {
    await api.deleteCard(card.id);
    setIsDeleteOpen(false);
  }}
  onCancel={() => setIsDeleteOpen(false)}
/>
```

#### 2. Discard Unsaved Changes Warning

```tsx
<ConfirmDialog
  visible={showDiscardPrompt}
  title="Discard Unsaved Changes?"
  message="You have unsaved changes in this card description. Leaving now will discard all new edits."
  variant="warning"
  confirmLabel="Discard"
  cancelLabel="Keep Editing"
  onConfirm={() => navigateBack()}
  onCancel={() => setShowDiscardPrompt(false)}
/>
```

---

## CommentSection & CommentItem Components

### Overview

`CommentSection` provides a full-featured discussion thread for issue cards. It renders existing comments chronologically with author avatars, names, timestamps, and delete controls, paired with an expandable comment composer at the bottom. Tapping delete on any comment automatically opens a [`ConfirmDialog`](#confirmdialog-component) before executing the deletion.

**Location**: `apps/mobile/src/components/shared/comment-section/CommentSection.tsx`  
**Subcomponent**: `apps/mobile/src/components/shared/comment-section/CommentItem.tsx`  
**Barrel Export**: `apps/mobile/src/components/shared`

### Composed Base Primitives

| Base Component / Primitive | Usage in `CommentSection` |
|---|---|
| `Avatar` (`size="xs" \| "sm"`) | Author profile indicators for each comment and current user composer indicator. |
| `Text` (`sectionLabel`, `bodySmall`, `caption`) | Section heading, author names, relative timestamps, and comment body text. |
| `Badge` (`neutral`, `rounded`) | Total comment count pill in the section header. |
| `Textarea` | Multi-line text input for writing comments with focus expansion. |
| `Button` (`primary`, `ghost`) | Save and Cancel actions in the active composer. |
| `IconButton` | Trash icon button on author comments. |
| `ConfirmDialog` | Destructive confirmation modal triggered before deleting any comment. |

### Props Specifications

#### `CommentSectionProps`

| Prop | Type | Default | Description |
|---|---|---|---|
| `comments` | `Comment[]` | `[]` | List of comment entities for the card. |
| `cardId` | `string` | `undefined` | Target card identifier. |
| `users` | `User[]` | `[]` | Workspace members for resolving author avatars and names. |
| `currentUser` | `User \| null` | `undefined` | Current logged-in user profile. |
| `canComment` | `boolean` | `true` | Permission to post comments. |
| `loading` | `boolean` | `false` | Loading spinner during submission. |
| `title` | `string` | `'COMMENTS'` | Section header title. |
| `onAddComment` | `(content: string, cardId?: string) => void \| Promise<void>` | `undefined` | Callback invoked when a new comment is submitted. |
| `onDeleteComment` | `(commentId: string) => void` | `undefined` | Callback invoked when a comment is confirmed for deletion. |

#### `CommentItemProps`

| Prop | Type | Default | Description |
|---|---|---|---|
| `comment` | `Comment` | **Required** | The comment record. |
| `author` | `User \| null` | `undefined` | Author profile. |
| `canDelete` | `boolean` | `false` | Whether to show delete trash button. |
| `onDelete` | `(commentId: string) => void` | `undefined` | Delete callback. |

### Usage Examples

#### 1. Embedded Discussion Inside `CardDetail`

```tsx
<CommentSection
  cardId={card.id}
  comments={cardComments}
  users={mockUsers}
  currentUser={currentUser}
  onAddComment={async (content) => {
    await api.postComment({ cardId: card.id, content });
  }}
  onDeleteComment={async (commentId) => {
    await api.deleteComment(commentId);
  }}
/>
```

---

## CardMoveMenu Component

### Overview

`CardMoveMenu` is a quick-action bottom sheet modal that allows users to rapidly transfer a card between board columns without requiring horizontal dragging. It displays the issue key, card title, current status badge, an optional column placement toggle (`Top of Column` vs `Bottom of Column`), and an interactive list of all board destination columns.

It strictly adheres to Fieldnotes permissions: only users with the `publisher` or `assignee` role can move the card, with clear permission warning banners displayed for read-only viewers.

**Location**: `apps/mobile/src/components/shared/card-move-menu/CardMoveMenu.tsx`  
**Barrel Export**: `apps/mobile/src/components/shared`

### Composed Base Primitives

| Base Component / Primitive | Usage in `CardMoveMenu` |
|---|---|
| `Modal` (`presentation="bottomSheet"`) | Sliding bottom sheet container. |
| `Text` (`monoKey`, `bodySmall`, `caption`) | Key display, card title, placement labels, and column titles. |
| `Badge` (`accent`, `neutral`) | Current status badge and current position indicator. |
| `Button` (`ghost`) | Full-width Cancel dismiss action in footer. |
| `Divider` | Structural separation between card preview, placement, and column lists. |
| `Ionicons` | Status dot indicators, checkmarks, arrows, and lock icons. |

### Props Specification

| Prop | Type | Default | Description |
|---|---|---|---|
| `visible` | `boolean` | **Required** | Visibility toggle. |
| `card` | `Card \| null` | **Required** | The target card being moved. |
| `columns` | `BoardColumn[]` | `[]` | Available columns on the board. |
| `onClose` | `() => void` | **Required** | Callback when the sheet is dismissed. |
| `onMoveColumn` | `(columnId: string, card: Card, position?: 'top' \| 'bottom') => void \| Promise<void>` | **Required** | Callback invoked when a destination column is tapped. |
| `currentUserId` | `string` | `undefined` | Logged-in user ID to compute card permissions. |
| `currentUserRole` | `CardRole` | `undefined` | Role override (`'publisher'` \| `'assignee'` \| `'viewer'`). |
| `loading` | `boolean` | `false` | Disables options during async movement. |

### Usage Examples

#### 1. In-Card Quick Move Trigger

```tsx
const [moveCard, setMoveCard] = useState<Card | null>(null);

<Card
  card={card}
  onMove={(c) => setMoveCard(c)}
/>

<CardMoveMenu
  visible={Boolean(moveCard)}
  card={moveCard}
  columns={boardColumns}
  currentUserId={currentUser.id}
  onClose={() => setMoveCard(null)}
  onMoveColumn={async (columnId, targetCard, position) => {
    await api.moveCard({ cardId: targetCard.id, columnId, position });
  }}
/>
```

---

## BoardFilterBar Component

### Overview

`BoardFilterBar` is a comprehensive filtering and search header engineered for board-level and card-list views. It combines a real-time text query search field with an active result counter and horizontally scrollable quick-filter pills (such as `"My Issues"`, `"Created by Me"`, `"Has Comments"`, team member facepile avatar pills, and an instant reset action).

It also exports a pure, headless helper function `filterCards(cards, criteria)` that can be used universally across any screen or list.

**Location**: `apps/mobile/src/components/shared/board-filter-bar/BoardFilterBar.tsx`  
**Barrel Export**: `apps/mobile/src/components/shared`

### Composed Base Primitives

| Base Component / Primitive | Usage in `BoardFilterBar` |
|---|---|
| `Input` | Search query field with magnifying glass icon and instant clear button. |
| `Avatar` (`size="xs"`) | Mini team member facepile pills for instant assignee filtering. |
| `Badge` (`accent`, `neutral`) | Match counter pill displaying `X of Y` cards matching active filters. |
| `Text` (`caption`, `bodySmall`) | Filter labels, empty state guidance, and reset pill text. |
| `Ionicons` | Search, person, create, chatbubble, close-circle, and reset icons. |

### `filterCards` Pure Helper

```tsx
import { filterCards } from '@/components/shared';

const matchingCards = filterCards(cards, {
  searchQuery: 'field',
  assignedToMe: true,
  createdByMe: false,
  hasComments: true,
  selectedUserIds: ['user-1', 'user-2'],
  currentUserId: currentUser.id,
});
```

### Props Specification

| Prop | Type | Default | Description |
|---|---|---|---|
| `searchQuery` | `string` | `''` | Search query text input value. |
| `onSearchChange` | `(query: string) => void` | `undefined` | Callback invoked when search input changes. |
| `assignedToMe` | `boolean` | `false` | Whether `"My Issues"` filter is toggled active. |
| `onToggleAssignedToMe` | `() => void` | `undefined` | Toggle handler for `"My Issues"`. |
| `createdByMe` | `boolean` | `false` | Whether `"Created by Me"` filter is active. |
| `onToggleCreatedByMe` | `() => void` | `undefined` | Toggle handler for `"Created by Me"`. |
| `hasComments` | `boolean` | `false` | Whether `"Has Comments"` filter is active. |
| `onToggleHasComments` | `() => void` | `undefined` | Toggle handler for `"Has Comments"`. |
| `selectedUserIds` | `string[]` | `[]` | Selected member IDs for facepile avatar filtering. |
| `onToggleUserId` | `(userId: string) => void` | `undefined` | Toggle handler when tapping a member avatar pill. |
| `users` | `User[]` | `[]` | Workspace members to render as quick facepile filters. |
| `currentUser` | `User \| null` | `undefined` | Current logged in user profile. |
| `matchCount` | `number` | `undefined` | Count of matching cards to display in counter badge. |
| `totalCount` | `number` | `undefined` | Total available cards count. |
| `onClearFilters` | `() => void` | `undefined` | Callback when tapping the `"Reset (X)"` pill. |

### Usage Examples

#### 1. Real-Time Board Filter Integration

```tsx
const [search, setSearch] = useState('');
const [myIssues, setMyIssues] = useState(false);
const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

const filtered = filterCards(allCards, {
  searchQuery: search,
  assignedToMe: myIssues,
  selectedUserIds: selectedUsers,
  currentUserId: user.id,
});

<BoardFilterBar
  searchQuery={search}
  onSearchChange={setSearch}
  assignedToMe={myIssues}
  onToggleAssignedToMe={() => setMyIssues((v) => !v)}
  selectedUserIds={selectedUsers}
  onToggleUserId={(id) =>
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    )
  }
  users={mockUsers}
  currentUser={user}
  matchCount={filtered.length}
  totalCount={allCards.length}
  onClearFilters={() => {
    setSearch('');
    setMyIssues(false);
    setSelectedUsers([]);
  }}
/>
```

---

## BoardColumn Component

### Overview

The `BoardColumn` component renders a single vertical column in a Kanban board. It features:
- A distinct status bar dot/indicator matching Fieldnotes design semantics (emerald for Done, accent orange for Review, blue for In Progress, neutral muted for To Do).
- Column header displaying title, card count `Badge`, and quick "+ Add card" action button.
- Vertical card list rendering `Card` components, with automatic resolution of single and multi-assignees.
- Inline card creation form with text `Input`, cancel action, and loading state.
- Empty column placeholder with dashed border and "+ Add a card" call-to-action when no cards exist.
- Responsive width calculation (`DEFAULT_COLUMN_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 330)`) optimized for mobile horizontal scroll views.

**Location**: `apps/mobile/src/components/shared/board-column/BoardColumn.tsx`  
**Barrel Export**: `apps/mobile/src/components/shared`

### Composed Base Primitives

| Base Component / Primitive | Usage in `BoardColumn` |
| :--- | :--- |
| `Text (variant="body", bold)` | Renders the column title in the header |
| `Badge (variant="neutral", rounded)` | Renders the card count indicator next to the column title |
| `IconButton (variant="ghost")` | Header quick "+ Add card" button |
| `Input` | Inline card title creation input field |
| `Button (variant="primary", "ghost")` | Inline card creation "Add Card" / "Cancel" actions and empty state button |
| `Card` | Renders cards belonging to the column |

---

### Props Specification

```typescript
export interface BoardColumnProps {
  /** The board column metadata */
  column: BoardColumnType;
  /** Cards belonging to this column */
  cards: CardType[];
  /** Available workspace members */
  users?: User[];
  /** Current viewing user ID */
  currentUserId?: string;
  /** Card press handler (opens detail) */
  onCardPress?: (card: CardType) => void;
  /** Quick move handler */
  onCardMove?: (card: CardType) => void;
  /** Card single assignee change callback */
  onCardAssigneeChange?: (userId: string | null, card: CardType) => void;
  /** Card multi-assignees change callback */
  onCardAssigneesChange?: (userIds: string[], card: CardType) => void;
  /** Quick inline card creation callback */
  onCreateCard?: (title: string, columnId: string) => void | Promise<void>;
  /** Whether card creation is allowed (default: true) */
  canCreateCard?: boolean;
  /** Custom column width (default: 82% screen width, capped at 330px) */
  columnWidth?: number;
  /** Custom container style */
  style?: ViewStyle;
  /** Test identifier */
  testID?: string;
}
```

---

### Usage Examples

#### Horizontal Kanban Board

```tsx
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { BoardColumn } from '@/components/shared';
import { mockColumns, mockCards, mockUsers, mockCurrentUser } from '@jira-clone/shared';

export const KanbanBoardPreview = () => {
  const [cards, setCards] = useState(mockCards);

  const handleCreateCard = (title: string, columnId: string) => {
    const newCard = {
      id: `card-${Date.now()}`,
      key: `FIELD-${cards.length + 1}`,
      title,
      projectId: 'project-1',
      columnId,
      order: cards.filter((c) => c.columnId === columnId).length,
      publisherId: mockCurrentUser.id,
      assigneeId: null,
      assigneeIds: [],
      priority: 'medium' as const,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCards((prev) => [...prev, newCard]);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {mockColumns.map((col) => (
        <BoardColumn
          key={col.id}
          column={col}
          cards={cards.filter((c) => c.columnId === col.id)}
          users={mockUsers}
          currentUserId={mockCurrentUser.id}
          onCreateCard={handleCreateCard}
          onCardPress={(card) => console.log('Card tapped:', card.key)}
          onCardMove={(card) => console.log('Move tapped:', card.key)}
        />
      ))}
    </ScrollView>
  );
};
```

---

## Board Component

### Overview

The `Board` component is the top-level Kanban surface for Fieldnotes. It orchestrates:
- **Horizontal Kanban Surface**: Uses `ScrollView` with responsive column widths (`DEFAULT_COLUMN_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 330)`), column gaps (`spacing[3]`), and paging snaps (`snapToInterval`, `decelerationRate="fast"`).
- **Column Jump Navigation**: Interactive column tabs/pills header displaying column titles, count badges, and status accent dots. Tapping any pill automatically animates the board to that column.
- **Integrated Real-Time Filtering**: Seamlessly embeds `BoardFilterBar` with issue text search, quick toggle chips ("Assigned to me", "Created by me", "Has comments"), and workspace assignee avatar multi-selection. Uses `filterCards` to filter issues in all columns in real-time.
- **Card Actions & Creation**: Propagates `onCardPress`, `onCardMove`, `onCardAssigneeChange`, and `onCreateCard` for inline card creation within any column.
- **Pull-to-Refresh & Empty States**: Supports `RefreshControl` and renders a clean empty state if no columns are configured.

**Location**: `apps/mobile/src/components/shared/board/Board.tsx`  
**Barrel Export**: `apps/mobile/src/components/shared`

### Composed Base Primitives

| Base Component / Primitive | Usage in `Board` |
| :--- | :--- |
| `Text (variant="heading", bold)` | Renders board title |
| `Badge (variant="accent", "neutral")` | Renders project key, issue count indicator, and column counts |
| `BoardFilterBar` | Integrated issue search, filter chips, and assignee avatars |
| `BoardColumn` | Renders each workflow column with its card stack |
| `RefreshControl` | Pull-to-refresh board synchronization |

---

### Props Specification

```typescript
export interface BoardProps {
  /** Columns configured for this board */
  columns: BoardColumnType[];
  /** Cards belonging to this board */
  cards: CardType[];
  /** Available workspace members */
  users?: User[];
  /** Current viewing user ID */
  currentUserId?: string;
  /** Optional board title (e.g. "Sprint 14 Kanban") */
  boardTitle?: string;
  /** Optional project key or code (e.g. "FIELD") */
  projectKey?: string;
  /** Whether to render the integrated filter bar (default: true) */
  showFilterBar?: boolean;
  /** Whether to show quick column jump tabs above the board (default: true) */
  showColumnTabs?: boolean;
  /** Card press callback (opens detail) */
  onCardPress?: (card: CardType) => void;
  /** Card quick move callback */
  onCardMove?: (card: CardType) => void;
  /** Card single assignee change */
  onCardAssigneeChange?: (userId: string | null, card: CardType) => void;
  /** Card multi-assignees change */
  onCardAssigneesChange?: (userIds: string[], card: CardType) => void;
  /** Quick inline card creation callback */
  onCreateCard?: (title: string, columnId: string) => void | Promise<void>;
  /** Whether card creation is permitted (default: true) */
  canCreateCard?: boolean;
  /** Pull-to-refresh refreshing state */
  refreshing?: boolean;
  /** Pull-to-refresh trigger callback */
  onRefresh?: () => void;
  /** Custom column width (default: Math.min(SCREEN_WIDTH * 0.82, 330)) */
  columnWidth?: number;
  /** Custom gap between columns (default: spacing[3] = 12) */
  columnGap?: number;
  /** Custom slot above board */
  renderHeader?: () => React.ReactNode;
  /** Custom slot below board */
  renderFooter?: () => React.ReactNode;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom scroll content container style */
  contentContainerStyle?: ViewStyle;
  /** Test identifier */
  testID?: string;
}
```

---

### Usage Examples

#### Complete Board with Filters & Column Jump Tabs

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { Board } from '@/components/shared';
import {
  mockColumns,
  mockCards,
  mockUsers,
  mockCurrentUser,
  Card as CardType,
} from '@jira-clone/shared';

export const SprintBoardScreen = () => {
  const [cards, setCards] = useState<CardType[]>(mockCards);

  const handleCreateCard = (title: string, columnId: string) => {
    const newCard: CardType = {
      id: `card-${Date.now()}`,
      key: `FIELD-${cards.length + 1}`,
      title,
      projectId: 'project-1',
      columnId,
      order: cards.filter((c) => c.columnId === columnId).length,
      publisherId: mockCurrentUser.id,
      assigneeId: null,
      assigneeIds: [],
      priority: 'medium',
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCards((prev) => [...prev, newCard]);
  };

  return (
    <View style={{ flex: 1 }}>
      <Board
        columns={mockColumns}
        cards={cards}
        users={mockUsers}
        currentUserId={mockCurrentUser.id}
        boardTitle="Sprint 14 Kanban"
        projectKey="FIELD"
        showFilterBar={true}
        showColumnTabs={true}
        onCreateCard={handleCreateCard}
        onCardPress={(card) => console.log('Open detail for', card.key)}
        onCardMove={(card) => console.log('Quick move for', card.key)}
      />
    </View>
  );
};
```

---

## Theming & Redux Toolkit Architecture

### Overview

Fieldnotes features dynamic **Dark and Light Theme** support managed through Redux Toolkit (`@reduxjs/toolkit` and `react-redux`). The architecture is split across two layers:
1. **Shared State Layer (`@jira-clone/shared/store`)**: Defines `themeSlice` with `'light' | 'dark' | 'system'` modes, reducers, and selectors.
2. **Mobile Context & Hook Layer (`@/tokens`)**: Computes the active palette using React Native's `useColorScheme()` when mode is `'system'`, and exposes `useTheme()` for instant token access.

### Redux Theme Slice

**Location**: `packages/shared/src/store/themeSlice.ts`  
**Barrel Export**: `@jira-clone/shared`

```typescript
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  mode: ThemeMode;
}

// Redux Actions
export const { setThemeMode, toggleTheme } = themeSlice.actions;

// Redux Selector
export const selectThemeMode = (state: { theme: ThemeState }) => state.theme.mode;
```

---

### useTheme Hook & Dynamic Tokens

**Location**: `apps/mobile/src/tokens/useTheme.ts`  
**Barrel Export**: `@/tokens`

```tsx
import { useTheme } from '@/tokens';

export const MyComponent = () => {
  const { mode, isDark, colors, theme, setThemeMode, toggleTheme } = useTheme();

  return (
    <View style={{ backgroundColor: colors.paper, borderColor: colors.line }}>
      <Text style={{ color: colors.ink }}>
        Current mode: {mode} (Dark effective: {isDark ? 'Yes' : 'No'})
      </Text>
      <Button label="Toggle Dark/Light" onPress={toggleTheme} />
    </View>
  );
};
```

### Color Palette Mapping

| Token | Light Value | Dark Value | Purpose |
| :--- | :--- | :--- | :--- |
| `paper` | `#EDEBE4` | `#16181A` | Root app canvas & background |
| `surface` | `#F7F6F2` | `#1F2220` | Card bodies, modals, input containers |
| `ink` | `#1C1E1B` | `#EDEBE4` | Primary high-contrast text & icons |
| `inkMuted` | `#6B6A63` | `#8F8D84` | Secondary text, hints, placeholders |
| `line` | `#D8D5CB` | `#33352F` | Borders, dividers, subtle outlines |
| `accent` | `#1E6F5C` | `#4FB89B` | Primary action buttons, active tabs |
| `accentSoft` | `#DCEAE6` | `#1E3530` | Active chips & badge backgrounds |
| `warn` | `#B8460E` | `#E37650` | Destructive actions, error badges |
| `warnSoft` | `#F5DFD3` | `#3A241C` | Error banners & warning chips |

---

### Theme Mode Switcher

The mobile application includes an interactive theme mode switcher allowing users to toggle between:
- ☀️ **Light**: Fixed light appearance (`#EDEBE4` paper).
- 🌙 **Dark**: Fixed dark appearance (`#16181A` paper, `#1F2220` surface).
- 💻 **System**: Automatically follows device OS appearance via `useColorScheme()`.

---

## Planned Components & Future Integrations

- **PriorityBadge**: Dedicated component to display visual priority indicators (`highest`, `high`, `medium`, `low`, `lowest`).

---

## Role & Permission Integration

The shared components integrate seamlessly with `@jira-clone/shared/utils/permissions`:

```tsx
import { getCardRole, cardPermissions } from '@jira-clone/shared';

// Determine the viewing user's role on the card
const role = getCardRole(currentUserId, card); // 'publisher' | 'assignee' | 'viewer'

// Check permissions
const canEditTitle = cardPermissions.canEditTitle(role);       // true only for 'publisher'
const canMoveStatus = cardPermissions.canMoveStatus(role);     // true for 'publisher' & 'assignee'
const canDelete = cardPermissions.canDeleteCard(role);         // true only for 'publisher'
```
