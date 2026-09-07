'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useLivePulse } from '@/components/LivePulseProvider';
import {
  Target,
  Bookmark,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Trash2,
  ExternalLink,
  Plus,
  Compass,
  Store,
  CheckCircle2,
  RefreshCw,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { isRecalculating, lastPulseTime, autoSyncEnabled, pulseCountdown, triggerRecalculateNow } =
    useLivePulse();

  const [researches, setResearches] = useState<any[]>([]);
  const [savedNiches, setSavedNiches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [resRes, resSaved] = await Promise.all([
        fetch('/api/research').catch(() => null),
        fetch('/api/saved').catch(() => null),
      ]);
      if (resRes && resRes.ok && (resRes.headers.get('content-type') || '').includes('application/json')) {
        const dataRes = await resRes.json();
        if (dataRes.success) setResearches(dataRes.researches || []);
      }
      if (resSaved && resSaved.ok && (resSaved.headers.get('content-type') || '').includes('application/json')) {
        const dataSaved = await resSaved.json();
        if (dataSaved.success) setSavedNiches(dataSaved.saved || []);
      }
    } catch (e) {
      console.warn('Dashboard fetch notice:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // When live pulse triggers in background, refresh dashboard numbers
  useEffect(() => {
    if (lastPulseTime) {
      fetchDashboardData();
    }
  }, [lastPulseTime]);

  const handleDeleteResearch = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this research run?')) return;
    try {
      await fetch(`/api/research/${id}`, { method: 'DELETE' });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const strongOpps = researches.filter((r) => r.viabilityScore >= 80);
  const avgScore =
    researches.length > 0
      ? Math.round(
          researches.reduce((sum, r) => sum + (r.viabilityScore || 0), 0) / researches.length
        )
      : 0;

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen">
      <Header
        title="Research Dashboard"
        subtitle="Overview of your micro-niche opportunities and live SEBT-NEXT validation runs"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerRecalculateNow()}
            disabled={isRecalculating}
            className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin text-purple-600' : ''}`} />
            <span>{isRecalculating ? 'Recalculating...' : 'Live Recalculate'}</span>
          </button>
        </div>
      </Header>

      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* 1. 4 KPI Metric Cards (RankKW Style with Pastel Badges) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Researches</p>
              <p className="text-2xl font-black text-slate-900">{researches.length}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Saved Niches</p>
              <p className="text-2xl font-black text-slate-900">{savedNiches.length}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Strong Opportunities</p>
              <p className="text-2xl font-black text-emerald-600">{strongOpps.length}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Viability Score</p>
                {autoSyncEnabled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>
              <p className="text-2xl font-black text-slate-900">{avgScore}/100</p>
            </div>
          </div>
        </div>

        {/* 2. Quick Launch Action Banner (Royal Purple Gradient) */}
        <div className="bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl text-white">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5" /> SEBT-NEXT 15-Phase Research Engine
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Ready to Discover Your Next High-Margin Micro-Niche?
            </h2>
            <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
              Launch our 15-stage research pipeline with Flippa reverse-engineering, Google Trends, SERP scraper, weak competitor analysis, and dynamic revenue modeling.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/autopilot"
              className="px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition active:scale-95 whitespace-nowrap"
            >
              <Zap className="w-4 h-4 text-emerald-200" />
              <span>⚡ Autopilot Radar</span>
            </Link>

            <Link
              href="/research/new?mode=marketplace"
              className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition"
            >
              <Store className="w-4 h-4 text-purple-200" />
              <span>Flippa Reverse</span>
            </Link>

            <Link
              href="/research/new"
              className="px-6 py-3 rounded-full bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs flex items-center gap-2 shadow-lg transition active:scale-95 whitespace-nowrap"
            >
              <Target className="w-4 h-4 text-purple-600" />
              <span>Manual Run</span>
            </Link>
          </div>
        </div>

        {/* 3. Top Opportunities Highlight Cards */}
        {strongOpps.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Top Validated Opportunities (Score &ge; 80)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {strongOpps.slice(0, 3).map((opp) => (
                <div
                  key={opp.id}
                  onClick={() => router.push(`/research/${opp.id}`)}
                  className="bg-white border border-slate-200/90 hover:border-purple-400 rounded-3xl p-5 shadow-sm hover:shadow-xl transition cursor-pointer space-y-4 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                      {opp.nicheType}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {opp.verdict}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition truncate">
                      {opp.seedKeyword}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{opp.targetCountry}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">Viability Score:</span>
                    <span className="font-black text-purple-600">{opp.viabilityScore}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Recent Research History Table (Clean White Card) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900">Recent Niche Researches</h3>
              <p className="text-xs text-slate-500">Complete historical record with live updated viability metrics.</p>
            </div>
            <Link
              href="/research/new"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading research dossiers...</div>
          ) : researches.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm font-semibold text-slate-700">No researches yet.</p>
              <p className="text-xs text-slate-400">Launch your first 15-phase niche research now!</p>
              <Link
                href="/research/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700 transition"
              >
                Start First Research
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 uppercase text-[10px] tracking-wider text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Seed Keyword / Niche</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Country</th>
                    <th className="py-3 px-3 text-center">Score</th>
                    <th className="py-3 px-3 text-center">Verdict</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {researches.map((res) => (
                    <tr
                      key={res.id}
                      onClick={() => router.push(`/research/${res.id}`)}
                      className="hover:bg-purple-50/50 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 group-hover:text-purple-700 flex items-center gap-2">
                        <span>{res.seedKeyword}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px] uppercase">
                          {res.nicheType}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">{res.targetCountry}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-purple-700">
                        {res.viabilityScore}/100
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            res.verdict === 'STRONG GO'
                              ? 'bg-emerald-100 text-emerald-800'
                              : res.verdict === 'GO'
                              ? 'bg-teal-100 text-teal-800'
                              : res.verdict === 'MAYBE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {res.verdict}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                        {new Date(res.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => handleDeleteResearch(res.id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Run"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
