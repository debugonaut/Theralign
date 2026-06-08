import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// Maps each role to its home dashboard
const DASHBOARD_ROUTES = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
  admin: '/admin/dashboard',
};

/**
 * RoleRoute — Role-Based Authorization Guard
 *
 * Must be used INSIDE a ProtectedRoute (or after authentication is confirmed).
 * Redirects users who don't have one of the allowedRoles to their own dashboard
 * rather than showing a 403 — better UX than an error page.
 *
 * Why redirect instead of showing a 403?
 * In a marketplace, showing an error page when a doctor accidentally navigates
 * to the patient section is unnecessarily jarring. Silently redirecting them to
 * their own dashboard is cleaner.
 *
 * Usage:
 *   <RoleRoute allowedRoles={['admin']}>
 *     <AdminDashboard />
 *   </RoleRoute>
 */
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleRoute;
