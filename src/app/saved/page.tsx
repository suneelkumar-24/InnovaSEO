'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import NotesModal from '@/components/NotesModal';
import { SavedNicheItem, SavedNicheStatus } from '@/lib/providers/types';
import { useLivePulse } from '@/components/LivePulseProvider';
import {
  Bookmark,
  GitCompare,
  Search,
  Tag,
  Trash2,
  Edit3,
  ExternalLink,
  Plus,
  Filter,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';

export default function SavedVaultPage() {
  const router = useRouter();
  const {
    savedNiches,
    isRecalculating,
    autoSyncEnabled,
    intervalSeconds,
    pulseCountdown,
    lastPulseTime,
    toggleAutoSync,
    setIntervalSeconds,
    triggerRecalculateNow,
    refreshSaved,
    flashNicheIds,
  } = useLivePulse();

  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingNiche, setEditingNiche] = useState<SavedNicheItem | null>(null);
  const [singleRecalculatingId, setSingleRecalculatingId] = useState<string | null>(null);

  const handleUpdateNotes = async (id: string, status: SavedNicheStatus, notes: string, tags: string[]) => {
    try {
      await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, notes, tags }),
      });
      refreshSaved();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Remove this niche from saved vault?')) return;
    try {
      await fetch(`/api/saved?id=${id}`, { method: 'DELETE' });
      refreshSaved();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSingleRecalculate = async (nicheId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSingleRecalculatingId(nicheId);
    try {
      await triggerRecalculateNow(nicheId);
    } finally {
      setTimeout(() => setSingleRecalculatingId(null), 800);
    }
  };

  const toggleSelect = (researchId: string) => {
    setSelectedIds((prev) =>
      prev.includes(researchId) ? prev.filter((id) => id !== researchId) : [...prev, researchId]
    );
  };

  const handleCompare = () => {
    if (selectedIds.length < 2) {
      alert('Please select at least 2 niches to compare.');
      return;
    }
    router.push(`/compare?ids=${selectedIds.join(',')}`);
  };

  const filteredNiches = savedNiches.filter((n) => {
    if (activeStatus !== 'all' && n.status !== activeStatus) return false;
    if (
      searchTerm &&
      !n.nicheName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !n.seedKeyword.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const statuses = [
    { id: 'all', label: 'All Saved' },
    { id: 'strong_opportunity', label: 'Strong Opportunity' },
    { id: 'validated', label: 'Validated' },
    { id: 'building', label: 'Building' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'researching', label: 'Researching' },
  ];

  const getTimeAgo = (isoString?: string) => {
    if (!isoString) return 'Just now';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    return `${diffHrs}h ago`;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen">
      <Header
        title="Saved Niches Vault"
        subtitle="Continuous background score engine keeping your shortlisted niches dynamic & verified"
      >
        <div className="flex items-center gap-3">
          {selectedIds.length >= 2 && (
            <button
              onClick={handleCompare}
              className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-600/20 transition"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare ({selectedIds.length}) Niches</span>
            </button>
          )}

          <button
            onClick={() => triggerRecalculateNow()}
            disabled={isRecalculating}
            className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-600/20 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>{isRecalculating ? 'Recalculating...' : 'Recalculate All Scores'}</span>
          </button>
        </div>
      </Header>

      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* LIVE BACKGROUND ENGINE CONTROL BAR */}
        <div className="bg-white border border-purple-200/90 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                isRecalculating
                  ? 'bg-amber-100 text-amber-600 animate-pulse'
                  : autoSyncEnabled
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <Activity className="w-5 h-5" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>SEBT-NEXT Live Background Pulse</span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      autoSyncEnabled
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        autoSyncEnabled ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
                      }`}
                    />
                    {autoSyncEnabled ? 'Live Active' : 'Paused'}
                  </span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {autoSyncEnabled ? (
                  <>
                    Next automatic recalculation cycle in{' '}
                    <strong className="text-purple-700 font-mono">{pulseCountdown}s</strong> • Last updated{' '}
                    {lastPulseTime ? getTimeAgo(lastPulseTime.toISOString()) : 'just now'}
                  </>
                ) : (
                  'Automatic live scoring is paused. Click recalculate or enable auto-sync.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            {/* Interval Selector */}
            <div className="flex items-center gap-1.5 bg-[#faf9f6] border border-slate-200 rounded-2xl px-3 py-1.5 text-xs text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-500 font-medium">Interval:</span>
              <select
                value={intervalSeconds}
                onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                className="bg-transparent font-bold text-purple-700 focus:outline-none text-xs cursor-pointer"
              >
                <option value={15}>15s (Fast)</option>
                <option value={20}>20s (Standard)</option>
                <option value={30}>30s (Relaxed)</option>
                <option value={60}>60s (Slow)</option>
              </select>
            </div>

            {/* Toggle Auto Sync Button */}
            <button
              onClick={() => toggleAutoSync()}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                autoSyncEnabled
                  ? 'bg-purple-100 border border-purple-300 text-purple-800 hover:bg-purple-200'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${autoSyncEnabled ? 'text-purple-600 animate-pulse' : 'text-slate-400'}`} />
              <span>{autoSyncEnabled ? 'Pause Sync' : 'Enable Auto-Sync'}</span>
            </button>
          </div>
        </div>

        {/* Top Controls: Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            {statuses.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStatus(s.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  activeStatus === s.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved niches..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-full text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
            />
          </div>
        </div>

        {/* Niche Grid List */}
        {savedNiches.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No saved niches in this view</h3>
            <p className="text-xs text-slate-500">
              Run research on seed keywords or Flippa listings, then click "Save Niche" to bookmark them here.
            </p>
            <Link
              href="/research/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Explore New Niches</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNiches.map((niche) => {
              const isSelected = selectedIds.includes(niche.researchId);
              const isFlashing = flashNicheIds.includes(niche.id);
              const isSingleCalculating = singleRecalculatingId === niche.id;
              const delta = niche.scoreDelta || 0;

              return (
                <div
                  key={niche.id}
                  className={`bg-white border rounded-3xl p-5 space-y-4 shadow-sm hover:shadow-lg transition-all relative group ${
                    isFlashing
                      ? 'border-purple-500 ring-4 ring-purple-200 bg-purple-50/20'
                      : isSelected
                      ? 'border-purple-600 ring-2 ring-purple-100'
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(niche.researchId)}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                      />
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100 uppercase">
                        {niche.tags?.[0] || 'Micro Niche'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Individual Recalculate Button */}
                      <button
                        onClick={(e) => handleSingleRecalculate(niche.id, e)}
                        disabled={isSingleCalculating}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Recalculate this niche now"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${isSingleCalculating ? 'animate-spin text-purple-600' : ''}`}
                        />
                      </button>

                      <button
                        onClick={() => setEditingNiche(niche)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Edit Notes & Status"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleDelete(niche.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Seed */}
                  <div>
                    <Link
                      href={`/research/${niche.researchId}`}
                      className="text-base font-bold text-slate-900 hover:text-purple-600 transition flex items-center gap-1.5"
                    >
                      <span className="truncate">{niche.nicheName}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition flex-shrink-0" />
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Seed: "{niche.seedKeyword}" • {niche.targetCountry}
                    </p>
                  </div>

                  {/* Dynamic Metrics Bar with Live Movement Delta */}
                  <div className="grid grid-cols-2 gap-2 bg-[#faf9f6] p-3.5 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Viability Score
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-base font-black text-purple-700">
                          {niche.viabilityScore}/100
                        </span>

                        {/* Delta Pill */}
                        {delta > 0 ? (
                          <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md border border-emerald-200">
                            <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                            +{delta}
                          </span>
                        ) : delta < 0 ? (
                          <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded-md border border-rose-200">
                            <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                            {delta}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-md">
                            •
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Verdict</span>
                      <span
                        className={`text-xs font-bold block mt-1 ${
                          niche.verdict === 'STRONG GO'
                            ? 'text-emerald-700'
                            : niche.verdict === 'GO'
                            ? 'text-teal-700'
                            : niche.verdict === 'MAYBE'
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {niche.verdict || 'GO'}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Live Drift & Volatility Tags */}
                  <div className="flex items-center justify-between text-[10px] pt-1 text-slate-500 border-t border-slate-100/80">
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                      Drift:{' '}
                      <strong className="text-slate-800">
                        {niche.serpVolatility || 'Moderate'}
                      </strong>
                    </span>

                    <span className="text-slate-400 text-[10px]">
                      Updated: {getTimeAgo(niche.lastRecalculatedAt || niche.updatedAt)}
                    </span>
                  </div>

                  {/* Tags */}
                  {niche.tags && niche.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {niche.tags.map((t, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Notes Snippet */}
                  {niche.notes && (
                    <p className="text-[11px] text-slate-600 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-100 line-clamp-2">
                      "{niche.notes}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Notes Modal */}
        {editingNiche && (
          <NotesModal
            isOpen={true}
            niche={editingNiche}
            onClose={() => setEditingNiche(null)}
            onSave={(id, status, notes, tags) => {
              handleUpdateNotes(id, status, notes, tags);
              setEditingNiche(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
