import { create } from 'zustand';

// localStorage key constants — Theralign-prefixed to avoid collisions
const TOKEN_KEY = 'theralign_token';
const USER_KEY = 'theralign_user';

/**
 * Zustand Auth Store
 *
 * Why Zustand over React Context?
 * Auth state is read by many components across the entire tree. Zustand's
 * selective subscription model means only components that explicitly subscribe
 * to a specific slice re-render when that slice changes. Context would
 * re-render the entire component tree on every auth state change.
 *
 * Auth Hydration Strategy:
 * We read localStorage synchronously here (at module evaluation time) so that
 * the very first render of ProtectedRoute already has the correct isAuthenticated
 * value. Calling hydration inside a useEffect (after render) caused a race where
 * ProtectedRoute redirected to /login before initializeAuth ran, triggering a
 * double-mount of all dashboard components and cascading "Failed to load" toasts.
 */

// Synchronously read persisted session before store creation
const _readPersistedAuth = () => {
  try {
    const token = localStorage.getItem('theralign_token');
    const userRaw = localStorage.getItem('theralign_user');
    if (token && userRaw) {
      return { user: JSON.parse(userRaw), token, isAuthenticated: true };
    }
  } catch {
    localStorage.removeItem('theralign_token');
    localStorage.removeItem('theralign_user');
  }
  return { user: null, token: null, isAuthenticated: false };
};

const _persistedAuth = _readPersistedAuth();

const useAuthStore = create((set) => ({
  // ─── State ────────────────────────────────────────────────────────────────
  // Hydrated synchronously from localStorage — correct on the very first render
  user: _persistedAuth.user,
  token: _persistedAuth.token,
  isAuthenticated: _persistedAuth.isAuthenticated,
  isLoading: false,      // true while login/register API call is in flight
  error: null,           // last auth error message

  // ─── Actions ──────────────────────────────────────────────────────────────

  /**
   * Set credentials after successful login or registration.
   * Persists both token and user to localStorage for session hydration on refresh.
   */
  setCredentials: (user, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user, token, isAuthenticated: true, error: null });
  },

  /**
   * Clear credentials on logout or on 401 response.
   * Removes both localStorage entries to prevent stale state.
   */
  clearCredentials: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  /**
   * @deprecated Auth is now hydrated synchronously at module load time.
   * This function is kept as a no-op to avoid breaking any call-sites
   * that haven't been updated yet.
   */
  initializeAuth: () => {},

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

export default useAuthStore;
