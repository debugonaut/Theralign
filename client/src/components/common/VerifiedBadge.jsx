import React from 'react';

const VerifiedBadge = ({ size = 'sm' }) => {
  const sizeStyles = {
    xs: { padding: '2px 6px', fontSize: '9px', letterSpacing: '0.08em' },
    sm: { padding: '4px 8px', fontSize: '11px', letterSpacing: '0.08em' },
    md: { padding: '6px 12px', fontSize: '12px', letterSpacing: '0.06em' },
  };

  const style = sizeStyles[size] || sizeStyles.sm;

  return (
    <span
      className="inline-flex items-center justify-center font-bold uppercase select-none border-2 border-swiss-teal text-swiss-teal bg-swiss-white rounded-none"
      style={{
        ...style,
        lineHeight: '1',
        fontFamily: 'Inter, sans-serif',
        whiteSpace: 'nowrap',
      }}
    >
      VERIFIED
    </span>
  );
};

export default VerifiedBadge;
