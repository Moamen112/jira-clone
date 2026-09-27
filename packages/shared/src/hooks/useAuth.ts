import { useCallback, useSyncExternalStore } from 'react';
import {
  getAuthState,
  subscribeAuthState,
  setInternalAuthState,
  initialAuthState,
} from '../store/authSlice';
import { authService } from '../services/authService';
import type {
  RegisterPayload,
  RegisterResponse,
  LoginPayload,
  LoginResponse,
  UserProfile,
} from '../types/auth';

/**
 * Formats API errors from Django REST framework into user-friendly strings.
 */
function parseErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (data) {
      if (typeof data === 'string') return data;
      if (typeof data === 'object') {
        const obj = data as Record<string, unknown>;
        if (typeof obj.detail === 'string') return obj.detail;

        // Collect field validation errors
        const messages: string[] = [];
        for (const [key, value] of Object.entries(obj)) {
          if (Array.isArray(value)) {
            messages.push(`${key}: ${value.join(' ')}`);
          } else if (typeof value === 'string') {
            messages.push(`${key}: ${value}`);
          }
        }
        if (messages.length > 0) {
          return messages.join('; ');
        }
      }
    }
  }
  return err instanceof Error ? err.message : 'An error occurred during authentication';
}

/**
 * Universal Authentication Hook.
 * Works seamlessly in both Web and Mobile apps with full 2FA lifecycle management.
 */
export function useAuth() {
  const state = useSyncExternalStore(subscribeAuthState, getAuthState, getAuthState);

  const is2FARequired = Boolean(state.pending2FA);
  const is2FASetupRequired = state.pending2FA?.status === 'totp_setup_required';
  const totpSetupData =
    state.pending2FA?.status === 'totp_setup_required'
      ? {
          secret: state.pending2FA.secret ?? '',
          otpauthUri: state.pending2FA.otpauthUri ?? '',
        }
      : null;

  /**
   * Clear any existing auth error message.
   */
  const clearError = useCallback(() => {
    setInternalAuthState({ error: null });
  }, []);

  /**
   * Step 1: Sign up. Automatically triggers login to begin 2FA setup if autoSignIn is true.
   */
  const signUp = useCallback(
    async (payload: RegisterPayload, autoSignIn = true): Promise<RegisterResponse> => {
      setInternalAuthState({ isLoading: true, error: null });
      try {
        const response = await authService.register(payload);
        if (autoSignIn) {
          // Immediately initiate sign-in to start mandatory first-time 2FA setup
          await signIn({ email: payload.email, password: payload.password });
        } else {
          setInternalAuthState({ isLoading: false });
        }
        return response;
      } catch (err) {
        const message = parseErrorMessage(err);
        setInternalAuthState({ error: message, isLoading: false });
        throw err;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /**
   * Step 2: Sign in with email and password.
   * On success, transitions state to 2FA challenge (setup or code entry).
   */
  const signIn = useCallback(async (payload: LoginPayload): Promise<LoginResponse> => {
    setInternalAuthState({ isLoading: true, error: null });
    try {
      const response = await authService.login(payload);

      if (response.status === 'totp_setup_required') {
        setInternalAuthState({
          isLoading: false,
          error: null,
          pending2FA: {
            pendingToken: response.pending_token,
            status: 'totp_setup_required',
            secret: response.secret,
            otpauthUri: response.otpauth_uri,
          },
        });
      } else {
        setInternalAuthState({
          isLoading: false,
          error: null,
          pending2FA: {
            pendingToken: response.pending_token,
            status: 'otp_required',
          },
        });
      }

      return response;
    } catch (err) {
      const message = parseErrorMessage(err);
      setInternalAuthState({ error: message, isLoading: false });
      throw err;
    }
  }, []);

  /**
   * Step 3: Verify 6-digit TOTP code.
   * Exchanges pending_token and code for JWT tokens and fetches user profile.
   */
  const verify2FA = useCallback(
    async (code: string): Promise<UserProfile> => {
      if (!state.pending2FA?.pendingToken) {
        const msg = 'No pending authentication session found. Please sign in again.';
        setInternalAuthState({ error: msg });
        throw new Error(msg);
      }

      setInternalAuthState({ isLoading: true, error: null });
      try {
        const { user } = await authService.verifyTOTP({
          pending_token: state.pending2FA.pendingToken,
          code: code.trim(),
        });

        setInternalAuthState({
          user,
          isAuthenticated: true,
          pending2FA: null,
          isLoading: false,
          error: null,
        });

        return user;
      } catch (err) {
        const message = parseErrorMessage(err);
        setInternalAuthState({ error: message, isLoading: false });
        throw err;
      }
    },
    [state.pending2FA]
  );

  /**
   * Step 4: Sign out. Revokes refresh token and clears credentials.
   */
  const signOut = useCallback(async (): Promise<void> => {
    setInternalAuthState({ isLoading: true });
    try {
      await authService.logout();
    } catch {
      // Ignore logout backend errors to guarantee local state gets cleared
    } finally {
      setInternalAuthState({ ...initialAuthState });
    }
  }, []);

  /**
   * Cancel an in-progress 2FA flow and return to clean sign-in state.
   */
  const cancel2FA = useCallback(() => {
    setInternalAuthState({ pending2FA: null, error: null, isLoading: false });
  }, []);

  /**
   * Refresh current user profile.
   */
  const refreshCurrentUser = useCallback(async (): Promise<UserProfile | null> => {
    try {
      setInternalAuthState({ isLoading: true });
      const user = await authService.getCurrentUser();
      setInternalAuthState({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch {
      setInternalAuthState({ isLoading: false });
      return null;
    }
  }, []);

  return {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // 2FA State
    is2FARequired,
    is2FASetupRequired,
    totpSetupData,
    pending2FA: state.pending2FA,

    // Actions
    signUp,
    signIn,
    verify2FA,
    signOut,
    cancel2FA,
    clearError,
    refreshCurrentUser,
  };
}

export default useAuth;
