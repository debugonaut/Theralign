import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ToastProvider } from './components/common/Toast';
import AppRoutes from './routes/AppRoutes';

/**
 * App root.
 *
 * Design Phase 1 — Toast setup:
 *   - <ToastProvider> wraps the app for new Swiss-design components (useToast hook)
 *   - react-hot-toast <Toaster> is kept for backward compatibility with existing
 *     pages during the Phase 1→2 migration. It will be removed phase by phase
 *     as pages are redesigned to use useToast.
 */
const App = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        {/* Legacy toaster — kept during migration, styled to Swiss system */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#1C2B3A',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '12px',
              border: '1px solid #DDE3EA',
              boxShadow: '0px 4px 16px rgba(11, 79, 108, 0.10), 0px 2px 6px rgba(11, 79, 108, 0.07)',
            },
            success: {
              style: { borderLeft: '6px solid #0A7E6E' },
              iconTheme: { primary: '#0A7E6E', secondary: '#FFFFFF' },
            },
            error: {
              style: { borderLeft: '6px solid #C0392B' },
              iconTheme: { primary: '#C0392B', secondary: '#FFFFFF' },
              duration: 6000,  // Error toasts auto-dismiss after 6 seconds
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
