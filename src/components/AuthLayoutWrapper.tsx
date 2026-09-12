'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import DualSidebar from './DualSidebar';
import { LivePulseProvider } from './LivePulseProvider';
import { Loader2 } from 'lucide-react';

export default function AuthLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      const redirectParam = pathname === '/' ? '' : `?redirect=${encodeURIComponent(pathname)}`;
      router.replace(`/login${redirectParam}`);
    }
  }, [loading, user, isLoginPage, pathname, router]);

  // 1. If currently on Login page, render only the login view without sidebar
  if (isLoginPage) {
    return (
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#faf9f6]">
        {children}
      </div>
    );
  }

  // 2. While verifying authentication, block ALL dashboard/tool views and sidebars
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#faf9f6] text-slate-700">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-700 p-0.5 shadow-xl shadow-purple-600/20 mb-4 flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-purple-700 font-black text-xl">
            NH
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
          <span>Verifying authorized workspace access...</span>
        </div>
      </div>
    );
  }

  // 3. If finished loading and still no user, DO NOT render dashboard or sidebar!
  if (!user) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#faf9f6] text-slate-700">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
          <span>Unauthorized. Redirecting to workspace login...</span>
        </div>
      </div>
    );
  }

  // 4. Authenticated: Render DualSidebar and Protected workspace view
  return (
    <LivePulseProvider>
      {/* SEMrush-Style Enterprise Dual Sidebar (Primary Rail + Contextual Sub-Sidebar) */}
      <DualSidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#faf9f6]">
        {children}
      </div>
    </LivePulseProvider>
  );
}
