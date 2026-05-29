import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * ProtectedRoute — Authentication Guard
 *
 * Wraps any route that requires the user to be logged in.
 * Shows a loading spinner during auth initialization to prevent a flash
 * redirect before localStorage has been read.
 *
 * Usage:
 *   <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} />
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Prevent redirect flash while auth is being initialized from localStorage
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Save the intended destination so user lands back there after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;
