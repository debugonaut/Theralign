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
        const docs = response.data || response || [];
        // Slice 6 for 3x2 grid as per Phase 2 spec
        setDoctors(Array.isArray(docs) ? docs.slice(0, 6) : []);
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
      <section className="py-24 w-full" id="featured-doctors">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-16 relative z-10">
          {/* Header Title with horizontal line behind */}
          <div className="relative w-full mb-16 flex flex-col items-center">
            {/* Horizontal Line behind */}
            <div className="absolute left-0 right-0 top-[60%] h-px bg-obsidian/20 z-0" />
            
            {/* Text Overlay */}
            <div className="relative z-10 bg-white px-8 text-center">
              <span className="inline-flex items-center gap-2 text-ui-xs tracking-[0.2em] font-bold text-primary font-swiss uppercase mb-2">
                — FEATURED SPECIALISTS
              </span>
              <h2 className="text-display-sm sm:text-display-md font-serif text-obsidian tracking-wide leading-none uppercase font-normal">
                OUR FEATURED PRACTITIONERS
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white border-2 border-neutral-200 h-64 animate-pulse p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-neutral-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-200 w-2/3" />
                    <div className="h-3 bg-neutral-200 w-1/3" />
                  </div>
                </div>
                <div className="h-px bg-neutral-200 my-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-neutral-200 w-full" />
                  <div className="h-3 bg-neutral-200 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (doctors.length === 0) {
    return null;
  }

  return (
    <section className="py-24 w-full" id="featured-doctors">
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-16 relative z-10">
        {/* Header Title with horizontal line behind */}
        <div className="relative w-full mb-16 flex flex-col items-center">
          {/* Horizontal Line behind */}
          <div className="absolute left-0 right-0 top-[60%] h-px bg-obsidian/20 z-0" />
          
          {/* Text Overlay */}
          <div className="relative z-10 bg-white px-8 text-center">
            <span className="inline-flex items-center gap-2 text-ui-xs tracking-[0.2em] font-bold text-primary font-swiss uppercase mb-2">
              — FEATURED SPECIALISTS
            </span>
            <h2 className="text-display-sm sm:text-display-md font-serif text-obsidian tracking-wide leading-none uppercase font-normal">
              OUR FEATURED PRACTITIONERS
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <div key={doctor._id}>
              <DoctorCard doctor={doctor} />
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center border-t-2 border-neutral-200 pt-12">
          <Link to="/doctors">
            <Button variant="secondary" size="lg">
              BROWSE ALL DOCTORS →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDoctorsSection;
