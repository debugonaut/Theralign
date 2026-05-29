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
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#0F0F0F',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontWeight: '700',
              borderRadius: '0',
              border: '2px solid #0F0F0F',
              boxShadow: 'none',
            },
            success: {
              style: { borderLeft: '6px solid #0D7377' },
              iconTheme: { primary: '#0D7377', secondary: '#FFFFFF' },
            },
            error: {
              style: { borderLeft: '6px solid #FF3000' },
              iconTheme: { primary: '#FF3000', secondary: '#FFFFFF' },
              duration: Infinity,  // Error toasts never auto-dismiss
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
