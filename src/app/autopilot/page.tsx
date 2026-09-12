'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  Sparkles,
  Zap,
  Radio,
  ShieldCheck,
  DollarSign,
  Loader2,
  Terminal,
  Store,
  ChevronRight,
  ChevronDown,
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
  { id: 'challenger_brands', label: 'Challenger Menus', icon: Flame, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'fast_mover_viral_seeds', label: 'Fast-Mover Seeds', icon: Zap, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { id: 'programmatic_data', label: 'Programmatic Specs', icon: Database, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'micro_calculators', label: 'Utility Calculators', icon: Calculator, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'nano_affiliate', label: 'Nano-Affiliate', icon: Store, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'marketplace_templates', label: 'Marketplace Exits', icon: ShieldCheck, color: 'text-rose-600 bg-rose-50 border-rose-200' },
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
  const [showLogs, setShowLogs] = useState(false);

  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchAutopilotStatus = async (signal?: AbortSignal) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const res = await fetch('/api/autopilot', {
        signal: signal || abortControllerRef.current?.signal,
      });
      if (!res.ok) return;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      const data = await res.json();
      if (data.success) {
        setStatus(data);
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      console.warn('Autopilot status sync warning:', e?.message || e);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetchAutopilotStatus(controller.signal);

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
        fetchAutopilotStatus();
      }
    } catch (e: any) {
      console.warn('Toggle autopilot failed:', e?.message || e);
    }
  };

  const handleTriggerRunNow = async (opts: { forceAi?: boolean; batchSize?: number } = {}) => {
    const batchSize = opts.batchSize || selectedBatchSize;
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
      if (!res.ok) return;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;

      clearInterval(progInterval);
      setBatchProgress(100);
      const data = await res.json();
      if (data.success) {
        fetchAutopilotStatus();
      } else {
        alert(data.error || 'Autopilot run failed');
      }
    } catch (e: any) {
      clearInterval(progInterval);
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
        title="AI Autopilot Radar"
        subtitle="Autonomous 24/7 Tier 1 SERP Hunter"
        showSearchBar={false}
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'AI Autopilot Radar', href: '/autopilot' },
        ]}
      >
        <div className="flex items-center gap-2 shrink-0">
          {/* Autopilot Status Badge & Toggle */}
          <button
            onClick={handleToggleAutopilot}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              status?.active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
            }`}
            title={status?.active ? 'Click to pause autopilot' : 'Click to activate autopilot'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                status?.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{status?.active ? 'Autopilot Active' : 'Paused'}</span>
          </button>

          {/* Compact Trigger Run Button */}
          <button
            onClick={() => handleTriggerRunNow()}
            disabled={runningBatch}
            className="px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
            title="Hunt next batch of micro-niches"
          >
            {runningBatch ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            )}
            <span>{runningBatch ? `${batchProgress}%` : 'Hunt Batch'}</span>
          </button>
        </div>
      </Header>

      <main className="flex-1 p-5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* 1. Autonomous Command Deck & Telemetry Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-lg space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Autonomous Scouting Protocol Active
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">Tier 1 Scope: US, UK, DE, CA, AU</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-serif">
                Self-Operating Niche Discovery Radar
              </h2>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Autonomous agent scouting challenger brands, programmatic specs, and utility tools for low-DR (0–15) SERP vulnerabilities.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => handleTriggerRunNow({ forceAi: true, batchSize: 5 })}
                disabled={runningBatch}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>{runningBatch ? 'Brainstorming...' : 'AI Brainstorm (5 Niches)'}</span>
              </button>

              <button
                onClick={() => handleTriggerRunNow()}
                disabled={runningBatch}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{runningBatch ? `${batchProgress}% Scouting...` : 'Instant Scout (3)'}</span>
              </button>
            </div>
          </div>

          {/* Progress Bar when running */}
          {runningBatch && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Scouting SERP anomalies across Tier 1 indexes...</span>
                <span>{batchProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${batchProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Telemetry Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <Radio className="w-3 h-3 text-purple-400" />
                <span>Discovered</span>
              </div>
              <div className="text-xl font-black text-white mt-1">
                {status?.totalDiscovered ?? 0}
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>STRONG GO (≥80)</span>
              </div>
              <div className="text-xl font-black text-emerald-400 mt-1">
                {status?.highViabilityCount ?? 0}
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                <span>Low-DR Gaps</span>
              </div>
              <div className="text-xl font-black text-indigo-300 mt-1">
                {status?.lowDrAnomalyCount ?? 0}
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <DollarSign className="w-3 h-3 text-amber-400" />
                <span>Target RPM</span>
              </div>
              <div className="text-xl font-black text-amber-400 mt-1">
                $35 – $52
              </div>
            </div>
          </div>
        </div>

        {/* 2. Sleek Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl px-4 py-3 shadow-xs">
          {/* Sector Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            <button
              onClick={() => setFilterSector('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterSector === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              All Sectors ({discoveries.length})
            </button>
            {SECTORS.map((s) => {
              const count = discoveries.filter((d) => d.sector === s.id).length;
              const isActive = filterSector === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setFilterSector(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                  }`}
                >
                  <span>{s.label}</span>
                  <span className={`text-[10px] ${isActive ? 'text-purple-200' : 'text-slate-400'}`}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Right Controls: Batch Size & Clear Stream */}
          <div className="flex items-center gap-2 shrink-0 justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>Batch:</span>
              <select
                value={selectedBatchSize}
                onChange={(e) => setSelectedBatchSize(Number(e.target.value))}
                className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 cursor-pointer"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
            </div>
            {discoveries.length > 0 && (
              <button
                onClick={handleClearStream}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                title="Clear Discovered Stream"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Discovered Opportunities Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Auto-Discovered High-Yield Opportunities ({filteredDiscoveries.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Sorted by discovery recency</span>
          </div>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-xs text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
              Loading autonomous radar feed...
            </div>
          ) : filteredDiscoveries.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
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
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Launch First Autonomous Hunt</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredDiscoveries.map((item) => {
                const isStrongGo = item.verdict === 'STRONG GO' || item.viabilityScore >= 80;
                const isMaybe = !isStrongGo && (item.verdict === 'MAYBE' || item.viabilityScore >= 60);

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200/80 hover:border-purple-300 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                            {item.sectorLabel}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {item.targetCountry}
                          </span>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-xs border ${
                            isStrongGo
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isMaybe
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {item.viabilityScore}/100 · {item.verdict}
                        </span>
                      </div>

                      {/* Niche Title & Seed */}
                      <div>
                        <h4 className="text-lg font-serif font-bold text-slate-900 group-hover:text-purple-700 transition">
                          {item.nicheName}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs font-mono text-slate-500 truncate">
                            "{item.seedKeyword}"
                          </span>
                          <button
                            onClick={() => handleCopy(item.seedKeyword)}
                            className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
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
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Demand</span>
                          <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                            {item.monthlySearchVolume.toLocaleString()} SV/mo
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Monthly Earnings</span>
                          <span className="text-xs font-bold text-emerald-600 mt-0.5 block">
                            {item.estimatedMonthlyRevenue}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Weak Competitors</span>
                          <span className="text-xs font-bold text-purple-700 mt-0.5 block">
                            {item.weakCompetitorCount} Sites (Lowest DR {item.standoutWeakDr})
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Target RPM Range</span>
                          <span className="text-xs font-bold text-indigo-700 mt-0.5 block">
                            {item.estimatedRpm}
                          </span>
                        </div>
                      </div>

                      {/* Why Untapped Callout */}
                      <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-slate-700 space-y-0.5">
                        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                          WHY THIS NICHE IS UNTAPPED:
                        </span>
                        <p className="leading-relaxed text-slate-600 text-[11px]">{item.whyItIsUntapped}</p>
                      </div>

                      {/* Recommended Asset */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-500 font-medium text-[11px]">Recommended Asset:</span>
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          {item.recommendedAssetType}
                        </span>
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
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
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition group-hover:scale-102 cursor-pointer"
                      >
                        <span>Open Full 15-Phase Dossier</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Live Autonomous Execution Stream (Collapsible Drawer) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md text-slate-300 font-mono text-xs">
          <div
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                Autonomous Radar Live Execution Stream
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md">
                {status?.liveLogs?.length || 0} events
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Daemon Active
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showLogs ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {showLogs && (
            <div className="h-44 overflow-y-auto space-y-1.5 pr-2 mt-3 pt-3 border-t border-slate-800 scrollbar-thin">
              {(status?.liveLogs || []).map((log) => (
                <div key={log.id} className="flex items-start gap-2 text-[11px] leading-relaxed">
                  <span className="text-slate-500 shrink-0">
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
          )}
        </div>
      </main>
    </div>
  );
}
