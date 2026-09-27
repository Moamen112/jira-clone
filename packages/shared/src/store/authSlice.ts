import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserProfile, Pending2FAState } from '../types/auth';

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pending2FA: Pending2FAState | null;
}

export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  pending2FA: null,
};

// Singleton in-memory state accessible across web and mobile
let currentAuthState: AuthState = { ...initialAuthState };
const listeners = new Set<() => void>();

export function getAuthState(): AuthState {
  return currentAuthState;
}

export function subscribeAuthState(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setInternalAuthState(
  updater: Partial<AuthState> | ((prev: AuthState) => Partial<AuthState>)
): void {
  const next = typeof updater === 'function' ? updater(currentAuthState) : updater;
  currentAuthState = { ...currentAuthState, ...next };
  listeners.forEach((listener) => listener());
}

export const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPending2FA: (state, action: PayloadAction<Pending2FAState | null>) => {
      state.pending2FA = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setAuthSuccess: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.pending2FA = null;
      state.isLoading = false;
      state.error = null;
    },
    logoutAction: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.pending2FA = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setLoading: setAuthLoading,
  setError: setAuthError,
  clearError: clearAuthError,
  setPending2FA,
  setAuthSuccess,
  logoutAction,
} = authSlice.actions;

export const authReducer = authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectPending2FA = (state: { auth: AuthState }) => state.auth.pending2FA;
export const selectIs2FARequired = (state: { auth: AuthState }) => Boolean(state.auth.pending2FA);
export const selectIs2FASetupRequired = (state: { auth: AuthState }) =>
  state.auth.pending2FA?.status === 'totp_setup_required';
export const selectTotpSetupData = (state: { auth: AuthState }) =>
  state.auth.pending2FA?.status === 'totp_setup_required'
    ? {
        secret: state.auth.pending2FA.secret,
        otpauthUri: state.auth.pending2FA.otpauthUri,
      }
    : null;
