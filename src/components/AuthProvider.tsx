'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/providers/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  credits: number;
  remainingMinutes: number;
  quotaExhausted: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; pendingApproval?: boolean }>;
  register: (name: string, email: string, password: string, reason?: string) => Promise<{ success: boolean; error?: string; pendingApproval?: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();
  const lastActivityRef = useRef<number>(Date.now());

  // Listen to user interaction (mouse, key, scroll, touch) to track active usage vs idle time
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
    };
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const isPublicPage = pathname === '/' || pathname === '/login';

  // Client-side guard: Protected pages require login, public pages (/ and /login) are accessible
  useEffect(() => {
    if (!loading && !user && !isPublicPage) {
      const redirectParam = `?redirect=${encodeURIComponent(pathname)}`;
      if (typeof window !== 'undefined') {
        window.location.replace(`/login${redirectParam}`);
      } else {
        router.replace(`/login${redirectParam}`);
      }
    }
  }, [loading, user, pathname, router, isPublicPage]);

  // Active Heartbeat Timer: Tracks active platform usage and proportionally updates credits
  useEffect(() => {
    if (!user || user.role === 'admin') return;

    const interval = setInterval(async () => {
      // 1. Only track if tab/window is actively visible
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }

      // 2. Only track if user had activity in the last 60 seconds (prevents deductions if user stepped away)
      const idleDuration = Date.now() - lastActivityRef.current;
      if (idleDuration > 60000) {
        return;
      }

      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'heartbeat', activeSeconds: 30 }),
        });

        if (res.status === 401) {
          // Token expired or session revoked
          setUser(null);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUser((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                credits: data.credits ?? prev.credits,
                remainingMinutes: data.remainingMinutes ?? prev.remainingMinutes,
                secondsUsedToday: data.secondsUsedToday ?? prev.secondsUsedToday,
              };
            });
          }
        }
      } catch (err) {
        // Silently ignore network hiccup during background heartbeat
      }
    }, 30000); // 30 seconds ping

    return () => clearInterval(interval);
  }, [user?.id, user?.role]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; pendingApproval?: boolean }> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Invalid credentials.',
          pendingApproval: data.pendingApproval || false,
        };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during sign in.' };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string; pendingApproval?: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name: name.trim(),
          email: email.trim(),
          password,
          reason: reason?.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed.' };
      }
      return {
        success: true,
        pendingApproval: data.pendingApproval || false,
        message: data.message,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch (err) {
      console.warn('Logout notice:', err);
    } finally {
      setUser(null);
      router.push('/login');
      router.refresh();
    }
  };

  const credits = user ? (user.role === 'admin' ? 999999 : (user.credits ?? 50)) : 0;
  const remainingMinutes = user
    ? (user.role === 'admin' ? 999999 : (user.remainingMinutes ?? Math.round(((user.credits ?? 50) / 50) * 75)))
    : 0;
  const quotaExhausted = Boolean(user && user.role !== 'admin' && credits <= 0);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin',
        credits,
        remainingMinutes,
        quotaExhausted,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {isPublicPage ? (
        children
      ) : loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#faf9f6]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">
              Verifying Authorization...
            </p>
          </div>
        </div>
      ) : !user ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#faf9f6]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">
              Redirecting to Login...
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
