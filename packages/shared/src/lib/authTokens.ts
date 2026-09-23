export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

let tokens: AuthTokens | null = null;

export function getAuthTokens(): AuthTokens | null {
  return tokens;
}

export function setAuthTokens(nextTokens: AuthTokens): void {
  tokens = nextTokens;
}

export function clearAuthTokens(): void {
  tokens = null;
}
