# Axios client

The shared package contains a small Axios setup for the web and mobile apps.

## Create the client

Create one instance in each app and pass its API base URL:

```ts
import { createApiClient } from '@jira-clone/shared';

export const apiClient = createApiClient('https://api.example.com');
```

Use this instance for API calls:

```ts
const response = await apiClient.get('/projects');
```

## Save tokens after login

```ts
import { setAuthTokens } from '@jira-clone/shared';

setAuthTokens({
  accessToken: response.data.accessToken,
  refreshToken: response.data.refreshToken,
});
```

The request interceptor adds the access token to the `Authorization` header.
If a request returns `401`, the response interceptor sends the refresh token to
`/auth/refresh`, saves the returned tokens, and retries the request once.

Clear both tokens when the user logs out:

```ts
import { clearAuthTokens } from '@jira-clone/shared';

clearAuthTokens();
```

Tokens are kept in memory for now. This keeps the study project simple and
avoids tying the shared package to browser or mobile storage. Persistence can be
added in the app later if it becomes necessary.

## Endpoints

All endpoint paths live in `packages/shared/src/lib/endpoints.ts`. Add new paths
to `API_ENDPOINTS` as the backend grows.
