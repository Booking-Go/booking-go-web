import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'business_owner' | 'admin';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

/**
 * Set a simple session cookie so Next.js middleware can check auth status.
 * Also set accessToken cookie so server actions can authenticate against backend.
 * These are NOT HttpOnly — just client-accessible flags. Real security is via HTTPS.
 */
function setSessionCookie() {
  if (typeof document === 'undefined') return;
  // 30 days, same as refresh token TTL
  document.cookie = 'session=1; path=/; max-age=2592000; SameSite=Lax';
}

/**
 * Sets the `accessToken` cookie for server-side API authentication.
 * Short-lived — 15 minutes (same as JWT expiry).
 */
function setAccessTokenCookie(token: string) {
  if (typeof document === 'undefined') return;
  // Short-lived — 15 minutes (same as JWT expiry). Will be refreshed by interceptor.
  document.cookie = `accessToken=${token}; path=/; max-age=900; SameSite=Lax`;
}

/** Clears all session and auth cookies on logout. */
function clearSessionCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'session=; path=/; max-age=0; SameSite=Lax';
  document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Lax';
}

/** Zustand auth store with localStorage persistence and cookie-based session tracking. */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setSessionCookie();
        setAccessTokenCookie(accessToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        clearSessionCookie();
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
