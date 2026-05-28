import { Navigate } from 'react-router-dom';
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

  // Prevent redirect flash while auth is being initialized from localStorage
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // 'replace' prevents the protected page from staying in browser history —
    // the back button will not return to it after redirect.
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
