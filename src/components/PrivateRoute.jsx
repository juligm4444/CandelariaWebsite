import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';

const PrivateRoute = ({ children, internalOnly = false }) => {
  const { isAuthenticated, isInternal, loading } = useAuth();
  const { is_internal: profileIsInternal, loading: profileLoading } = useUserProfile();

  // Show nothing while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // For internal-only routes, wait for profile lookup when available to avoid false negatives.
  if (internalOnly && isAuthenticated && profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Restrict internal-only routes.
  const canAccessInternal = isInternal || profileIsInternal;
  if (internalOnly && !canAccessInternal) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default PrivateRoute;
