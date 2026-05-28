import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// Guards
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Layouts
import PublicLayout from '../components/layout/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import DoctorListingPage from '../pages/public/DoctorListingPage';
import DoctorDetailPage from '../pages/public/DoctorDetailPage';
import NotFoundPage from '../pages/public/NotFoundPage';

// Patient Pages
import PatientDashboard from '../pages/patient/PatientDashboard';
import PatientAppointments from '../pages/patient/PatientAppointments';
import PatientPayments from '../pages/patient/PatientPayments';
import PatientProfile from '../pages/patient/PatientProfile';
import PatientMyReviews from '../pages/patient/MyReviews';

// Doctor Pages
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorAppointments from '../pages/doctor/DoctorAppointments';
import DoctorAvailability from '../pages/doctor/DoctorAvailability';
import DoctorProfileEditor from '../pages/doctor/DoctorProfileEditor';
import DoctorEarnings from '../pages/doctor/DoctorEarnings';
import DoctorMyReviews from '../pages/doctor/MyReviews';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminDoctorVerification from '../pages/admin/AdminDoctorVerification';
import AdminBookings from '../pages/admin/AdminBookings';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminRevenue from '../pages/admin/AdminRevenue';
import AdminReviews from '../pages/admin/AdminReviews';
import AdminAITools from '../pages/admin/AdminAITools';

const DASHBOARD_ROUTES = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
  admin: '/admin/dashboard',
};

/**
 * AuthRedirect — Redirects already-authenticated users away from /login and /register.
 * Prevents logged-in users from seeing the auth pages.
 */
const AuthRedirect = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    return <Navigate to={DASHBOARD_ROUTES[user.role] || '/'} replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* ─── Public Routes ──────────────────────────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />

        {/* Redirect authenticated users away from auth pages */}
        <Route
          path="/login"
          element={<AuthRedirect><LoginPage /></AuthRedirect>}
        />
        <Route
          path="/register"
          element={<AuthRedirect><RegisterPage /></AuthRedirect>}
        />

        <Route path="/doctors" element={<DoctorListingPage />} />
        <Route path="/doctors/:id" element={<DoctorDetailPage />} />
      </Route>

      {/* ─── Patient Routes ─────────────────────────────────────────────── */}
      <Route
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['patient']}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />
        <Route path="/patient/payments" element={<PatientPayments />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/patient/reviews" element={<PatientMyReviews />} />
      </Route>

      {/* ─── Doctor Routes ──────────────────────────────────────────────── */}
      <Route
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['doctor']}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/availability" element={<DoctorAvailability />} />
        <Route path="/doctor/profile" element={<DoctorProfileEditor />} />
        <Route path="/doctor/earnings" element={<DoctorEarnings />} />
        <Route path="/doctor/reviews" element={<DoctorMyReviews />} />
      </Route>

      {/* ─── Admin Routes ───────────────────────────────────────────────── */}
      <Route
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/doctors" element={<AdminDoctorVerification />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/revenue" element={<AdminRevenue />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/ai-tools" element={<AdminAITools />} />
      </Route>

      {/* ─── Catch-All 404 ──────────────────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
