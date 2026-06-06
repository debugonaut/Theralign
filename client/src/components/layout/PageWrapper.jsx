import React from 'react';

const PageWrapper = ({ children, className = '' }) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-4 w-full ${className}`}>
      {children}
    </div>
  );
};

export default PageWrapper;
