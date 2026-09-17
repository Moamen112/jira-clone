# Axios authentication client guide

This project provides a shared Axios client factory for the web and mobile
applications. The factory configures authentication consistently while leaving
platform-specific details—API URLs, navigation, and secure storage—in each app.

The implementation lives in:

- `packages/shared/src/lib/apiClient.ts` — creates the Axios instances.
- `packages/shared/src/lib/interceptors.ts` — attaches tokens, refreshes sessions,
  and retries requests.
- `packages/shared/src/lib/tokenManager.ts` — owns in-memory tokens and optional
  persistence.
- `packages/shared/src/lib/types.ts` — public configuration and request types.
- `packages/shared/src/services/storageService.ts` — shared token storage keys.

## Why the client is a factory

The shared package intentionally does not export a preconfigured global client.
Web and mobile have different environment variables, navigation behavior, and
storage requirements. Creating the client in each application makes those
dependencies explicit and avoids initializing a singleton before storage or
runtime configuration is available.

Create one client and one `TokenManager` per application runtime, then import
those same instances wherever API access is needed.

## Web setup

Create an application-level module such as `apps/web/src/lib/apiClient.ts`:

```ts
import { createApiClient, TokenManager } from '@jira-clone/shared';

// Keep the access token in memory. The refresh token should be an HttpOnly
// cookie set by the backend, not a value stored in localStorage.
export const tokenManager = new TokenManager();

export const apiClient = createApiClient(
  {
    baseURL: import.meta.env.VITE_API_URL,
    onAuthFailure: () => {
      window.location.assign('/auth/sign-in');
    },
  },
  tokenManager
);
```

The backend should set the refresh cookie with appropriate `HttpOnly`, `Secure`,
and `SameSite` attributes. `withCredentials` defaults to `true`, allowing the
browser to include that cookie in the refresh request. Cross-origin deployments
also need matching credential and origin configuration on the backend.

On a page reload, the access token is initially absent. The first protected
request may receive a 401, after which the client uses the refresh cookie to get
a new access token and retries the original request automatically.

## Mobile setup

Mobile applications do not have browser HttpOnly cookies in the same form.
Persist mobile refresh tokens in an encrypted store such as Expo SecureStore,
not ordinary AsyncStorage.

After adding `expo-secure-store` to the mobile application, an adapter can look
like this:

```ts
import * as SecureStore from 'expo-secure-store';
import {
  createApiClient,
  TokenManager,
  type TokenStorageAdapter,
} from '@jira-clone/shared';

const secureStorageAdapter: TokenStorageAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

export const tokenManager = new TokenManager(secureStorageAdapter);

export const apiClient = createApiClient(
  {
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    withCredentials: false,
    onAuthFailure: () => {
      // Reset auth state and navigate to the mobile login screen here.
    },
  },
  tokenManager
);
```

The request interceptor waits for the first secure-storage read before sending
a request. That prevents the application from making an unauthenticated request
while persisted tokens are still loading.

## Login

Login and registration endpoints should not receive an old access token and
should not trigger the refresh interceptor if their credentials are rejected:

```ts
interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
}

const response = await apiClient.post<LoginResponse>(
  '/auth/sign-in',
  { email, password },
  {
    skipAuth: true,
    skipAuthRefresh: true,
  }
);

await tokenManager.setTokens({
  accessToken: response.data.accessToken,
  refreshToken: response.data.refreshToken,
});
```

On web, omit `refreshToken` if it is stored only in an HttpOnly cookie. On
mobile, save the returned refresh token through the secure storage adapter.

Always await `setTokens` when practical. Memory is updated immediately, but
awaiting ensures persistence has completed before navigation or app shutdown.

## Logout

Tell the backend to revoke the session, then clear local state even if that
request fails:

```ts
try {
  await apiClient.post('/auth/logout', undefined, {
    // Do not try to refresh a session that is intentionally being destroyed.
    skipAuthRefresh: true,
  });
} finally {
  await tokenManager.clearTokens();
}
```

The request still carries the current access token because `skipAuth` is not
set. `clearTokens` removes both tokens from memory and configured storage.

## Normal API requests

Use the configured instance instead of importing the global `axios` object:

```ts
import { apiClient } from './apiClient';

const response = await apiClient.get<Project[]>('/projects');
return response.data;
```

The request interceptor reads the latest access token immediately before the
request is sent and adds:

```text
Authorization: Bearer <access-token>
```

If a request already supplies an `Authorization` header, the interceptor
preserves it.

## Per-request options

Three custom Axios options are available:

```ts
await apiClient.get('/public-content', {
  skipAuth: true,
  skipAuthRefresh: true,
});
```

- `skipAuth: true` prevents the access-token header from being attached.
- `skipAuthRefresh: true` returns a 401 directly without refreshing.
- `_authRetry` is internal. The interceptor uses it to prevent retry loops; app
  code should not set it.

`skipAuth` and `skipAuthRefresh` are intentionally separate. A public endpoint
might accept an optional authenticated user, while login should normally use
both flags.

## Default refresh contract

Unless configured otherwise, the client makes this request:

```http
POST <baseURL>/auth/refresh
```

- If `TokenManager` contains a refresh token, the body is
  `{ "refreshToken": "..." }`.
- If it does not, the body is empty and the backend can use the HttpOnly cookie.
- Cookies are included when `withCredentials` is `true`.

The default response parser expects:

```json
{
  "accessToken": "new-access-token",
  "refreshToken": "optional-rotated-refresh-token"
}
```

When a rotated refresh token is omitted, the manager retains the existing one.
When it is explicitly `null`, the persisted refresh token is removed.

## Custom refresh contracts

Use `refreshTokens` when the backend has another route, body, or response shape.
The callback must use a bare Axios instance or `fetch`; it must not call the
authenticated `apiClient`, which would re-enter its own interceptor.

```ts
import axios from 'axios';
import { createApiClient, TokenManager } from '@jira-clone/shared';

const tokenManager = new TokenManager();
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const apiClient = createApiClient(
  {
    baseURL: import.meta.env.VITE_API_URL,
    refreshTokens: async (refreshToken) => {
      const response = await refreshClient.post('/sessions/renew', {
        refresh_token: refreshToken,
      });

      return {
        accessToken: response.data.data.access_token,
        refreshToken: response.data.data.refresh_token,
      };
    },
  },
  tokenManager
);
```

Set `refreshEndpoint: false` to disable automatic refresh completely. A custom
`refreshTokens` callback still enables refresh even when the default endpoint is
disabled.

## Refresh and retry behavior

The response interceptor handles the following sequence:

1. A protected request receives a 401.
2. The original request is marked as retried before asynchronous work begins.
3. The client starts one refresh request.
4. Other requests receiving 401 during that refresh await the same promise.
5. The new tokens are stored.
6. Each original request is replayed once with the new access token.
7. A second 401 from a replayed request is returned to the caller.

There are two additional race protections:

- A late 401 created with an older access token uses the already-refreshed token
  instead of starting another refresh.
- Each auth mutation advances a revision number. If logout or a new login occurs
  while refresh is running, the old refresh result is discarded and cannot
  restore or clear the newer session.

Storage writes are serialized as well, so a slow token removal cannot finish
after a newer login write and erase the new persisted session.

## Refresh failure behavior

By default, refresh failures are divided into two categories:

- HTTP 400, 401, or 403 is treated as a terminal authentication failure. Tokens
  are cleared and `onAuthFailure` is called once.
- Network errors, timeouts, and 5xx responses are treated as temporary. The
  current session is kept so a future request can try again.

Override this policy if the backend uses different status codes:

```ts
import axios from 'axios';

const apiClient = createApiClient(
  {
    baseURL: import.meta.env.VITE_API_URL,
    shouldInvalidateSession: (error) => {
      return axios.isAxiosError(error) && error.response?.status === 419;
    },
    onAuthFailure: () => {
      window.location.assign('/auth/sign-in');
    },
  },
  tokenManager
);
```

Non-Axios errors, such as an invalid custom refresh response, are terminal by
default because they normally indicate a contract or parsing failure.

## Request defaults

Each created client uses these defaults:

- `timeout`: 15 seconds.
- `withCredentials`: `true`.
- `Accept`: `application/json`.
- `refreshEndpoint`: `/auth/refresh`.

The client does not globally force `Content-Type: application/json`. Axios sets
the correct header for JSON requests, while uploads remain free to generate the
required `multipart/form-data` boundary.

## Security guidance

- Web refresh tokens should live in HttpOnly cookies, not localStorage.
- Mobile refresh tokens should use encrypted storage such as SecureStore or the
  platform keychain, not plain AsyncStorage.
- Keep access tokens short-lived.
- Rotate refresh tokens when possible and revoke them on logout.
- Use HTTPS in production.
- Configure CORS narrowly when `withCredentials` is enabled; wildcard origins
  cannot be used with credentialed browser requests.
- Do not log tokens, request headers, or refresh payloads.

## Common mistakes to avoid

- Do not create a new client for every request; create it once per app runtime.
- Do not import global `axios` in feature services after configuring `apiClient`.
- Do not implement refresh logic separately in every service or React hook.
- Do not retry a request manually when the interceptor already handles its 401.
- Do not use the authenticated client inside a custom refresh callback.
- Do not redirect to login for temporary network or server failures.
- Do not store browser refresh tokens in JavaScript-readable storage.

## Verification performed

The implementation has been checked with:

- Shared-package TypeScript compilation.
- Mobile TypeScript compilation.
- Linting of the networking and storage modules.
- The web production build.
- Git whitespace validation.

The current web build reports only its existing bundle-size advisory; it is not
caused by the authentication client.
