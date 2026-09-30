# Spaces on the web app

This guide shows how `apps/web` uses the shared Spaces/project code. The function-by-function reference is [spaces-shared.md](spaces-shared.md); the phone flow is [spaces-mobile.md](spaces-mobile.md).

## Page and state wiring

`apps/web/src/store/index.ts` mounts the shared `projectReducer` as `project` under the Redux `Provider` in `apps/web/src/App.tsx`. `useProjects()` reads that slice. Web-specific React components and CSS remain in `apps/web/src`.

| Web location | Shared functionality used | Purpose |
| --- | --- | --- |
| `features/spaces/SpacesPage.tsx` | `useProjects`, `useDebounce`, `mapSortToOrdering` | Paginated list, search, status filter, sorting, retry, and create space. |
| `features/spaces/SpaceDetailPage.tsx` | `useSpaceDetail` | Displays the shared project and task board state, with web card modal and navigation. |
| `layouts/ProtectedLayout.tsx` | `useProjects().plainProjects` | Populates project navigation in the side panel. |
| `features/home/HomePage.tsx` | `useProjects().spaces` and `.plainProjects` | Project count and recommended space cards. |

## List page flow

1. The search box updates local text. `useDebounce(searchQuery, 300)` waits before the query reaches `useProjects`.
2. Status, sort, and page are local page state. `mapSortToOrdering(selectedSort)` turns the sort choice into an API query value. Changing search/status/sort resets the page to 1.
3. `useProjects({ search, status, ordering, page, pageSize: 36 })` automatically GETs `/api/projects/` when these values change. The hook stores the API's `results` and `count` in Redux and converts results to `SpaceItem[]`.
4. `SpacesPage` renders loading skeletons, a filtered empty state, or the returned spaces. It uses `totalCount` for pagination. Retry calls `refetch()`.
5. The **Create space** button opens `CreateSpaceModal`. The modal validates name/key locally and collects member choices. The page converts member string IDs to numeric IDs and calls `createProject({ name, key, description, members })`. The shared hook POSTs the project and updates Redux; the modal closes after the Promise succeeds.

The web Clear filters button now uses the supported `ghost` button variant. `SpaceDetailPage` also has no unused task-loading or board-column declarations in its Space code.

## Detail page flow

The route `/spaces/:id` opens `SpaceDetailPage`. It first tries the `spaces` array from `useProjects` by project ID or key. If that list does not contain the project, it calls `projectService.getProject(id)` and builds a display object from that response. The board itself is driven by `useTasks({ projectId, projectKey, ...filters })`; task/card behavior is separate from the project list state.

`useSpaceDetail` replaces the page's separate project lookup, backend mapping, member conversion, filter state, and `useTasks` call. It requests the full project for the route ID and can display a matching list item while that request runs. The page now shows loading, retry, or not-found when there is no real project; it does not render mock spaces. Project and task request errors show retry controls. The selected card and create dialog reset when the route ID changes.

The board still supports search, assigned-to-me, created-by-me, task type, and assignee filters. Their task query values now come from the same hook as mobile. Card creation, editing, deletion, comments, and task type creation remain in the web modal; their API actions continue to use the task methods returned by the shared hook.

Home's Recommended spaces section now links only to API projects. It shows an empty message when there are none, so it does not send users to a demo ID that the detail page cannot load.

## What changed for web

- `useProjects` now uses the Redux project slice directly. Pages and side navigation see the same state without a second project snapshot.
- Create/update/delete/list operations still return the same values and report errors through the same hook fields.
- Logging out dispatches the shared auth action, which clears the project list.
- Shared `SpaceMember` now includes optional email, matching the members that the web detail page reads.

The shared list is still one list for every mounted `useProjects` caller. A filtered page and an unfiltered navigation fetch can replace each other's results if their requests overlap; there is no per-query cache yet.
