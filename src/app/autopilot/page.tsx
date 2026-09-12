'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  Sparkles,
  Zap,
  Radio,
  Sliders,
  ShieldCheck,
  TrendingUp,
  Bookmark,
  RefreshCw,
  ExternalLink,
  Layers,
  Globe,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Terminal,
  Store,
  ChevronRight,
  Database,
  Calculator,
  Flame,
  Copy,
  Check,
  Filter,
  Trash2,
} from 'lucide-react';
import {
  AutopilotDiscoveredItem,
  AutopilotStatus,
  AutopilotSector,
} from '@/lib/providers/types';

const SECTORS: Array<{ id: AutopilotSector; label: string; icon: any; color: string }> = [
  { id: 'challenger_brands', label: 'Challenger Brand Menus', icon: Flame, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'fast_mover_viral_seeds', label: 'Fast-Mover Viral Seeds', icon: Zap, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { id: 'programmatic_data', label: 'Programmatic Specs & Dimensions', icon: Database, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'micro_calculators', label: 'Micro Utility Calculators', icon: Calculator, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'nano_affiliate', label: 'Nano-Affiliate Gear', icon: Store, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'marketplace_templates', label: 'Marketplace Exit Blueprints', icon: Layers, color: 'text-rose-600 bg-rose-50 border-rose-200' },
];

export default function AutopilotRadarPage() {
  const router = useRouter();

  const [status, setStatus] = useState<AutopilotStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningBatch, setRunningBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [selectedBatchSize, setSelectedBatchSize] = useState(3);
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [copiedSeed, setCopiedSeed] = useState<string | null>(null);

  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchAutopilotStatus = async (signal?: AbortSignal) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    console.log('%c[AUTOPILOT 📡]%c Syncing radar status...', 'color: #8b5cf6; font-weight: bold;', 'color: #6d28d9;');
    try {
      const res = await fetch('/api/autopilot', {
        signal: signal || abortControllerRef.current?.signal,
      });
      if (!res.ok) {
        console.warn(`%c[AUTOPILOT ⚠️]%c Status fetch returned HTTP ${res.status}`, 'color: #f59e0b; font-weight: bold;', 'color: #b45309;');
        return;
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      const data = await res.json();
      if (data.success) {
        setStatus(data);
        console.log(
          `%c[AUTOPILOT ✅]%c Radar status synced: ${data.recentDiscoveries?.length || 0} discoveries displayed, Active: ${data.active}`,
          'color: #10b981; font-weight: bold;',
          'color: #047857;'
        );
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      console.warn('[AUTOPILOT ⚠️] Status sync warning (offline or server retrying):', e?.message || e);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetchAutopilotStatus(controller.signal);

    // Poll status periodically when document is visible
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchAutopilotStatus(abortControllerRef.current?.signal);
    }, 30000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  const handleToggleAutopilot = async () => {
    console.log('%c[AUTOPILOT 🔄 TOGGLE]%c Toggling background autonomous daemon...', 'color: #ec4899; font-weight: bold;', 'color: #be185d;');
    try {
      const res = await fetch('/api/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle' }),
      });
      if (!res.ok) return;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      const data = await res.json();
      if (data.success) {
        console.log('%c[AUTOPILOT 🔄 TOGGLE ✅]%c New daemon status:', 'color: #10b981; font-weight: bold;', 'color: #047857;', data.config?.enabled ? 'Active' : 'Paused');
        fetchAutopilotStatus();
      }
    } catch (e: any) {
      console.warn('[AUTOPILOT ❌] Toggle autopilot failed:', e?.message || e);
    }
  };

  const handleTriggerRunNow = async (opts: { forceAi?: boolean; batchSize?: number } = {}) => {
    const batchSize = opts.batchSize || selectedBatchSize;
    console.log(
      `%c[AUTOPILOT ⚡ RUN BATCH]%c Scouting ${batchSize} micro-niches (AI Mode: ${Boolean(opts.forceAi)}, Sector: ${filterSector})...`,
      'background: #8b5cf6; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px;',
      'color: #6d28d9; font-weight: bold;'
    );
    setRunningBatch(true);
    setBatchProgress(10);

    const progInterval = setInterval(() => {
      setBatchProgress((prev) => (prev < 90 ? prev + 15 : prev));
    }, 1200);

    try {
      const res = await fetch('/api/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run_now',
          batchSize,
          sector: filterSector !== 'all' ? filterSector : undefined,
          forceAiDiscovery: Boolean(opts.forceAi),
        }),
      });
      if (!res.ok) {
        console.error(`%c[AUTOPILOT ❌]%c Batch run returned HTTP ${res.status}`, 'color: #ef4444; font-weight: bold;', 'color: #b91c1c;');
        return;
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      
      clearInterval(progInterval);
      setBatchProgress(100);
      const data = await res.json();
      if (data.success) {
        console.log(
          `%c[AUTOPILOT ⚡ COMPLETED ✅]%c Discovered ${data.discoveredItems?.length || 0} items! Summary: ${data.summary}`,
          'background: #10b981; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px;',
          'color: #047857;'
        );
        fetchAutopilotStatus();
      } else {
        console.warn('[AUTOPILOT ⚠️] Batch returned error:', data.error);
        alert(data.error || 'Autopilot run failed');
      }
    } catch (e: any) {
      clearInterval(progInterval);
      console.error('[AUTOPILOT ❌] Autopilot run threw exception:', e?.message || e);
      alert(e?.message || 'Error running autopilot batch');
    } finally {
      setTimeout(() => {
        setRunningBatch(false);
        setBatchProgress(0);
      }, 800);
    }
  };

  const handleClearStream = async () => {
    if (!confirm('Are you sure you want to clear the discovered radar stream?')) return;
    try {
      await fetch('/api/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      });
      fetchAutopilotStatus();
    } catch (e: any) {
      console.warn('Clear stream failed:', e?.message || e);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSeed(text);
    setTimeout(() => setCopiedSeed(null), 2000);
  };

  const discoveries = status?.recentDiscoveries || [];
  const filteredDiscoveries = discoveries.filter((item) => {
    if (filterSector !== 'all' && item.sector !== filterSector) return false;
    if (filterTier === 'tier1' && !item.countryTier.includes('Tier 1')) return false;
    if (filterTier === 'tier2' && !item.countryTier.includes('Tier 2')) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen">
      <Header
        title="Autonomous Autopilot Radar"
        subtitle="Self-operating micro-niche hunting engine scouting Tier 1 markets for DR 0-15 anomalies"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'AI Autopilot Radar', href: '/autopilot' },
        ]}
      >
        <div className="flex items-center gap-2 shrink-0">
          {/* Autopilot Status Badge & Toggle */}
          <button
            onClick={handleToggleAutopilot}
            className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 transition shadow-xs ${
              status?.active
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
            }`}
            title={status?.active ? 'Click to pause autopilot' : 'Click to activate autopilot'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                status?.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{status?.active ? 'Autopilot Active' : 'Autopilot Paused'}</span>
          </button>

          {/* Compact Trigger Run Button */}
          <button
            onClick={() => handleTriggerRunNow()}
            disabled={runningBatch}
            className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 disabled:opacity-50 shrink-0"
            title="Hunt next batch of micro-niches"
          >
            {runningBatch ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{runningBatch ? `${batchProgress}%` : 'Hunt Batch'}</span>
          </button>
        </div>
      </Header>

      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* 1. Autonomous Telemetry & KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Auto-Discovered Niches</p>
              <p className="text-2xl font-black text-slate-900">{status?.totalDiscovered ?? 0}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">STRONG GO Gems (&ge;80)</p>
              <p className="text-2xl font-black text-emerald-600">{status?.highViabilityCount ?? 0}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Low-DR SERP Anomalies</p>
              <p className="text-2xl font-black text-indigo-600">{status?.lowDrAnomalyCount ?? 0}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tier 1 Target RPM</p>
              <p className="text-2xl font-black text-slate-900">$35 - $52</p>
            </div>
          </div>
        </div>

        {/* 2. Autonomous Radar Active Sweep Banner */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl text-white">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold uppercase">
                <Radio className="w-3.5 h-3.5 text-purple-300 animate-spin" />
                <span>Autonomous Scouting Protocol Active</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Self-Operating Niche Discovery Radar
              </h2>
              <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
                The autonomous agent continuously analyzes challenger brand menus, programmatic specs, single-page calculators, and Flippa multiple patterns. Low-competition DR 0-15 anomalies are validated through our 15-phase engine automatically.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl text-left space-y-1">
                <span className="text-[10px] text-purple-200 uppercase font-bold block">Autonomous Scan Scope</span>
                <span className="text-xs font-bold text-white block">US, UK, Germany, Canada, Australia</span>
                <span className="text-[10px] text-emerald-300 font-semibold block">✓ 10+ Diverse Non-Repetitive Sectors</span>
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleTriggerRunNow({ forceAi: true, batchSize: 5 })}
                  disabled={runningBatch}
                  className="w-full sm:w-auto px-5 py-3 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xl hover:brightness-105 transition active:scale-95 whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4 text-purple-900" />
                  <span>{runningBatch ? 'AI Brainstorming...' : '✨ AI Brainstorm 5 Novel Niches'}</span>
                </button>

                <button
                  onClick={() => handleTriggerRunNow()}
                  disabled={runningBatch}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{runningBatch ? 'Scouting Market Index...' : '⚡ Hunt Next Batch Now'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Running Progress Bar */}
          {runningBatch && (
            <div className="w-full bg-purple-950/60 h-2 rounded-full overflow-hidden mt-6 border border-purple-700/50">
              <div
                className="bg-gradient-to-r from-purple-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${batchProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* 3. Sector & Tier Filter Strip */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Autonomous Radar Filters</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                <span>Batch Size:</span>
                <select
                  value={selectedBatchSize}
                  onChange={(e) => setSelectedBatchSize(Number(e.target.value))}
                  className="bg-[#faf9f6] border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value={3}>3 Niches</option>
                  <option value={5}>5 Niches</option>
                  <option value={10}>10 Niches</option>
                </select>
              </div>

              {discoveries.length > 0 && (
                <button
                  onClick={handleClearStream}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Clear Discovered Stream"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Sector Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterSector('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                filterSector === 'all'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              All Sectors ({discoveries.length})
            </button>

            {SECTORS.map((s) => {
              const Icon = s.icon;
              const count = discoveries.filter((d) => d.sector === s.id).length;
              const isActive = filterSector === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setFilterSector(s.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{s.label}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Auto-Discovered Micro-Niches Stream Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Auto-Discovered High-Yield Opportunities ({filteredDiscoveries.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Sorted by discovery recency</span>
          </div>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-xs text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
              Loading autonomous radar feed...
            </div>
          ) : filteredDiscoveries.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
              <Radio className="w-10 h-10 text-purple-400 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">Radar Stream Waiting for Discovery Run</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click the button below to launch our autonomous scouting agent across Tier 1 search indexes and uncover high-margin micro-niches.
                </p>
              </div>
              <button
                onClick={() => handleTriggerRunNow()}
                disabled={runningBatch}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Launch First Autonomous Hunt</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDiscoveries.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border-2 border-slate-200/90 hover:border-purple-400 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm hover:shadow-xl transition flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                          {item.sectorLabel}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {item.targetCountry}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full font-bold text-xs ${
                            item.verdict === 'STRONG GO'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-teal-100 text-teal-800 border border-teal-300'
                          }`}
                        >
                          {item.viabilityScore}/100 · {item.verdict}
                        </span>
                      </div>
                    </div>

                    {/* Niche Title & Seed */}
                    <div>
                      <h4 className="text-xl font-serif font-bold text-slate-900 group-hover:text-purple-700 transition">
                        {item.nicheName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-slate-500 truncate">
                          "{item.seedKeyword}"
                        </span>
                        <button
                          onClick={() => handleCopy(item.seedKeyword)}
                          className="p-1 text-slate-400 hover:text-slate-700 transition"
                          title="Copy Seed Keyword"
                        >
                          {copiedSeed === item.seedKeyword ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 4 KPI Metrics Mini-Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#faf9f6] p-3 rounded-2xl border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Demand</span>
                        <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                          {item.monthlySearchVolume.toLocaleString()} SV/mo
                        </span>
                      </div>

                      <div className="bg-[#faf9f6] p-3 rounded-2xl border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Monthly Earnings</span>
                        <span className="text-sm font-bold text-emerald-600 mt-0.5 block">
                          {item.estimatedMonthlyRevenue}
                        </span>
                      </div>

                      <div className="bg-[#faf9f6] p-3 rounded-2xl border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Weak Competitors</span>
                        <span className="text-sm font-bold text-purple-700 mt-0.5 block">
                          {item.weakCompetitorCount} Sites (Lowest DR {item.standoutWeakDr})
                        </span>
                      </div>

                      <div className="bg-[#faf9f6] p-3 rounded-2xl border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Target RPM Range</span>
                        <span className="text-sm font-bold text-indigo-700 mt-0.5 block">
                          {item.estimatedRpm}
                        </span>
                      </div>
                    </div>

                    {/* Why Untapped Callout */}
                    <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs text-slate-700 space-y-1">
                      <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                        WHY THIS NICHE IS UNTAPPED:
                      </span>
                      <p className="leading-relaxed text-slate-600">{item.whyItIsUntapped}</p>
                    </div>

                    {/* Recommended Asset */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500 font-medium">Recommended Asset Type:</span>
                      <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {item.recommendedAssetType}
                      </span>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400">
                      Discovered {new Date(item.discoveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <button
                      onClick={() => {
                        console.log(
                          `%c[DOSSIER 📂]%c Opening full 15-phase dossier for ID: ${item.researchId} ("${item.nicheName}")`,
                          'color: #7c3aed; font-weight: bold;',
                          'color: #5b21b6;'
                        );
                        router.push(`/research/${item.researchId}`);
                      }}
                      className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition group-hover:scale-105 cursor-pointer"
                    >
                      <span>Open Full 15-Phase Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Live Autonomous Agent Log Terminal */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl text-slate-300 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                Autonomous Radar Live Execution Stream
              </span>
            </div>
            <span className="text-[11px] text-slate-500">Autonomous Daemon Active</span>
          </div>

          <div className="h-44 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
            {(status?.liveLogs || []).map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 text-[11px] leading-relaxed">
                <span className="text-slate-500 flex-shrink-0">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                <span
                  className={
                    log.level === 'success'
                      ? 'text-emerald-400'
                      : log.level === 'warn'
                      ? 'text-amber-400'
                      : 'text-slate-300'
                  }
                >
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
