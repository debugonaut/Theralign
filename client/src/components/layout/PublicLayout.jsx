import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const PublicLayout = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Navbar />
      <main 
        key={location.pathname}
        className={
          isLandingPage 
            ? "flex-grow w-full page-fade-in" 
            : "flex-grow max-w-[1280px] mx-auto w-full px-16 page-fade-in"
        }
      >
        <Outlet />
      </main>
      {!isLandingPage && <Footer />}
    </div>
  );
};

export default PublicLayout;
