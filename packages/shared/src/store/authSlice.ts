import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserProfile, Pending2FAState } from '../types/auth';
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  STORAGE_KEYS,
  type AsyncStorageAdapter,
} from '../services/storageService';
import { getAuthTokens } from '../lib/authTokens';

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pending2FA: Pending2FAState | null;
}

let mobileAuthAdapter: AsyncStorageAdapter | undefined;

/**
 * Configure an AsyncStorage adapter for native mobile user state persistence.
 */
export function setMobileAuthAdapter(adapter: AsyncStorageAdapter): void {
  mobileAuthAdapter = adapter;
  getStorageItem<UserProfile>(STORAGE_KEYS.CURRENT_USER, 'mobile', null, adapter).then((stored) => {
    if (stored) {
      setInternalAuthState({ user: stored, isAuthenticated: true });
    }
  });
}

function loadInitialUser(): UserProfile | null {
  return getStorageItem<UserProfile>(STORAGE_KEYS.CURRENT_USER, 'web', null);
}

const initialTokens = getAuthTokens();
const initialUser = loadInitialUser();

export const initialAuthState: AuthState = {
  user: initialUser,
  isAuthenticated: Boolean(initialTokens?.accessToken && initialUser),
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

  // Persist or remove user profile in storage
  if (next.user !== undefined) {
    if (next.user) {
      setStorageItem(STORAGE_KEYS.CURRENT_USER, next.user, 'web');
      if (mobileAuthAdapter) {
        void setStorageItem(STORAGE_KEYS.CURRENT_USER, next.user, 'mobile', mobileAuthAdapter);
      }
    } else {
      removeStorageItem(STORAGE_KEYS.CURRENT_USER, 'web');
      if (mobileAuthAdapter) {
        void removeStorageItem(STORAGE_KEYS.CURRENT_USER, 'mobile', mobileAuthAdapter);
      }
    }
  }

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

      setStorageItem(STORAGE_KEYS.CURRENT_USER, action.payload, 'web');
      if (mobileAuthAdapter) {
        void setStorageItem(STORAGE_KEYS.CURRENT_USER, action.payload, 'mobile', mobileAuthAdapter);
      }
    },
    logoutAction: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.pending2FA = null;
      state.isLoading = false;
      state.error = null;

      removeStorageItem(STORAGE_KEYS.CURRENT_USER, 'web');
      if (mobileAuthAdapter) {
        void removeStorageItem(STORAGE_KEYS.CURRENT_USER, 'mobile', mobileAuthAdapter);
      }
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
