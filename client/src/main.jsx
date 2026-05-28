import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.jsx';
import useAuthStore from './store/authStore.js';

/**
 * Root component — responsible for a single initialization side effect.
 * initializeAuth() hydrates Zustand state from localStorage so that the
 * session is restored across page refreshes before any route renders.
 */
const Root = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <App />;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
