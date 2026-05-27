const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  className = ''
}) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-button transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-sm',
    secondary: 'bg-white text-secondary border border-slate-200 hover:bg-surface focus:ring-primary',
    danger: 'bg-danger text-white hover:opacity-90 focus:ring-danger',
    ghost: 'bg-transparent text-secondary hover:bg-surface focus:ring-primary'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-7 py-3'
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? disabledStyles : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
