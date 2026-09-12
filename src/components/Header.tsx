'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Plus,
  Search,
  Sparkles,
  Shield,
  ChevronRight,
  Globe,
  ArrowRight,
  Target,
  Flame,
  Zap,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useLivePulse } from './LivePulseProvider';
import { useAuth } from './AuthProvider';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  showSearchBar?: boolean;
  children?: React.ReactNode;
}

export default function Header({
  title,
  subtitle,
  breadcrumbs,
  showSearchBar = true,
  children,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isRecalculating } = useLivePulse();
  const { user, isAdmin, logout } = useAuth();

  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'keyword' | 'domain' | 'niche'>('keyword');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleQuickAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const cleanQuery = query.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    router.push(
      `/research/new?seed=${encodeURIComponent(cleanQuery)}&country=${selectedCountry}&mode=${searchMode}`
    );
  };

  // Generate automatic breadcrumbs if not provided
  const computedBreadcrumbs = breadcrumbs || [
    { label: 'Home', href: '/dashboard' },
    {
      label: pathname.startsWith('/history')
        ? 'Search & Discovery History'
        : pathname.startsWith('/autopilot')
        ? 'Autopilot Radar'
        : pathname.startsWith('/compare')
        ? 'Competitor Gap'
        : pathname.startsWith('/saved')
        ? 'Saved Vault'
        : pathname.startsWith('/settings')
        ? 'Settings & APIs'
        : pathname.startsWith('/admin')
        ? 'Admin Control'
        : pathname.startsWith('/research')
        ? 'Hunter Studio'
        : 'SEO & Niche Hunter',
      href: pathname,
    },
  ];

  return (
    <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur sticky top-0 z-20 shadow-xs">
      {/* Top Utility Bar: SEMrush-style Quick Analyze Bar */}
      {showSearchBar && (
        <div className="px-6 py-2.5 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          {/* SEMrush-style Global Search Box */}
          <form
            onSubmit={handleQuickAnalyze}
            className="flex items-center gap-1.5 bg-white border border-slate-200/90 hover:border-purple-300 focus-within:border-purple-500 rounded-xl p-1 shadow-xs transition-all max-w-2xl flex-1 min-w-[320px]"
          >
            {/* Mode Selector Dropdown */}
            <select
              value={searchMode}
              onChange={(e) => setSearchMode(e.target.value as any)}
              className="text-[11px] font-bold text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 py-1.5 px-2.5 rounded-lg border-none focus:ring-0 cursor-pointer outline-hidden shrink-0"
            >
              <option value="keyword">Seed Keyword</option>
              <option value="domain">Root Domain</option>
              <option value="niche">Micro-Niche</option>
            </select>

            {/* Input Field */}
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  searchMode === 'domain'
                    ? 'e.g. in-n-outmenus.com or starbuckspreise.de'
                    : searchMode === 'keyword'
                    ? 'e.g. mechanical keyboard switches or camping tent'
                    : 'e.g. coffee grinder under $100'
                }
                className="w-full text-xs text-slate-900 placeholder-slate-400 bg-transparent px-2.5 py-1 focus:outline-hidden"
              />
            </div>

            {/* Country Selector */}
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2 pr-1 shrink-0">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="text-[11px] font-bold text-slate-700 bg-transparent py-1 pr-1 border-none focus:ring-0 cursor-pointer outline-hidden"
              >
                <option value="US">US ($52 RPM)</option>
                <option value="UK">UK ($42 RPM)</option>
                <option value="CA">CA ($38 RPM)</option>
                <option value="AU">AU ($45 RPM)</option>
                <option value="DE">DE ($36 RPM)</option>
                <option value="Global">Global</option>
              </select>
            </div>

            {/* Analyze Action Button */}
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 hover:bg-purple-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95"
            >
              <span>Analyze</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </form>

          {/* Quick Shortcuts & Metrics */}
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/research/new?mode=anomaly"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-900 font-bold transition text-[11px]"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>DR 0-5 Anomalies</span>
            </Link>

            <Link
              href="/research/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Run</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Header Title & Breadcrumbs Row */}
      <div className="min-h-[3.5rem] py-2 px-6 flex items-center justify-between gap-4">
        <div className="flex flex-col justify-center min-w-0 shrink">
          {/* SEMrush-style Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium truncate">
            {computedBreadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-purple-600 transition truncate"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-600 font-semibold truncate">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Page Title & Subtitle */}
          {title && (
            <div className="flex items-center gap-2 mt-0.5 min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight shrink-0">
                {title}
              </h1>
              {subtitle && (
                <span className="text-xs text-slate-400 hidden xl:inline truncate max-w-md 2xl:max-w-xl">
                  • {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Slot */}
        <div className="flex items-center gap-2 shrink-0">
          {children}

          {/* User Credits & Time Badge */}
          {user && (
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shadow-xs ${
              isAdmin
                ? 'bg-purple-50 border-purple-200/90 text-purple-900'
                : (user.credits ?? 50) <= 5
                ? 'bg-rose-50 border-rose-200 text-rose-800 animate-pulse'
                : 'bg-purple-50 border-purple-200/90 text-purple-900'
            }`}>
              <Zap className={`w-3.5 h-3.5 ${isAdmin ? 'text-purple-600 fill-purple-600' : (user.credits ?? 50) <= 5 ? 'text-rose-600 fill-rose-600' : 'text-purple-600 fill-purple-600'}`} />
              <span>
                {isAdmin
                  ? 'Admin (Unlimited)'
                  : `${user.credits ?? 50} Credits`}
              </span>
            </div>
          )}

          {/* User Profile Pill & Dropdown */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 transition text-xs font-semibold text-slate-700 select-none"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shadow-xs">
                  {user.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline text-xs font-medium text-slate-800 max-w-[120px] truncate">
                  {user.name || user.email}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isAdmin ? 'Admin' : 'Free Pro'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200/90 shadow-xl p-3 space-y-3 z-50 text-xs">
                    {/* User Identity */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <p className="font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-slate-500 text-[11px] truncate">{user.email}</p>
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Daily Quota</span>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                          {isAdmin ? 'Unlimited' : `${user.credits ?? 50} Credits`}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between px-2 text-[11px] text-slate-600">
                      <span>Research Runs Done:</span>
                      <span className="font-bold text-purple-700 font-mono">
                        {user.apiUsageCount || 0}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-purple-700 hover:bg-purple-50 transition font-bold"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition w-full text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
