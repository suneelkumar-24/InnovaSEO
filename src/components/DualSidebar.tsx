'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
  ChevronDown,
  Clock,
  Layers,
  Flame,
  Plus,
  ArrowUpRight,
  Filter,
  X,
  Target,
  Sparkle,
} from 'lucide-react';
import { NAVIGATION_MODULES, PrimaryModule, SubNavItem } from '@/lib/navigationConfig';
import { useLivePulse } from './LivePulseProvider';

export default function DualSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isRecalculating, pulseCountdown, autoSyncEnabled } = useLivePulse();

  // Active primary module state (Default to main suite 'niche-hunter')
  const [activeModuleId, setActiveModuleId] = useState<string>('niche-hunter');
  // Secondary sidebar collapse state
  const [isSubCollapsed, setIsSubCollapsed] = useState<boolean>(false);
  // Search filter inside secondary sidebar
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Recent research dossiers for quick navigation
  const [recentDossiers, setRecentDossiers] = useState<Array<{ id: string; nicheName: string; score: number; country: string }>>([]);

  // Fetch recent dossiers for quick access in sub-sidebar
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch('/api/research');
        if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
          const data = await res.json();
          if (data.success && Array.isArray(data.researches)) {
            setRecentDossiers(
              data.researches.slice(0, 5).map((r: any) => ({
                id: r.id,
                nicheName: r.nicheName || r.seedKeyword,
                score: r.viabilityScore || 0,
                country: r.targetCountry || 'US',
              }))
            );
          }
        }
      } catch (e) {
        // silent fallback
      }
    };
    fetchRecent();
  }, [pathname]);

  const activeModule = useMemo(() => {
    return NAVIGATION_MODULES.find((m) => m.id === activeModuleId) || NAVIGATION_MODULES[0];
  }, [activeModuleId]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      router.push('/login');
      router.refresh();
    } catch (e) {
      router.push('/login');
    }
  };

  // Filter items in sub-sidebar if search query is typed
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return activeModule.sections;
    const q = searchQuery.toLowerCase();
    return activeModule.sections
      .map((sec) => ({
        ...sec,
        items: sec.items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            (item.description && item.description.toLowerCase().includes(q))
        ),
      }))
      .filter((sec) => sec.items.length > 0);
  }, [activeModule, searchQuery]);

  // Hide completely on landing page or login page (called after all hooks to comply with React rules)
  if (pathname === '/' || pathname === '/login') {
    return null;
  }

  return (
    <div className="flex z-30 select-none shrink-0 h-screen sticky top-0">
      {/* ========================================================================= */}
      {/* 1. PRIMARY RAIL (Leftmost Icon Bar - SEMrush Style)                       */}
      {/* ========================================================================= */}
      <aside className="w-[72px] bg-slate-900 border-r border-slate-800 flex flex-col justify-between items-center py-4 text-slate-400">
        <div className="flex flex-col items-center w-full space-y-4">
          {/* Logo / Monogram */}
          <Link
            href="/"
            title="Niche Hunter"
            className="group relative flex items-center justify-center"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-700 to-indigo-600 p-0.5 shadow-lg shadow-purple-900/50 group-hover:scale-105 transition-transform flex items-center justify-center text-white font-black text-base tracking-wider border border-purple-400/20">
              NH
            </div>
            {/* Tooltip */}
            <span className="absolute left-16 px-2.5 py-1 bg-slate-800 text-white text-xs font-semibold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-slate-700 z-50">
              Niche Hunter Core
            </span>
          </Link>

          {/* Quick Action: New Research Run Button */}
          <Link
            href="/research/new"
            title="Start New Research Run"
            className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-600/30 transition transform active:scale-95 group relative"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span className="absolute left-16 px-2.5 py-1 bg-purple-900 text-purple-100 text-xs font-semibold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-purple-700 z-50">
              + New Research Run
            </span>
          </Link>

          <div className="w-8 h-[1px] bg-slate-800" />

          {/* Primary Navigation Suite Icons */}
          <nav className="flex flex-col items-center space-y-2 w-full px-2">
            {NAVIGATION_MODULES.map((mod) => {
              const Icon = mod.icon;
              const isCurrentModule = activeModuleId === mod.id;

              return (
                <button
                  key={mod.id}
                  onClick={() => {
                    setActiveModuleId(mod.id);
                    if (isSubCollapsed) setIsSubCollapsed(false);
                  }}
                  title={mod.name}
                  className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group relative ${
                    isCurrentModule
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-inner'
                      : 'hover:bg-slate-800/80 hover:text-slate-200 text-slate-400'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isCurrentModule ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="text-[9px] font-bold tracking-tight uppercase leading-none">
                    {mod.shortLabel}
                  </span>

                  {/* Active Rail Indicator Bar */}
                  {isCurrentModule && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-purple-500 rounded-r-full shadow-sm" />
                  )}

                  {/* Tooltip on Hover */}
                  <div className="absolute left-16 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-slate-700 z-50 flex items-center gap-2">
                    <span className="font-bold text-purple-300">{mod.name}</span>
                    {mod.isUpcoming && (
                      <span className="text-[9px] bg-purple-900/80 text-purple-300 px-1.5 py-0.5 rounded font-bold uppercase">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Primary Rail Footer: Live Status & Profile */}
        <div className="flex flex-col items-center space-y-3 w-full pt-4 border-t border-slate-800/80">
          {/* Engine Live Beacon */}
          <div
            title={`SEBT-NEXT Live: ${isRecalculating ? 'Recalculating' : autoSyncEnabled ? 'Pulse Active' : 'Paused'}`}
            className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-xs text-slate-300 relative group cursor-pointer"
          >
            <Zap className={`w-4 h-4 ${isRecalculating ? 'text-amber-400 animate-spin' : 'text-purple-400'}`} />
            <span
              className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                isRecalculating ? 'bg-amber-400 animate-ping' : autoSyncEnabled ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            {/* Tooltip */}
            <div className="absolute left-16 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-slate-700 z-50">
              <span className="text-purple-300 font-bold">SEBT-NEXT Live Pulse:</span>{' '}
              {isRecalculating ? 'Calculating...' : `${pulseCountdown}s countdown`}
            </div>
          </div>

          {/* User Avatar & Logout */}
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-rose-900/30 hover:border-rose-500/40 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-rose-400 transition group relative"
          >
            <LogOut className="w-4 h-4" />
            <div className="absolute left-16 px-3 py-1.5 bg-slate-800 text-rose-300 text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-slate-700 z-50">
              Sign Out
            </div>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. SECONDARY SUB-SIDEBAR (Contextual Sub-Menu - SEMrush Style)             */}
      {/* ========================================================================= */}
      {!isSubCollapsed && (
        <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between min-h-screen text-slate-700 shadow-sm transition-all duration-200">
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Header of Active Module with Collapse Trigger */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between sticky top-0 z-10 backdrop-blur">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-600 block">
                  MODULE SUITE
                </span>
                <h2 className="text-sm font-bold text-slate-900 truncate tracking-tight">
                  {activeModule.name}
                </h2>
              </div>
              <button
                onClick={() => setIsSubCollapsed(true)}
                title="Collapse Sub-Sidebar"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Quick In-Sidebar Search / Filter Bar */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter tools & workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-purple-300 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Roadmap / Coming soon banner if upcoming module selected */}
            {activeModule.isUpcoming && (
              <div className="m-3 p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-900">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Roadmap Feature</span>
                </div>
                <p className="text-[11px] text-purple-700 leading-relaxed">
                  {activeModule.description}
                </p>
              </div>
            )}

            {/* Categorized Sub-Menu Items */}
            <div className="p-3 space-y-4 flex-1">
              {filteredSections.map((section, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>{section.title}</span>
                  </div>

                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      // Determine if this item is currently active based on pathname
                      const isItemActive =
                        pathname === item.href ||
                        (item.href !== '/dashboard' &&
                          !item.href.includes('?') &&
                          pathname.startsWith(item.href));

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                            isItemActive
                              ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200/80 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isItemActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-slate-600'
                              }`}
                            />
                            <span className="truncate">{item.title}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-tight shrink-0 ${
                                item.badgeColor === 'purple'
                                  ? 'bg-purple-100 text-purple-700'
                                  : item.badgeColor === 'emerald'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : item.badgeColor === 'amber'
                                  ? 'bg-amber-100 text-amber-800'
                                  : item.badgeColor === 'rose'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Dynamic Recent Research Dossiers (SEMrush Style Quick Jump) */}
              {activeModuleId === 'niche-hunter' && recentDossiers.length > 0 && !searchQuery && (
                <div className="space-y-1 pt-3 border-t border-slate-100">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>RECENT RESEARCH RUNS</span>
                    <Clock className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    {recentDossiers.map((r) => {
                      const isDossierActive = pathname === `/research/${r.id}`;
                      return (
                        <Link
                          key={r.id}
                          href={`/research/${r.id}`}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                            isDossierActive
                              ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                            <span className="truncate font-medium">{r.nicheName}</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-500 ml-2">
                            {r.score}/100
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sub-Sidebar Footer Info Card */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-purple-900">SEBT-NEXT Engine</p>
                <p className="text-[10px] text-purple-700">12-Point Checklist Active</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                v2.0
              </span>
            </div>
          </div>
        </aside>
      )}

      {/* Expand Handle when Sub-Sidebar is Collapsed */}
      {isSubCollapsed && (
        <button
          onClick={() => setIsSubCollapsed(false)}
          title="Expand Sub-Sidebar"
          className="w-4 bg-slate-100 hover:bg-purple-100 border-r border-slate-200 flex items-center justify-center text-slate-400 hover:text-purple-600 transition"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
