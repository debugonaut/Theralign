const variantClasses = {
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger: 'bg-red-50 text-danger border border-red-200',
  primary: 'bg-blue-50 text-primary border border-blue-200',
  neutral: 'bg-slate-100 text-secondary border border-slate-200'
};

const Badge = ({ children, variant = 'neutral', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
