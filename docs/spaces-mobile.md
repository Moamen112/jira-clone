# Spaces on the mobile app

This guide shows how Expo screens in `apps/mobile` use the shared Spaces/project code. See [spaces-shared.md](spaces-shared.md) for every shared function and [spaces-web.md](spaces-web.md) for the browser flow.

## Screen and state wiring

`apps/mobile/src/store/index.ts` mounts the shared `projectReducer` under the root Redux `Provider` in `apps/mobile/app/_layout.tsx`. The shared API client uses the mobile base URL configured at startup; during local Expo development, `/api/` is proxied to the local API by `metro.config.js`.

| Mobile location | Shared functionality used | Purpose |
| --- | --- | --- |
| `app/(tabs)/spaces/index.tsx` | `useProjects`, `useDebounce`, `filterSpaces`, `sortSpaces` | Spaces list, search, status filter, recent visits, refresh, and error/empty states. |
| `app/(tabs)/spaces/project.tsx` | `useSpaceDetail` | Displays the shared project and task board state, with mobile navigation and creation dialog. |
| `app/(tabs)/spaces/card.tsx` | `useProjects`, task services | Uses project context while showing/editing a card. |
| `app/(tabs)/index.tsx` | `useProjects().plainProjects` | Home project shortcuts and counts. |

## Spaces list flow

1. The search field is delayed with `useDebounce(searchQuery, 300)`. Search and status are sent to `useProjects`, which automatically requests `/api/projects/`.
2. The list screen uses the hook's `spaces` output. Each `SpaceItem` already contains the display project, its API members (or owner fallback), and issue counts. `ProjectCard` receives those fields directly. The old mobile-only member and count calculations were removed.
3. `filterSpaces` applies the visible search text locally, and the status filter is applied locally as well. `sortSpaces(..., 'updated')` gives the newest updated spaces first. The API also receives search/status, so the local filters are a display guard over the returned page.
4. Recent spaces are local IDs from spaces opened during this session. Opening a space moves its ID to the front. This is screen memory, not a persisted recent-history API.
5. Pull-to-refresh and Retry call the same shared `refetch()`. Request errors are shown with a retry action. An empty successful response now shows **No spaces yet** or **No spaces found** rather than inserting demo projects. Loading an empty list displays **Loading spaces...**.

The mobile list no longer treats a successful empty API response as a reason to display mock projects. The screen still uses `useProjects` under the same Redux state as web.

## Project board and card detail

Opening a space card navigates to the project route with its ID. `useSpaceDetail(id)` uses a matching Redux list item while it requests the full project, converts the response and members, and passes the resolved ID/key and filters to `useTasks`. The mobile page shows project loading, retry, or not-found without demo data. Project and task request errors are visible with retry controls. The board still supports pull-to-refresh.

Search, assigned-to-me, created-by-me, assignee, unassigned, and task type filters use the same shared state and task query logic as web. The mobile page keeps its platform-specific back button, quick move menu, and create dialog. The create dialog stays open and displays an error if the API rejects creation; it closes only after a successful task creation.

`card.tsx` loads the selected numeric task ID through `taskService.getTask`, plus comments and activity. It shows loading, retry, or not-found states when the task is unavailable. Save, delete, and comment actions require real task IDs and only update the screen after the API succeeds. The mobile Home screen also displays API tasks, projects, and activity without demo fallbacks, so an empty account stays empty and a task request failure is visible.

`types/space.ts` now allows an optional member email, and `backendProjectToSpaceItem` supplies that email from the API. This matches the member information the mobile board/card screens read.

## Creation and other current limits

The shared `useProjects` API includes `createProject`, `updateProject`, and `deleteProject`, and the web Spaces page wires creation. The mobile codebase has a `CreateProjectModal` component, but the current Spaces list does not mount it or call `createProject`; this refactor did not add a mobile creation control. The mobile list and detail views do use the same shared project fetching and state logic as web.

All `useProjects` callers in the mobile app observe one Redux project list. Concurrent requests with different filters can replace each other's list results; there is no query-specific cache yet. Logout clears that list automatically.
