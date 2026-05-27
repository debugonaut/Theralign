import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-surface text-center px-4">
    <h1 className="text-8xl font-black text-primary">404</h1>
    <h2 className="text-2xl font-bold text-secondary mt-4">Page Not Found</h2>
    <p className="text-slate-500 mt-2 max-w-md">
      The page you are looking for does not exist or has been moved.
    </p>
    <Link
      to="/"
      className="mt-8 px-6 py-3 bg-primary text-white font-semibold rounded-button hover:bg-primary-dark transition-colors shadow-sm"
    >
      Return Home
    </Link>
  </div>
);
export default NotFoundPage;
