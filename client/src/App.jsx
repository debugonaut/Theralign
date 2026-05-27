import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <BrowserRouter>
      {/* Global toast notification system */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1E293B',
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            borderRadius: '8px'
          }
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
