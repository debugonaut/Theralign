import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../../components/common/Button';

const NotFoundPage = () => {
  React.useEffect(() => {
    document.title = '404 Page Not Found — PhysioConnect';
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 text-center px-6">
      <div className="p-4 bg-primary/10 rounded-full text-primary mb-6 animate-pulse">
        <Compass size={48} />
      </div>
      <h1 className="text-8xl font-extrabold text-secondary tracking-tighter">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 mt-4">Oops! Page not found.</h2>
      <p className="text-slate-500 mt-2 max-w-md font-medium leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Use the options below to get back on track.
      </p>
      <Link to="/" className="mt-8">
        <Button variant="primary" size="lg">
          ← Back to Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
