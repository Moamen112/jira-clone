import { apiClient } from '../lib/apiClient';
import { API_ENDPOINTS } from '../lib/endpoints';
import { setAuthTokens, clearAuthTokens, getAuthTokens, type AuthTokens } from '../lib/authTokens';
import type {
  RegisterPayload,
  RegisterResponse,
  LoginPayload,
  LoginResponse,
  VerifyTotpPayload,
  VerifyTotpResponse,
  UserProfile,
} from '../types/auth';

/**
 * Service handling all backend authentication requests and token persistence.
 */
export const authService = {
  /**
   * Step 1 (Sign Up): Register a new user account.
   */
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, payload);
    return response.data;
  },

  /**
   * Step 2 (Sign In - Password): Initiates login with credentials.
   * Returns a pending_token and either:
   * - totp_setup_required (with secret & otpauth_uri for first-time 2FA setup)
   * - otp_required (prompts for 6-digit code)
   */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, payload);
    return response.data;
  },

  /**
   * Step 3 (Sign In - Verify 2FA): Exchanges pending_token and 6-digit code for JWT tokens,
   * saves them into memory, and retrieves the authenticated user's profile.
   */
  async verifyTOTP(
    payload: VerifyTotpPayload
  ): Promise<{ tokens: AuthTokens; user: UserProfile }> {
    const response = await apiClient.post<VerifyTotpResponse>(
      API_ENDPOINTS.AUTH.LOGIN_VERIFY,
      payload
    );

    const tokens: AuthTokens = {
      accessToken: response.data.access,
      refreshToken: response.data.refresh,
    };

    setAuthTokens(tokens);

    // Fetch the user's profile with the new access token
    const user = await this.getCurrentUser();

    return { tokens, user };
  },

  /**
   * Fetches the current logged-in user profile from /api/users/me/.
   */
  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>(API_ENDPOINTS.USERS.ME);
    return response.data;
  },

  /**
   * Step 4 (Sign Out): Revokes the refresh token on the backend and clears stored tokens.
   */
  async logout(): Promise<void> {
    const tokens = getAuthTokens();
    try {
      if (tokens?.refreshToken) {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {
          refresh: tokens.refreshToken,
        });
      }
    } finally {
      clearAuthTokens();
    }
  },
};
