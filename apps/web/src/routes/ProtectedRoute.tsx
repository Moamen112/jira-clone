import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@jira-clone/shared';
import { ROUTES } from './paths';

/**
 * ProtectedRoute wrapper.
 * Ensures user is authenticated before allowing access to protected pages.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.SIGN_IN} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
