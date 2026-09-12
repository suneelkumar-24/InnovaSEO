'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  Bookmark,
  GitCompare,
  Settings,
  ShieldCheck,
  Zap,
  LogOut,
  ExternalLink,
  Layers,
  Sparkles,
  Store,
  Radio,
  History,
} from 'lucide-react';
import { useLivePulse } from './LivePulseProvider';
import { useAuth } from './AuthProvider';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isRecalculating, pulseCountdown, autoSyncEnabled } = useLivePulse();
  const { user, isAdmin, logout } = useAuth();

  // Hide sidebar on public landing page and login page for full-width layout
  if (pathname === '/' || pathname === '/login') {
    return null;
  }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Hunter Studio', href: '/research/new', icon: Target },
    { label: 'Autopilot Radar', href: '/autopilot', icon: Radio },
    { label: 'Search History', href: '/history', icon: History },
    { label: 'Saved Vault', href: '/saved', icon: Bookmark },
    { label: 'Compare Niches', href: '/compare', icon: GitCompare },
    { label: 'Settings & APIs', href: '/settings', icon: Settings },
    ...(isAdmin ? [{ label: 'Admin Control', href: '/admin', icon: ShieldCheck }] : []),
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between p-5 min-h-screen text-slate-700 select-none z-30 shadow-sm">
      <div>
        {/* Brand Logo (RankKW Stylized Monogram in Purple) */}
        <Link href="/" className="flex items-center gap-3 px-2 py-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-700 to-indigo-700 p-0.5 shadow-lg shadow-purple-600/20 group-hover:scale-105 transition-transform flex items-center justify-center text-white font-black text-lg">
            NH
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center">
              niche<span className="text-purple-600">hunter</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
              PRE-PROCESS ENGINE
            </span>
          </div>
        </Link>

        {/* Quick Action Button in Sidebar */}
        <div className="mt-5 px-1">
          <Link
            href="/research/new"
            className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 transition active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Research Run</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200/80 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Account / Engine Status */}
      <div className="pt-4 border-t border-slate-200/80 space-y-3">
        {/* Engine Status Badge with Live Pulse */}
        <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-semibold text-xs flex items-center gap-1.5">
              <Zap className={`w-4 h-4 ${isRecalculating ? 'text-amber-500 animate-spin' : 'text-purple-600'}`} />
              <span>SEBT-NEXT Live</span>
            </span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full transition ${
                isRecalculating
                  ? 'bg-amber-100 text-amber-800 animate-pulse border border-amber-300'
                  : autoSyncEnabled
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isRecalculating ? 'bg-amber-500' : autoSyncEnabled ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
                }`}
              />
              {isRecalculating ? 'Calculating...' : autoSyncEnabled ? `${pulseCountdown}s` : 'Paused'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Background Drift: Active</span>
            <span className="font-mono text-purple-700 font-bold">15-Phases</span>
          </div>
        </div>

        {/* User profile & Logout */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
              {user?.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate">
                {user?.name || 'Authorized Member'}
              </p>
              <p className="text-[10px] text-purple-600 font-bold uppercase truncate">
                {isAdmin ? 'Admin' : '100% Free Pro'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

