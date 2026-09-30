# Shared Spaces and projects: function reference

This guide documents the frontend Spaces/project flow in `packages/shared/src`. It reflects the current code after the project-state simplification. See [spaces-web.md](spaces-web.md) and [spaces-mobile.md](spaces-mobile.md) for each app. No backend code is involved.

## Data flow

```text
Spaces list → useProjects(options) → Redux project slice → app UI
Space detail → useSpaceDetail(id) → projectService.getProject(id)
             → backendProjectToSpaceItem → useTasks(filters) → app board
```

Both apps mount `projectReducer` under the `project` key in their Redux stores. `useProjects` reads that slice through `useSelector`. The old extra module-level project snapshot and its custom subscriptions have been removed; a successful request now updates one state store. The project reducer also clears its list when the shared auth `logoutAction` occurs, so a previous user's spaces do not remain on screen after logout.

## API service: `projectService.ts`

Every method uses the shared Axios `apiClient`, so it receives the configured base URL and auth token behavior. The service returns response data but does not itself update Redux or navigate.

| Function | Input | Request and result |
| --- | --- | --- |
| `getProjects(params?)` | Optional `ProjectListParams` (`search`, `name`, `status`, `owner`, `ordering`, `page`, `page_size`) | GET `/api/projects/`; returns `{ count, next, previous, results }` with backend projects. |
| `getProject(projectId)` | Numeric or string ID | GET `/api/projects/{id}/`; returns one backend project. The shared detail hook calls it when the detail route opens or Retry is pressed. |
| `createProject(payload)` | `name`, `key`, optional `description` and member IDs | POST `/api/projects/`; returns the created backend project. The authenticated user is the owner according to the API contract. |
| `updateProject(projectId, payload)` | ID and optional `name`, `description`, `status` | PATCH `/api/projects/{id}/`; returns the updated project. |
| `deleteProject(projectId)` | ID | DELETE `/api/projects/{id}/`; returns `void`. |

## UI hook: `useProjects.ts`

`useProjects(options = {})` is the public shared interface for both apps. Its optional inputs are `search`, `name`, `status`, `owner`, `ordering`, `page` (default `1`), `pageSize` (default `36`), and `autoFetch` (default `true`). It returns:

- `projects`: raw `BackendProject[]` from the current list response.
- `spaces`: `SpaceItem[]` built from those projects, including display members and issue counts.
- `plainProjects`: simpler `Project[]` for components that expect the UI project model.
- `totalCount`, `isLoading`, `error`: Redux project-list status.
- The request and mutation methods below.

| Hook function | Exact behavior |
| --- | --- |
| `fetchProjects(overrideParams?)` | Sets loading and clears the previous error. It combines the hook's filters/page with any supplied overrides, removes `undefined` and empty-string values, calls `getProjects`, then stores `results` and `count`. It returns the paginated response. On failure it formats the API error, saves it, and throws an `Error`. |
| `refetch()` | Calls `fetchProjects()` using the hook's current options. List screens use it for Retry and pull-to-refresh. |
| `createProject(payload)` | Sets loading, calls the service, prepends the returned project to Redux, increments `totalCount`, and returns it. Failure saves and throws a formatted error. |
| `updateProject(id, payload)` | PATCHes through the service, replaces the matching project in Redux, and returns the server result. Failure saves and throws a formatted error. |
| `deleteProject(id)` | DELETEs through the service, removes the ID from Redux, and lowers `totalCount` without going below zero. Failure saves and throws a formatted error. |
| Automatic fetch effect | Calls `fetchProjects()` when `autoFetch` is true and the hook's filter-dependent callback changes. It catches the Promise because the error is already stored in Redux. |

The hook derives `spaces` and `plainProjects` with `useMemo` when the Redux `projects` array changes. It does not keep a second in-memory project store. All hook users in a given app observe the same Redux project list.

## Detail hook: `useSpaceDetail.ts`

`useSpaceDetail(id?)` is used by both the web `/spaces/:id` page and the mobile Spaces project screen. It reuses the current Redux list with `useProjects({ autoFetch: false })` and requests the full project with `projectService.getProject(id)`. A matching list item can appear immediately while the detail request runs. When the detail response succeeds, `backendProjectToSpaceItem` supplies the project, members, and counts. There is no mock project fallback. A changed route ID cannot show an earlier route's detail response, and the request cleanup ignores responses after the route changes.

| Value or function | Behavior |
| --- | --- |
| `space`, `project` | Resolved API space and nested project, or `null` until a list match or detail response is available. |
| `boardUsers`, `currentUserId` | Converts API project members to board users; if there are no members, uses the authenticated user. |
| `projectLoading`, `projectError` | Loading and formatted detail request error, separate from task loading/error. Both apps show these states. |
| `retryProject()` | Repeats the project detail GET for the current route. |
| `boardSearch`, `setBoardSearch` | Search text; `useDebounce` waits 300 ms before it reaches the task request. |
| `assignedToMeFilter`, `setAssignedToMeFilter` | Sends `mine=true` when selected. |
| `createdByMeFilter`, `setCreatedByMeFilter` | Controls the board's local created-by-me filter. |
| `selectedTypeFilter`, `setSelectedTypeFilter` | Sends a positive numeric task type ID; `all` removes the type filter. |
| `filterableTypeOptions` | API task types with numeric IDs for the board filter in both apps; local display defaults are not offered as server filters. |
| `selectedUserIdsFilter`, `toggleUserIdFilter(id)` | Toggles assignees. A single numeric ID becomes the `assignee` query; selecting `unassigned` sends `unassigned=true`. |
| `clearBoardFilters()` | Resets search, mine, creator, type, and selected user filters. Filters also reset when the route ID changes. |
| Task fields and methods from `useTasks` | Returns API backed `cards`, `columns`, `cardTypeOptions`, loading/error, retry, and task mutations for the resolved project. |

The hook does not navigate, show alerts, or render components. Web and mobile handle those presentation details while using the same project lookup, task filters, and data conversions.

## Redux project slice: `projectStore.ts`

`ProjectState` has `projects`, `totalCount`, `isLoading`, and `error`. `initialProjectState` is an empty list, zero count, `false` loading, and no error. `selectProjectState(root)` selects `root.project`; `projectReducer` is mounted by both apps; `projectActions` groups these reducers:

| Action | State change |
| --- | --- |
| `setProjects({ results, count? })` | Replaces the list and count (`results.length` when count is absent), then clears loading and error. |
| `addProject(project)` | Prepends a created project, increments count, clears loading/error. |
| `updateProject(project)` | Replaces the item with the same ID if present, then clears loading/error. |
| `removeProject(id)` | Filters out the numeric ID, decreases count to a minimum of zero, clears loading/error. |
| `setLoading(value)` | Changes loading; starting a request also clears the previous error. |
| `setError(message)` | Saves the error and stops loading. |
| `resetProjectState()` | Returns the empty initial state. |
| `logoutAction` from auth | The slice's `extraReducers` reset project state automatically on logout. |

These reducers contain no API calls or custom listener notifications. A component calls a hook method; the hook handles the request and dispatches an action when it succeeds or fails.

## Types and conversion helpers

`types/project.ts` defines the backend project, member, list response, filters, create/update payloads, and UI `Project` model. `types/space.ts` defines `SpaceItem` and `SpaceMember`. `SpaceMember.email` is optional for local/mock data and is populated when converting real API members. The type-only task imports in `project.ts` make the shared package typecheck correctly.

| Helper in `utils/spaces.ts` | What it does |
| --- | --- |
| `getInitials(name)` | Returns uppercase initials from a display name/email; empty input becomes `U`. |
| `backendProjectToProject(project)` | Converts numeric IDs and snake-case API fields to the simpler UI `Project` shape. |
| `backendProjectToSpaceItem(project)` | Wraps the converted project with API members (or owner fallback), member email/avatar, open/done issue counts, and `software` category. The API exposes total/open counts, so this helper cannot split open work into To Do versus In Progress; it places open count in `todo` and zero in `inProgress`. |
| `mapSortToOrdering(sortBy)` | Maps UI sort choices to API ordering (`name`, `-name`, `-task_count`, or default `-updated_at`). |
| `createSpace(input)` | Builds a local sample `SpaceItem` with a generated ID and mock owner. It does **not** persist a project; real creation uses `useProjects().createProject()`. |
| `matchesProjectSearch(project, query)` | Case-insensitive match on name, key, or description; blank query matches all. |
| `filterProjects(projects, query)` | Returns projects matching the search helper. |
| `filterSpaces(spaces, query)` | Filters `SpaceItem[]` by the nested project's searchable fields. |
| `compareProjects(a, b, sortBy)` | Compares name ascending/descending, or newest `updatedAt` first by default. |
| `compareSpaces(a, b, sortBy)` | Compares summed issue counts for `issues`; otherwise delegates to project comparison. |
| `sortProjects(projects, sortBy)` | Returns a sorted copy of the input projects. |
| `sortSpaces(spaces, sortBy)` | Returns a sorted copy of the input spaces. |

The list hook stores backend projects and converts them for rendering. The detail hook fetches the full project directly, even when the list contains it, so both apps receive the same member and count data.

## Current limits to know

- One Redux project list is shared by all `useProjects` calls in an app. If several mounted components fetch different filters at the same time, the last response to finish replaces that list. The simplification removes duplicate state but does not introduce per-query caching.
- `createProject` prepends its result to the current list even when active filters would not match it. A fresh `refetch()` applies the current server filters.
- Local sample helpers and mock data remain available for demo UI, but both Space detail pages now use API data and show loading/error/not-found states without mock fallbacks.
