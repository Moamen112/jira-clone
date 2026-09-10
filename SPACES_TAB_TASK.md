# Task: Build the Spaces Tab

> **Assignee**: (any developer)
> **Status**: 🔧 Router contract **protected** · Screens are **placeholders** (route files must stay).

## Goal

Turn the **Spaces** tab into a **Stack navigator** with three screens:

1. **Project list** — `index` — all projects from `mockProjects`
2. **Project detail / board** — `project` — one project's Kanban `Board`
3. **Card detail** — `card` — full card view (priority, status, assignees, publisher, comments)

This feature was implemented once and then **intentionally removed** (the router was kept). Rebuild the screens below; **do not touch the routing contract**.

---

## 🛡️ Protected router contract (DO NOT CHANGE)

- **`apps/mobile/app/(tabs)/spaces/_layout.tsx`** — keep the file and Stack registration exactly as-is:

  ```tsx
  <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="project" options={{ headerShown: false }} />
    <Stack.Screen name="card" options={{ headerShown: false }} />
  </Stack>
  ```

- **The three route files must keep existing** (placeholders are provided). An empty `spaces/` directory crashes expo-router (`Layout does not contain any child routes`).
- **External navigation already points at these routes** (the Home screen `MY WORK` / `YOUR PROJECTS` sections). Keep these hrefs resolving:

  ```ts
  router.push({ pathname: '/(tabs)/spaces/project', params: { projectId } });
  router.push({ pathname: '/(tabs)/spaces/card', params: { cardId } });
  ```

- Use `useLocalSearchParams()` to read `projectId` / `cardId`, and `router.back()` for back buttons.

---

## Files to implement

| Path | Screen | Query params |
| :--- | :--- | :--- |
| `apps/mobile/app/(tabs)/spaces/index.tsx` | Project list | — |
| `apps/mobile/app/(tabs)/spaces/project.tsx` | Project board | `projectId` |
| `apps/mobile/app/(tabs)/spaces/card.tsx` | Card detail | `cardId` |

---

## Reusable components

**Import note**: the shared barrel (`src/components/shared`) exports only the board set. The domain components below are **not** in the barrel — import them by direct path, e.g.:

```ts
import { ProjectCard } from '../../../src/components/shared/project-card';
import { PriorityBadge } from '../../../src/components/shared/priority-badge';
```

| Component | Folder | Used by |
| :--- | :--- | :--- |
| `ProjectCard` | `shared/project-card` | list rows |
| `ProjectHeader` | `shared/project-header` | board header (via `Board.renderHeader`) |
| `Board` | `shared/board` | the Kanban |
| `PriorityBadge`, `StatusBar` | `shared/priority-badge`, `shared/status-bar` | card meta |
| `PublisherInfo` | `shared/publisher-info` | "Created by …" |
| `CommentSection` | `shared/comment-section` | comments |
| `AvatarGroup`, `Badge`, `Text`, `Divider`, `Button`, `Pressable` | `base/*` | primitives |

Also available: `CardDetail`, `CardMoveMenu`, `AssigneeSelect`, `ActivityLog`, `EmptyState`, `UserBadge`, `UserChip`, `CreateCardInline`.

---

## Mock data (from `@jira-clone/shared`)

`mockProjects` (3), `mockColumns`, `mockCards`, `mockUsers`, `mockCurrentUser`, `mockComments`, `mockActivityLogs`.

> Only `proj-1` (FIELD) has board columns + cards. Other projects should render the `Board` empty state gracefully.

---

## Reference behavior (what the previous implementation did — match this)

- **index**: `ProjectCard` per project, issue-count pills derived from column **titles** (To Do / In Progress+In Review / Done). Tap → push `project`.
- **project**: back row (`router.back()`), `ProjectHeader` injected via `Board.renderHeader` (do **not** also pass `boardTitle`/`projectKey` — that double-renders a header), `Board` filtered to the project's columns/cards. Card tap → push `card`.
- **card**: back row; mono key badge + title + description; **details card** (Priority → `PriorityBadge`, Status → `StatusBar`, Assignees → `AvatarGroup`); `PublisherInfo` with `createdAt`; live `CommentSection` (add/delete via local state seeded from `mockComments`).

---

## Acceptance criteria

- [ ] Spaces tab opens to the project list.
- [ ] Tapping a project opens its board; tapping a card opens details + comments.
- [ ] Home screen `MY WORK` / `YOUR PROJECTS` links navigate into the stack.
- [ ] Back buttons return through the stack without polluting the tab bar.
- [ ] `npx tsc --noEmit -p apps/mobile/tsconfig.json` passes.
- [ ] All colors come from `useTheme()`; static `StyleSheet` is layout-only (repo rule).
- [ ] `_layout.tsx`, `(tabs)/_layout.tsx`, and the `/(tabs)/spaces/...` hrefs are untouched.

## Out of scope

- Real backend / auth slice, photo-upload persistence, live multi-user sync.