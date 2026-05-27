const Card = ({ children, className = '', elevated = false }) => {
  const shadowClass = elevated ? 'shadow-elevated' : 'shadow-card';

  return (
    <div className={`bg-white rounded-card ${shadowClass} p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
