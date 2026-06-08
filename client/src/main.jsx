import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.jsx';

/**
 * Auth hydration is handled synchronously inside authStore.js at module load time.
 * No useEffect is needed here — the store is already populated with the persisted
 * session before the first render, preventing ProtectedRoute from redirecting to
 * /login on page refresh.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

