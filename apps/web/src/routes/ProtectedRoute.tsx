import { Outlet } from 'react-router';

/**
 * ProtectedRoute placeholder wrapper.
 * Authentication check will be connected once the auth API is integrated.
 */
export function ProtectedRoute() {
  return <Outlet />;
}

export default ProtectedRoute;
