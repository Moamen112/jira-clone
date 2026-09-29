import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAuthTokens } from '../lib/authTokens';
import { authService } from '../services/authService';
import {
  clearAuthError,
  logoutAction,
  selectAuth,
  setAuthError,
  setAuthLoading,
  setAuthSuccess,
  setCurrentUser,
  setPending2FA,
} from '../store/authSlice';
import type { LoginPayload, RegisterPayload } from '../types/auth';

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = error.response as { data?: Record<string, unknown> | string } | undefined;
    const data = response?.data;
    if (typeof data === 'string') return data;
    if (data) {
      if (typeof data.detail === 'string') return data.detail;
      const messages = Object.entries(data).flatMap(([field, value]) =>
        Array.isArray(value) ? [`${field}: ${value.join(' ')}`] :
        typeof value === 'string' ? [`${field}: ${value}`] : []
      );
      if (messages.length) return messages.join('; ');
    }
  }
  return error instanceof Error ? error.message : 'An error occurred during authentication';
}

let sessionCheckStarted = false;

export function useAuth() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error, pending2FA } = useSelector(selectAuth);

  const signIn = useCallback(async (payload: LoginPayload) => {
    dispatch(setAuthLoading(true));
    dispatch(clearAuthError());
    try {
      const response = await authService.login(payload);
      if (response.status === 'totp_setup_required') {
        dispatch(setPending2FA({
            pendingToken: response.pending_token,
            status: response.status,
            secret: response.secret,
            otpauthUri: response.otpauth_uri,
        }));
      } else {
        dispatch(setPending2FA({ pendingToken: response.pending_token, status: response.status }));
      }
      return response;
    } catch (err) {
      dispatch(setAuthError(errorMessage(err)));
      throw err;
    }
  }, [dispatch]);

  const signUp = useCallback(async (payload: RegisterPayload, autoSignIn = true) => {
    dispatch(setAuthLoading(true));
    dispatch(clearAuthError());
    try {
      const response = await authService.register(payload);
      if (autoSignIn) {
        const loginResponse = await signIn({ email: payload.email, password: payload.password });
        if (loginResponse.status !== 'totp_setup_required') {
          dispatch(setPending2FA(null));
          throw new Error(
            'Account created, but the API reports an authenticator is already linked. ' +
            'It did not provide a setup key, so two-factor setup cannot continue for this account.'
          );
        }
      } else {
        dispatch(setAuthLoading(false));
      }
      return response;
    } catch (err) {
      dispatch(setAuthError(errorMessage(err)));
      throw err;
    }
  }, [dispatch, signIn]);

  const verify2FA = useCallback(async (code: string) => {
    if (!pending2FA?.pendingToken) {
      const message = 'No pending authentication session found. Please sign in again.';
      dispatch(setAuthError(message));
      throw new Error(message);
    }

    dispatch(setAuthLoading(true));
    dispatch(clearAuthError());
    try {
      const { user: verifiedUser } = await authService.verifyTOTP({
        pending_token: pending2FA.pendingToken,
        code: code.trim(),
      });
      dispatch(setAuthSuccess(verifiedUser));
      return verifiedUser;
    } catch (err) {
      dispatch(setAuthError(errorMessage(err)));
      throw err;
    }
  }, [dispatch, pending2FA]);

  const signOut = useCallback(async () => {
    dispatch(setAuthLoading(true));
    try {
      await authService.logout();
    } catch {
      // Local sign-out must still succeed if the server is unavailable.
    } finally {
      dispatch(logoutAction());
    }
  }, [dispatch]);

  const cancel2FA = useCallback(() => {
    dispatch(setPending2FA(null));
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const refreshCurrentUser = useCallback(async () => {
    dispatch(setAuthLoading(true));
    try {
      const latestUser = await authService.getCurrentUser();
      dispatch(setAuthSuccess(latestUser));
      return latestUser;
    } catch {
      if (!getAuthTokens()) dispatch(logoutAction());
      else dispatch(setAuthLoading(false));
      return null;
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated || sessionCheckStarted) return;
    sessionCheckStarted = true;
    void authService.getCurrentUser().then((latestUser) => {
      if (getAuthTokens()) dispatch(setCurrentUser(latestUser));
    }).catch(() => {
      if (!getAuthTokens()) dispatch(logoutAction());
    }).finally(() => {
      sessionCheckStarted = false;
    });
  }, [dispatch, isAuthenticated]);

  const is2FASetupRequired = pending2FA?.status === 'totp_setup_required';

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    is2FARequired: Boolean(pending2FA),
    is2FASetupRequired,
    totpSetupData: is2FASetupRequired
      ? { secret: pending2FA.secret ?? '', otpauthUri: pending2FA.otpauthUri ?? '' }
      : null,
    pending2FA,
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
