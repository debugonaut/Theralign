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
 */
const useAuthStore = create((set) => ({
  // ─── State ────────────────────────────────────────────────────────────────
  user: null,            // { _id, name, email, role, profileImage, phone, isActive }
  token: null,           // JWT string
  isAuthenticated: false,
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
   * Hydrate auth state from localStorage on app load.
   * Called once in main.jsx to restore the session across page refreshes.
   */
  initializeAuth: () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userRaw = localStorage.getItem(USER_KEY);

      if (token && userRaw) {
        const user = JSON.parse(userRaw);
        set({ user, token, isAuthenticated: true });
      }
    } catch {
      // Malformed localStorage data — clear it
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

export default useAuthStore;
