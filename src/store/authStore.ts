import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRoleValue } from '@/lib/constants';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRoleValue;
}

interface AuthState {
  user: User | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

/**
 * Set a simple session cookie so Next.js middleware can check auth status.
 * NOT HttpOnly — just a client-accessible flag for route protection.
 * The accessToken cookie is now set by the backend as HttpOnly.
 */
function setSessionCookie() {
  if (typeof document === 'undefined') return;
  // 30 days, same as refresh token TTL
  document.cookie = 'session=1; path=/; max-age=2592000; SameSite=Lax';
}

/** Clears session cookie on logout. The HttpOnly accessToken cookie is cleared by the backend. */
function clearSessionCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'session=; path=/; max-age=0; SameSite=Lax';
}

/** Zustand auth store with localStorage persistence and cookie-based session tracking. */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, refreshToken) => {
        localStorage.setItem('refreshToken', refreshToken);
        setSessionCookie();
        set({ user, refreshToken, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('refreshToken');
        clearSessionCookie();
        set({ user: null, refreshToken: null, isAuthenticated: false });
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
