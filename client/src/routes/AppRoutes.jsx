import React from 'react';
import { Routes, Route } from 'react-router-dom';

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

// Doctor Pages
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorAppointments from '../pages/doctor/DoctorAppointments';
import DoctorAvailability from '../pages/doctor/DoctorAvailability';
import DoctorProfileEditor from '../pages/doctor/DoctorProfileEditor';
import DoctorEarnings from '../pages/doctor/DoctorEarnings';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminDoctorVerification from '../pages/admin/AdminDoctorVerification';
import AdminBookings from '../pages/admin/AdminBookings';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminRevenue from '../pages/admin/AdminRevenue';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/doctors" element={<DoctorListingPage />} />
        <Route path="/doctors/:id" element={<DoctorDetailPage />} />
      </Route>

      {/* Patient Dashboard Pages (Role specific layout) */}
      <Route element={<DashboardLayout />}>
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />
        <Route path="/patient/payments" element={<PatientPayments />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
      </Route>

      {/* Doctor Dashboard Pages (Role specific layout) */}
      <Route element={<DashboardLayout />}>
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/availability" element={<DoctorAvailability />} />
        <Route path="/doctor/profile" element={<DoctorProfileEditor />} />
        <Route path="/doctor/earnings" element={<DoctorEarnings />} />
      </Route>

      {/* Admin Panel Pages (Distinct administrative layout) */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/doctors" element={<AdminDoctorVerification />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/revenue" element={<AdminRevenue />} />
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
