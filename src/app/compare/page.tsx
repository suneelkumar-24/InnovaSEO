'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { NicheViabilityReport } from '@/lib/providers/types';
import {
  GitCompare,
  Trophy,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idsParam = searchParams.get('ids');

  const [reports, setReports] = useState<NicheViabilityReport[]>([]);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [winnerReasons, setWinnerReasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idsParam) {
      setLoading(false);
      return;
    }

    const researchIds = idsParam.split(',').filter(Boolean);
    if (researchIds.length < 2) {
      setLoading(false);
      return;
    }

    const fetchComparison = async () => {
      try {
        const res = await fetch('/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ researchIds }),
        });
        const data = await res.json();
        if (data.success) {
          setReports(data.reports || []);
          setWinnerId(data.winnerId || null);
          setWinnerReasons(data.winnerReasons || []);
        } else {
          setError(data.error || 'Failed to compare selected niches.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [idsParam]);

  const winnerReport = reports.find((r) => r.id === winnerId);

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen">
      <Header
        title="Niche Comparison Matrix"
        subtitle="Head-to-head multi-signal viability comparison"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Competitor & Gap Analysis', href: '/compare' },
        ]}
      />

      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        {!idsParam || reports.length < 2 ? (
          <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
              <GitCompare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Select at Least 2 Niches to Compare</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Go to your Saved Vault or Dashboard, select 2 or more validated micro-niches, and launch the comparison matrix.
            </p>
            <button
              onClick={() => router.push('/saved')}
              className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-2 transition"
            >
              <span>Go to Saved Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Computing comparative signals...</div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl">
            {error}
          </div>
        ) : (
          <>
            {/* Winner Banner */}
            {winnerReport && (
              <div className="bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-200">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider block">
                      RECOMMENDED APEX WINNER
                    </span>
                    <h2 className="text-2xl font-serif font-bold text-white mt-0.5">
                      {winnerReport.nicheName} ({winnerReport.overallViabilityScore}/100)
                    </h2>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-bold text-purple-200 block">Why this niche won:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {winnerReasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-purple-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-300 flex-shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Comparison Table */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 overflow-x-auto shadow-sm space-y-4">
              <h3 className="text-base font-serif font-bold text-slate-900">Side-by-Side Signal Matrix</h3>

              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 uppercase text-[10px] tracking-wider text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Evaluation Signal</th>
                    {reports.map((r) => (
                      <th
                        key={r.id}
                        className={`py-3 px-4 ${r.id === winnerId ? 'text-purple-700 font-bold bg-purple-50' : ''}`}
                      >
                        {r.nicheName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Overall Viability Score</td>
                    {reports.map((r) => (
                      <td key={r.id} className={`py-3 px-4 font-black ${r.id === winnerId ? 'text-purple-700 bg-purple-50' : 'text-slate-900'}`}>
                        {r.overallViabilityScore}/100
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Verdict</td>
                    {reports.map((r) => (
                      <td key={r.id} className={`py-3 px-4 ${r.id === winnerId ? 'bg-purple-50' : ''}`}>
                        <span className="font-bold text-purple-700">{r.verdict}</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Seed Search Volume</td>
                    {reports.map((r) => (
                      <td key={r.id} className={`py-3 px-4 ${r.id === winnerId ? 'bg-purple-50' : ''}`}>
                        {r.searchVolume.seedSv.value.toLocaleString()}/mo
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Beatable Sites (DR &lt; 20)</td>
                    {reports.map((r) => (
                      <td key={r.id} className={`py-3 px-4 ${r.id === winnerId ? 'bg-purple-50' : ''}`}>
                        <span className="font-bold text-emerald-600">{r.serp.weakCompetitorCount} sites</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">AI Overview Present</td>
                    {reports.map((r) => (
                      <td key={r.id} className={`py-3 px-4 ${r.id === winnerId ? 'bg-purple-50' : ''}`}>
                        {r.serp.aiOverviewPresent ? 'Yes (Active)' : 'No (Zero AI Risk)'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Target Market</td>
                    {reports.map((r) => (
                      <td key={r.id} className={`py-3 px-4 ${r.id === winnerId ? 'bg-purple-50' : ''}`}>
                        {r.targetCountry}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 text-xs">Loading comparison matrix...</div>}>
      <CompareContent />
    </Suspense>
  );
}
