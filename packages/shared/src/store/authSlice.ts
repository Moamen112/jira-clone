import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getAuthTokens } from '../lib/authTokens';
import { getStorageItem, STORAGE_KEYS } from '../services/storageService';
import type { Pending2FAState, UserProfile } from '../types/auth';

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pending2FA: Pending2FAState | null;
}

const storedUser = getStorageItem<UserProfile>(STORAGE_KEYS.CURRENT_USER, 'web');
const hasStoredSession = Boolean(storedUser && getAuthTokens());

export const initialAuthState: AuthState = {
  user: hasStoredSession ? storedUser : null,
  isAuthenticated: hasStoredSession,
  isLoading: false,
  error: null,
  pending2FA: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setAuthError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearAuthError(state) {
      state.error = null;
    },
    setPending2FA(state, action: PayloadAction<Pending2FAState | null>) {
      state.pending2FA = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setAuthSuccess(state, action: PayloadAction<UserProfile>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.pending2FA = null;
      state.isLoading = false;
      state.error = null;
    },
    setCurrentUser(state, action: PayloadAction<UserProfile>) {
      state.user = action.payload;
    },
    logoutAction() {
      return { user: null, isAuthenticated: false, isLoading: false, error: null, pending2FA: null };
    },
  },
});

export const {
  setAuthLoading,
  setAuthError,
  clearAuthError,
  setPending2FA,
  setAuthSuccess,
  setCurrentUser,
  logoutAction,
} = authSlice.actions;

export const authReducer = authSlice.reducer;

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
    ? { secret: state.auth.pending2FA.secret, otpauthUri: state.auth.pending2FA.otpauthUri }
    : null;
