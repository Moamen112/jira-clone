export const ROUTES = {
  LANDING: '/',
  AUTH: {
    SIGN_IN: '/auth/sign-in',
    SIGN_UP: '/auth/sign-up',
  },
  PROTECTED: {
    HOME: '/home',
    SPACES: '/spaces',
    PROFILE: '/profile',
    NOTIFICATIONS: '/notifications',
  },
} as const;
