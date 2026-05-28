import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  UserCheck,
  Calendar,
  IndianRupee,
  Users,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

import { getDoctorProfileAPI } from '../../api/doctor.api';
import useAuthStore from '../../store/authStore';

const DoctorDashboard = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getDoctorProfileAPI();
        if (res.success && res.data.profile) {
          setProfile(res.data.profile);
        }
      } catch (err) {
        console.error('Failed to load doctor profile for dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  const status = profile ? profile.verificationStatus : 'unsubmitted';

  return (
    <div className="space-y-8">
      {/* ─── Greeting Header ────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome back, Dr. {user?.name || 'Physiotherapist'}!
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Here is what's happening with your practice today.
        </p>
      </div>

      {/* ─── Dynamic Verification Status Banners ─────────────────────────── */}
      {status === 'unsubmitted' && (
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg">Complete Your Professional Onboarding</h2>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                To start appearing in patient search listings, receiving appointment bookings, and accepting secure payments, please complete your professional profile.
              </p>
            </div>
          </div>
          <Link
            to="/doctor/profile"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shrink-0 self-start md:self-center"
          >
            Onboard Now <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {status === 'pending' && (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 shadow-sm">
          <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md shrink-0">
            <Clock size={24} className="animate-spin-slow" />
          </div>
          <div>
            <h2 className="font-bold text-amber-900 text-lg">Profile Verification Under Review</h2>
            <p className="text-sm text-amber-800/90 mt-1 max-w-2xl">
              Your professional documents (medical license and degrees) are currently being reviewed by our admin team. This process typically takes **24 to 48 hours**. You will receive an email notification once your profile is verified and active!
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-amber-700">
              <span>Submitted Registration: {profile.registrationNumber}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <Link to="/doctor/profile" className="hover:underline">
                View Submitted Details
              </Link>
            </div>
          </div>
        </div>
      )}

      {status === 'rejected' && (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-sm animate-pulse-subtle">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-600 text-white rounded-xl shadow-md shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="font-bold text-rose-900 text-lg">Verification Failed</h2>
              <p className="text-sm text-rose-800 mt-1 font-medium">
                Reason: {profile.rejectionReason || 'Uploaded documents were not legible or expired.'}
              </p>
              <p className="text-xs text-rose-700/80 mt-2 max-w-xl">
                Please update your medical registration details, re-upload clear credentials, and resubmit your application.
              </p>
            </div>
          </div>
          <Link
            to="/doctor/profile"
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shrink-0 self-start md:self-start"
          >
            Edit & Resubmit <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {status === 'verified' && (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-4 shadow-sm">
          <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-md shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="font-bold text-emerald-950 text-lg">Profile Verified & Active</h2>
            <p className="text-sm text-emerald-800 mt-1 max-w-2xl">
              Congratulations! Your credentials have been verified. You are now live on Theralign and visible in proximity searches. Patients can view your clinic details and request appointments.
            </p>
          </div>
        </div>
      )}

      {/* ─── Stat Cards Placeholder Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1: Today's Appointments */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Today's Bookings
            </span>
            <span className="text-3xl font-extrabold text-slate-800 mt-2 block">—</span>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <Calendar size={22} />
          </div>
        </div>

        {/* Stat 2: Total Patients */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Patients
            </span>
            <span className="text-3xl font-extrabold text-slate-800 mt-2 block">—</span>
          </div>
          <div className="p-3.5 bg-teal-50 text-teal-600 rounded-xl">
            <Users size={22} />
          </div>
        </div>

        {/* Stat 3: Verification Badge */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Profile Status
            </span>
            <div className="mt-2.5">
              {status === 'verified' && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200">
                  <ShieldCheck size={12} /> Verified
                </span>
              )}
              {status === 'pending' && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200">
                  <Clock size={12} className="animate-spin-slow" /> Pending
                </span>
              )}
              {status === 'rejected' && (
                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-200">
                  <ShieldAlert size={12} /> Rejected
                </span>
              )}
              {status === 'unsubmitted' && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-200">
                  Unsubmitted
                </span>
              )}
            </div>
          </div>
          <div
            className={`p-3.5 rounded-xl ${
              status === 'verified'
                ? 'bg-emerald-50 text-emerald-600'
                : status === 'pending'
                ? 'bg-amber-50 text-amber-600'
                : status === 'rejected'
                ? 'bg-rose-50 text-rose-600'
                : 'bg-blue-50 text-blue-600'
            }`}
          >
            <UserCheck size={22} />
          </div>
        </div>

        {/* Stat 4: Earnings */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Earnings
            </span>
            <span className="text-3xl font-extrabold text-slate-800 mt-2 block">₹—</span>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <IndianRupee size={22} />
          </div>
        </div>
      </div>

      {/* ─── Practice Growth Advice Checklist ────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Theralign Provider Guidelines</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="font-semibold text-slate-700 text-sm">Provide accurate geo-coordinates</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Our discovery algorithm is location-driven. Accurate coordinates ensure local patients in your Indiranagar/Koramangala vicinity find you first.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="font-semibold text-slate-700 text-sm">Verify documents strictly</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Make sure your degree and license are high-resolution PDFs or clear photos. Admin reviews verify registration numbers directly with council logs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="font-semibold text-slate-700 text-sm">Keep availability slots dynamic</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Once verified (Phase 5), setting accurate, consistent hours prevents booking cancellations and drives positive ratings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
