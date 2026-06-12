import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Guards
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import HomeRedirect from './HomeRedirect';

// Layouts
import PublicLayout from '../components/layout/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Public Pages (Lazy Loaded)
const LandingPage = lazy(() => import('../pages/public/LandingPage'));
const LoginPage = lazy(() => import('../pages/public/LoginPage'));
const RegisterPage = lazy(() => import('../pages/public/RegisterPage'));
const DoctorListingPage = lazy(() => import('../pages/public/DoctorListingPage'));
const DoctorDetailPage = lazy(() => import('../pages/public/DoctorDetailPage'));
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('../pages/public/UnauthorizedPage'));
const PricingPage = lazy(() => import('../pages/public/PricingPage'));
const ClinicalStandardsPage = lazy(() => import('../pages/public/ClinicalStandardsPage'));
const PracticeManagementPage = lazy(() => import('../pages/public/PracticeManagementPage'));
const HelpCenterPage = lazy(() => import('../pages/public/HelpCenterPage'));
const PrivacyPolicyPage = lazy(() => import('../pages/public/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('../pages/public/TermsOfServicePage'));
const MedicalDisclaimerPage = lazy(() => import('../pages/public/MedicalDisclaimerPage'));

// Patient Pages (Lazy Loaded)
const PatientDashboard = lazy(() => import('../pages/patient/PatientDashboard'));
const PatientAppointments = lazy(() => import('../pages/patient/PatientAppointments'));
const AppointmentDetailsPage = lazy(() => import('../pages/patient/AppointmentDetailsPage'));
const BookingSuccessPage = lazy(() => import('../pages/patient/BookingSuccessPage'));
const PatientPayments = lazy(() => import('../pages/patient/PatientPayments'));
const PatientProfile = lazy(() => import('../pages/patient/PatientProfile'));
const PatientMyReviews = lazy(() => import('../pages/patient/MyReviews'));
const PatientCareTimeline = lazy(() => import('../pages/patient/PatientCareTimeline'));

// Doctor Pages (Lazy Loaded)
const DoctorDashboard = lazy(() => import('../pages/doctor/DoctorDashboard'));
const DoctorAppointments = lazy(() => import('../pages/doctor/DoctorAppointments'));
const DoctorAvailability = lazy(() => import('../pages/doctor/DoctorAvailability'));
const DoctorProfileEditor = lazy(() => import('../pages/doctor/DoctorProfileEditor'));
const DoctorEarnings = lazy(() => import('../pages/doctor/DoctorEarnings'));
const DoctorMyReviews = lazy(() => import('../pages/doctor/MyReviews'));
const SessionRecordForm = lazy(() => import('../pages/doctor/SessionRecordForm'));

// Admin Pages (Lazy Loaded)
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminDoctorVerification = lazy(() => import('../pages/admin/AdminDoctorVerification'));
const AdminBookings = lazy(() => import('../pages/admin/AdminBookings'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminRevenue = lazy(() => import('../pages/admin/AdminRevenue'));
const AdminReviews = lazy(() => import('../pages/admin/AdminReviews'));
const AdminAITools = lazy(() => import('../pages/admin/AdminAITools'));
const AdminAnalytics = lazy(() => import('../pages/admin/AdminAnalytics'));
const AdminDoctorDetail = lazy(() => import('../pages/admin/AdminDoctorDetail'));
const AdminRefunds = lazy(() => import('../pages/admin/AdminRefunds'));

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
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* ─── Public Routes ──────────────────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomeRedirect><LandingPage /></HomeRedirect>} />

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
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/standards" element={<ClinicalStandardsPage />} />
          <Route path="/management" element={<PracticeManagementPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/disclaimer" element={<MedicalDisclaimerPage />} />
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
          <Route path="/patient/care-timeline" element={<PatientCareTimeline />} />
        </Route>

        {/* Lightweight Mobile-First Patient detail route (hides the dashboard sidebar layout shell) */}
        <Route
          path="/appointments/:id"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['patient']}>
                <AppointmentDetailsPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Lightweight Mobile-First Patient booking success/payment confirmation page */}
        <Route
          path="/booking-success/:id"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['patient']}>
                <BookingSuccessPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

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
          <Route path="/doctor/appointments/:appointmentId/session-record" element={<SessionRecordForm />} />
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
          <Route path="/admin/doctors/:id" element={<AdminDoctorDetail />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/revenue" element={<AdminRevenue />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/ai-tools" element={<AdminAITools />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/refunds" element={<AdminRefunds />} />
        </Route>

        {/* ─── Catch-All 404 ──────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
