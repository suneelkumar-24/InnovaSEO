'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import OpportunityCard from '@/components/OpportunityCard';
import CompetitorTable from '@/components/CompetitorTable';
import KeywordsTable from '@/components/KeywordsTable';
import { NicheViabilityReport } from '@/lib/providers/types';

const TrendChart = dynamic(() => import('@/components/TrendChart'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Loading trend data...</div>,
});

const ExportModal = dynamic(() => import('@/components/ExportModal'), {
  ssr: false,
});
import {
  Bookmark,
  RefreshCw,
  Download,
  Trash2,
  Layers,
  Activity,
  Compass,
  FileText,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Database,
  Sliders,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Zap,
  Sparkles,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import Link from 'next/link';

export default function ResearchWorkspacePage() {
  const router = useRouter();
  const routeParams = useParams();
  const id =
    typeof routeParams?.id === 'string'
      ? routeParams.id
      : Array.isArray(routeParams?.id)
      ? routeParams.id[0]
      : '';

  const [report, setReport] = useState<NicheViabilityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<'overview' | 'competitors' | 'checklist' | 'execution' | 'technical'>('overview');
  const [exportOpen, setExportOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReport = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    console.log(`%c[DOSSIER 📂]%c Fetching 15-phase dossier data for ID: ${id}...`, 'color: #7c3aed; font-weight: bold;', 'color: #5b21b6;');
    try {
      const res = await fetch(`/api/research/${id}`);
      if (!res.ok) {
        console.error(`%c[DOSSIER ❌]%c Dossier fetch returned HTTP ${res.status}`, 'color: #ef4444; font-weight: bold;', 'color: #b91c1c;');
        return;
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      const data = await res.json();
      if (data.success && data.research?.report) {
        setReport(data.research.report);
        console.log(
          `%c[DOSSIER ✅]%c Loaded "${data.research.report.nicheName}" (Score: ${data.research.report.overallViabilityScore}, Verdict: ${data.research.report.verdict})`,
          'color: #10b981; font-weight: bold;',
          'color: #047857;'
        );
      } else {
        console.warn('[DOSSIER ⚠️] Dossier returned empty or without report:', data);
      }
    } catch (e) {
      console.error('[DOSSIER ❌] Error fetching dossier:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleRefresh = async () => {
    console.log(`%c[DOSSIER 🔄 REFRESH]%c Recalculating 15-phase report for ID: ${id}...`, 'color: #7c3aed; font-weight: bold;', 'color: #5b21b6;');
    setRefreshing(true);
    try {
      const res = await fetch(`/api/research/${id}`, { method: 'POST' });
      if (!res.ok) {
        console.error(`%c[DOSSIER ❌]%c Refresh failed with HTTP ${res.status}`, 'color: #ef4444; font-weight: bold;', 'color: #b91c1c;');
        return;
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      const data = await res.json();
      if (data.success && data.research?.report) {
        setReport(data.research.report);
        console.log(`%c[DOSSIER 🔄 REFRESH ✅]%c Report updated successfully!`, 'color: #10b981; font-weight: bold;', 'color: #047857;');
      }
    } catch (e) {
      console.error('[DOSSIER ❌] Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleSave = async () => {
    if (!report) return;
    try {
      await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          researchId: report.id,
          nicheName: report.nicheName,
          seedKeyword: report.seedKeyword,
          targetCountry: report.targetCountry,
          viabilityScore: report.overallViabilityScore,
          verdict: report.verdict,
          status: 'strong_opportunity',
          tags: [report.nicheType, report.businessModel],
        }),
      });
      setIsSaved(true);
      alert('Niche saved to your vault!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this research dossier?')) return;
    try {
      await fetch(`/api/research/${id}`, { method: 'DELETE' });
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  const STAGES = [
    {
      id: 'overview' as const,
      step: '1',
      title: 'Executive Verdict',
      subtitle: 'Instant Decision & Score',
      icon: Compass,
    },
    {
      id: 'competitors' as const,
      step: '2',
      title: 'Competitors & SERP',
      subtitle: 'Weak DR & Traffic Targets',
      icon: ShieldCheck,
    },
    {
      id: 'checklist' as const,
      step: '3',
      title: '12-Point Audit Matrix',
      subtitle: 'Official Benchmark Checks',
      icon: CheckCircle2,
    },
    {
      id: 'execution' as const,
      step: '4',
      title: '90-Day Content Plan',
      subtitle: 'Keywords & Daily Cadence',
      icon: Zap,
    },
    {
      id: 'technical' as const,
      step: '5',
      title: 'Deep Metrics',
      subtitle: 'Trends & Data Scores',
      icon: Activity,
    },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen font-sans">
        <Header title="Research Workspace" />
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500 text-sm font-medium space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
          <span>Organizing Niche Intelligence Dossier...</span>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen font-sans">
        <Header title="Research Workspace" />
        <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4 text-center">
          <p className="text-base font-bold text-slate-900">Research Dossier Not Found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-full shadow-md transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen font-sans">
      {/* Workspace Header Actions with Breadcrumbs */}
      <Header
        title={report.nicheName}
        subtitle={`Seed: "${report.seedKeyword}" • Target Market: ${report.targetCountry}`}
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Autopilot Radar', href: '/autopilot' },
          { label: 'Hunter Studio', href: '/research/new' },
          { label: report.nicheName },
        ]}
      >
        <div className="flex items-center gap-2">
          {/* Back to Discovery Navigation */}
          <Link
            href="/autopilot"
            className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-purple-700 hover:bg-slate-50 flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>Radar</span>
          </Link>

          <button
            onClick={handleToggleSave}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition ${
              isSaved
                ? 'bg-purple-100 border-purple-300 text-purple-800'
                : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setExportOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>1-Click Export</span>
          </button>

          <button
            onClick={handleDelete}
            title="Delete Research"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </Header>

      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Guided 4-Stage Progressive Stepper Navigation */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-2 sm:p-3 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {STAGES.map((stage) => {
              const Icon = stage.icon;
              const isActive = activeStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStage(stage.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'bg-[#faf9f6] text-slate-600 hover:bg-purple-50/60 hover:text-purple-900 border border-slate-100'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider block ${
                        isActive ? 'text-purple-200' : 'text-slate-400'
                      }`}
                    >
                      Step {stage.step}
                    </span>
                    <span className="text-xs font-bold truncate block mt-0.5">
                      {stage.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* STAGE 1: EXECUTIVE VERDICT & INSTANT DECISION */}
        {/* ============================================================ */}
        {activeStage === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Opportunity Card Container */}
            <OpportunityCard report={report} />

            {/* Next Stage Guided Action Card */}
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">
                  Next Step in Evaluation
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  Ready to inspect the live competitors and find the exact low-DR site to replicate?
                </h4>
              </div>
              <button
                onClick={() => setActiveStage('competitors')}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition shrink-0"
              >
                <span>Step 2: Inspect Competitors &amp; SERP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 2: COMPETITORS & SERP AUDIT */}
        {/* ============================================================ */}
        {activeStage === 'competitors' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* SERP Competitor Table */}
            <CompetitorTable
              competitors={report.serp?.competitors || []}
              medians={
                report.serp?.medians || {
                  dr: { min: 0, median: 0, max: 0 },
                  da: { min: 0, median: 0, max: 0 },
                  pa: { min: 0, median: 0, max: 0 },
                  rd: { min: 0, median: 0, max: 0 },
                  backlinks: { min: 0, median: 0, max: 0 },
                  traffic: { min: 0, median: 0, max: 0 },
                  domainAgeYears: { min: 0, median: 0, max: 0 },
                  pages: { min: 0, median: 0, max: 0 },
                  rankingKeywords: { min: 0, median: 0, max: 0 },
                }
              }
              targetCountry={report.targetCountry || 'United States'}
              seedKeyword={report.seedKeyword}
              gl={report.serp?.gl}
              hl={report.serp?.hl}
              googleLiveSerpUrl={report.serp?.googleLiveSerpUrl}
              aiOverviewPresent={report.serp?.aiOverviewPresent ?? false}
            />

            {/* Dedicated Website & Search Intent Gaps Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dedicated Website Audit Box */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" /> Dedicated Site vs Generic Portals
                  </h4>
                  <span className="px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold uppercase">
                    {report.dedicatedPageAudit?.opportunityLevel || 'HIGH OPPORTUNITY'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#faf9f6] p-3 rounded-2xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Dedicated Site</span>
                    <span className={`text-sm font-bold mt-0.5 block ${report.dedicatedPageAudit?.dedicatedWebsiteExists ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {report.dedicatedPageAudit?.dedicatedWebsiteExists ? 'YES' : 'NO (Open)'}
                    </span>
                  </div>
                  <div className="bg-[#faf9f6] p-3 rounded-2xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Dedicated Landing</span>
                    <span className={`text-sm font-bold mt-0.5 block ${report.dedicatedPageAudit?.dedicatedLandingPageExists ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {report.dedicatedPageAudit?.dedicatedLandingPageExists ? 'YES' : 'NO (Open)'}
                    </span>
                  </div>
                  <div className="bg-[#faf9f6] p-3 rounded-2xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Exact Intent Page</span>
                    <span className={`text-sm font-bold mt-0.5 block ${report.dedicatedPageAudit?.exactIntentPageExists ? 'text-slate-800' : 'text-emerald-600'}`}>
                      {report.dedicatedPageAudit?.exactIntentPageExists ? 'YES' : 'NO (Open)'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {report.dedicatedPageAudit?.analysis || 'No dedicated exact-match resource currently dominates the top search results.'}
                </p>
              </div>

              {/* Search Intent Gaps & UGC Ranking Box */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-600" /> Search Intent &amp; UGC Gaps
                  </h4>
                  <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                    {report.intentAnalysis?.primaryIntent || 'INFORMATIONAL'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {report.intentAnalysis?.mismatchExplanation || 'Search intent is clearly defined with high commercial & informational demand.'}
                </p>

                <div className="space-y-2 pt-1">
                  {(report.intentAnalysis?.gapOpportunities || []).slice(0, 3).map((gap, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#faf9f6] border border-slate-200 text-xs text-slate-800 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium">{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Back / Next Navigation Deck */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setActiveStage('overview')}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Verdict</span>
              </button>

              <button
                onClick={() => setActiveStage('checklist')}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition"
              >
                <span>Step 3: 12-Point Audit Matrix</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 3: 12-POINT MASTER AUDIT MATRIX */}
        {/* ============================================================ */}
        {activeStage === 'checklist' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Geographic Demand & Country Share */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 text-center shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Seed Keyword SV</span>
                <span className="text-2xl font-serif font-bold text-purple-700 mt-1 block">
                  {(report.searchVolume?.seedSv?.value ?? 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400">{report.targetCountry || 'Target Country'}</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-5 text-center shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Global Search Demand</span>
                <span className="text-2xl font-serif font-bold text-slate-900 mt-1 block">
                  {(report.searchVolume?.globalSv?.value ?? 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400">Worldwide monthly</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-5 text-center shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Beatable Sites in Top 10</span>
                <span className="text-2xl font-serif font-bold text-emerald-600 mt-1 block">
                  {report.serp?.weakCompetitorCount ?? 2} Sites
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">DR &lt; 20 on Page 1</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-5 text-center shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Country Share</span>
                <span className="text-2xl font-serif font-bold text-indigo-700 mt-1 block">
                  {report.searchVolume?.countrySharePercentage ?? 35}%
                </span>
                <span className="text-[10px] text-slate-400">Local dominance</span>
              </div>
            </div>

            {/* Multi-Country Geo Expansions */}
            {report.multiCountryExpansions && report.multiCountryExpansions.length > 0 && (
              <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider block">
                      GEO LOCALIZATION MATRIX
                    </span>
                    <h4 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                      <Globe className="w-5 h-5 text-indigo-600" /> Multi-Country Localized Seeds &amp; Sister Opportunities
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Target identical search intent across foreign Tier-1 &amp; Tier-2 SERPs
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  {report.multiCountryExpansions.map((exp, idx) => (
                    <div
                      key={idx}
                      className="bg-[#faf9f6] border border-slate-200 hover:border-indigo-400 p-4 rounded-2xl transition space-y-3 shadow-xs group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{exp.flag}</span>
                          <span className="font-bold text-slate-900 text-sm">{exp.country}</span>
                          <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                            gl={exp.gl} · hl={exp.hl}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-purple-700">{exp.estimatedRpm} RPM</span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="font-mono font-bold text-slate-900 text-xs block group-hover:text-indigo-600 transition">
                          {exp.seedKeyword}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Meaning: {exp.englishMeaning}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-bold text-emerald-600">
                          ~{exp.estimatedMonthlySv.toLocaleString()} SV/mo
                        </span>

                        <div className="flex items-center gap-2">
                          <a
                            href={exp.googleLiveSerpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <span>Google ({exp.gl.toUpperCase()})</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <button
                            onClick={() => {
                              router.push(
                                `/research/new?seed=${encodeURIComponent(exp.seedKeyword)}&country=${encodeURIComponent(
                                  exp.country
                                )}`
                              );
                            }}
                            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
                          >
                            Research
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Back / Next Navigation Deck */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setActiveStage('competitors')}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Competitors</span>
              </button>

              <button
                onClick={() => setActiveStage('execution')}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition"
              >
                <span>Step 4: 90-Day Content Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 4: 90-DAY CONTENT ROADMAP & KEYWORDS */}
        {/* ============================================================ */}
        {activeStage === 'execution' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Quick Action Banner */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider block">
                    CONTENT EXECUTION PLAYBOOK
                  </span>
                  <h3 className="text-xl font-serif font-bold text-slate-900 mt-0.5">
                    90-Day Competitor Keyword Mapping &amp; Daily Scheduler
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Replicate all ranking keywords of the low-DR competitor at a pace of 1 to 2 high-quality articles per day.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExportOpen(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Excel Sheet (.xlsx)</span>
                  </button>
                  <Link
                    href={`/blueprints?tab=scheduler`}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <span>Full Blueprints Studio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Keywords Table Container */}
              <KeywordsTable
                items={report.keywords?.items || []}
                clusters={report.keywords?.clusters || []}
              />
            </div>

            {/* Monetization Angles & Exit Valuation */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-purple-600" /> Monetization Strategy &amp; Asset Exit
                </h4>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Est. {report.monetization?.estimatedMonthlyRevenueRange || '$1,500 - $6,000 / mo'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(report.monetization?.opportunities || []).map((opp, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[#faf9f6] border border-slate-200 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">{opp.label}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold">
                        {opp.easeOfExecution}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{opp.description}</p>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Income Potential:</span>
                      <span className="font-bold text-slate-900">{opp.potentialIncomeRange}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Back Navigation Deck */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setActiveStage('checklist')}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to 12-Point Checklist</span>
              </button>

              <button
                onClick={() => setExportOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Complete Dossier</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 5: DEEP TECHNICAL METRICS (TRENDS, RISK, DATA) */}
        {/* ============================================================ */}
        {activeStage === 'technical' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Google Trends Interactive Chart */}
            <TrendChart
              points12m={report.trends?.points12m || []}
              currentInterest={report.trends?.currentInterest ?? 65}
              averageInterest={report.trends?.averageInterest ?? 60}
              minInterest={report.trends?.minInterest ?? 35}
              maxInterest={report.trends?.maxInterest ?? 85}
              growthPercentage={report.trends?.growthPercentage ?? 0}
              classification={report.trends?.classification || 'Evergreen'}
              seasonalityPattern={report.trends?.seasonalityPattern || 'Stable seasonal demand.'}
              risingQueries={report.trends?.risingQueries || []}
              topRegions={report.searchVolume?.topRegions || []}
            />

            {/* Policy & Risk Classification */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-purple-600" /> Policy &amp; YMYL Risk Audit
                </h4>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                    (report.riskAnalysis?.aiRiskLevel || 'Low Risk') === 'Low Risk'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  {report.riskAnalysis?.aiRiskLevel || 'Low Risk'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs">
                <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Policy Status</span>
                  <span className="text-base font-bold text-emerald-600 mt-1 block">
                    {report.riskAnalysis?.policyStatus || 'Compliant'}
                  </span>
                </div>
                <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">YMYL Status</span>
                  <span className={`text-base font-bold mt-1 block ${report.riskAnalysis?.isYmyl ? 'text-amber-700' : 'text-emerald-600'}`}>
                    {report.riskAnalysis?.isYmyl ? 'YES (E-E-A-T Needed)' : 'NO (Safe)'}
                  </span>
                </div>
                <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Data Confidence</span>
                  <span className="text-base font-bold text-purple-700 mt-1 block">
                    {report.dataConfidenceScore ?? 92}%
                  </span>
                </div>
              </div>
            </div>

            {/* Back Navigation Deck */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setActiveStage('execution')}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to 90-Day Plan</span>
              </button>

              <button
                onClick={() => setActiveStage('overview')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
              >
                <span>Return to Executive Verdict</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Export Modal */}
      <ExportModal report={report} isOpen={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
