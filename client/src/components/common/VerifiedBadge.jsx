import React from 'react';

const VerifiedBadge = ({ size = 'sm' }) => {
  const sizeStyles = {
    xs: { padding: '2px 6px', fontSize: '9px', letterSpacing: '0.04em' },
    sm: { padding: '4px 8px', fontSize: '11px', letterSpacing: '0.04em' },
    md: { padding: '6px 12px', fontSize: '12px', letterSpacing: '0.02em' },
  };

  const style = sizeStyles[size] || sizeStyles.sm;

  return (
    <span
      className="inline-flex items-center justify-center font-bold select-none rounded-[4px]"
      style={{
        ...style,
        backgroundColor: '#E8F4F8',
        color: '#0B4F6C',
        lineHeight: '1',
        fontFamily: 'Inter, sans-serif',
        whiteSpace: 'nowrap',
      }}
    >
      Verified
    </span>
  );
};

export default VerifiedBadge;
