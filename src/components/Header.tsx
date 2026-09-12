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
} from 'lucide-react';
import { useLivePulse } from './LivePulseProvider';

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

  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'keyword' | 'domain' | 'niche'>('keyword');
  const [selectedCountry, setSelectedCountry] = useState('US');

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
      <div className="h-14 px-6 flex items-center justify-between">
        <div className="flex flex-col justify-center">
          {/* SEMrush-style Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            {computedBreadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-300" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-purple-600 transition"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-600 font-semibold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Page Title & Subtitle */}
          {title && (
            <div className="flex items-center gap-2 mt-0.5">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <span className="text-xs text-slate-400 hidden sm:inline">
                  • {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Slot */}
        <div className="flex items-center gap-2.5">
          {children}
        </div>
      </div>
    </header>
  );
}
