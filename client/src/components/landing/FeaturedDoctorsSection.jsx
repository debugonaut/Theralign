import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedDoctorsAPI } from '../../api/discovery.api';
import DoctorCard from '../doctor/DoctorCard';
import Button from '../common/Button';

const FeaturedDoctorsSection = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await getFeaturedDoctorsAPI();
        // Assuming response is { success: true, data: [ ... ] } or similar
        const docs = response.data || response || [];
        setDoctors(Array.isArray(docs) ? docs.slice(0, 3) : []);
      } catch (error) {
        console.error('Failed to fetch featured doctors:', error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-secondary tracking-tight">
          Meet Our Top Physiotherapists
        </h2>
        <p className="text-slate-500 font-medium mt-2 mb-12">
          Trusted by hundreds of patients across India.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-slate-100 rounded-card p-6 h-64 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-slate-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                </div>
              </div>
              <div className="h-px bg-slate-100 my-4" />
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Gracefully hide the section if no doctors are returned
  if (doctors.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto text-center">
      <h2 className="text-3xl font-extrabold text-secondary tracking-tight">
        Meet Our Top Physiotherapists
      </h2>
      <p className="text-slate-500 font-medium mt-2 mb-12">
        Trusted by hundreds of patients across India.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="text-left">
            <DoctorCard doctor={doctor} />
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link to="/doctors">
          <Button variant="primary" size="lg">
            Browse All Doctors →
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default FeaturedDoctorsSection;
