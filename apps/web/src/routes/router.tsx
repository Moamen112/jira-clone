import { createBrowserRouter, Navigate } from 'react-router';
import { RootLayout } from '../layouts/RootLayout';
import { ProtectedLayout } from '../layouts/ProtectedLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LandingPage } from '../features/landing/LandingPage';
import { SignInPage } from '../features/auth/SignInPage';
import { SignUpPage } from '../features/auth/SignUpPage';
import { HomePage } from '../features/home/HomePage';
import { SpacesPage } from '../features/spaces/SpacesPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { NotificationsPage } from '../features/notifications/NotificationsPage';
import { ROUTES } from './paths';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Public routes: Navbar only (no Sidenav)
      {
        path: ROUTES.LANDING,
        element: <LandingPage />,
      },
      {
        path: ROUTES.AUTH.SIGN_IN,
        element: <SignInPage />,
      },
      {
        path: ROUTES.AUTH.SIGN_UP,
        element: <SignUpPage />,
      },

      // Protected routes: Navbar + Sidenav
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <ProtectedLayout />,
            children: [
              {
                path: ROUTES.PROTECTED.HOME,
                element: <HomePage />,
              },
              {
                path: ROUTES.PROTECTED.SPACES,
                element: <SpacesPage />,
              },
              {
                path: ROUTES.PROTECTED.PROFILE,
                element: <ProfilePage />,
              },
              {
                path: ROUTES.PROTECTED.NOTIFICATIONS,
                element: <NotificationsPage />,
              },
            ],
          },
        ],
      },

      // Catch-all redirect
      {
        path: '*',
        element: <Navigate to={ROUTES.LANDING} replace />,
      },
    ],
  },
]);
