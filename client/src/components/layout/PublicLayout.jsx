import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const PublicLayout = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Navbar />
      <main 
        key={location.pathname}
        className="flex-grow max-w-[1440px] mx-auto w-full px-6 sm:px-16 page-fade-in"
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
