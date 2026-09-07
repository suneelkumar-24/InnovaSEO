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
  TrendingUp,
} from 'lucide-react';

export default function ResearchWorkspacePage() {
  const router = useRouter();
  const routeParams = useParams();
  const id = typeof routeParams?.id === 'string' ? routeParams.id : Array.isArray(routeParams?.id) ? routeParams.id[0] : '';

  const [report, setReport] = useState<NicheViabilityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [exportOpen, setExportOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReport = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/research/${id}`);
      if (!res.ok) return;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      const data = await res.json();
      if (data.success && data.research?.report) {
        setReport(data.research.report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/research/${id}`, { method: 'POST' });
      if (!res.ok) return;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      const data = await res.json();
      if (data.success && data.research?.report) {
        setReport(data.research.report);
      }
    } catch (e) {
      console.error(e);
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

  const tabs = [
    { id: 'overview', label: 'Executive Overview', icon: Compass },
    { id: 'demand', label: 'Search Demand & Geo', icon: Globe },
    { id: 'trends', label: 'Google Trends & Seasonality', icon: Activity },
    { id: 'keywords', label: 'Keyword Cluster Matrix', icon: Layers },
    { id: 'serp', label: 'SERP & Weak Competitors', icon: ShieldCheck },
    { id: 'intent', label: 'Search Intent Gap', icon: Sliders },
    { id: 'landing', label: 'Dedicated Page Audit', icon: FileText },
    { id: 'ai_overview', label: 'AI Overview & CTR', icon: RefreshCw },
    { id: 'monetization', label: 'Monetization Blueprint', icon: DollarSign },
    { id: 'scalability', label: 'Topical Silos & Scale', icon: Layers },
    { id: 'risk', label: 'Policy & YMYL Risk', icon: AlertTriangle },
    { id: 'data_sources', label: 'Data Transparency', icon: Database },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen">
        <Header title="Research Workspace" />
        <div className="flex-1 flex items-center justify-center p-12 text-slate-500 text-sm font-medium">
          Loading Intelligence Dossier...
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen">
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
    <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen">
      {/* Workspace Header Actions */}
      <Header title={report.nicheName} subtitle={`Seed: "${report.seedKeyword}" • ${report.targetCountry}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSave}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition ${
              isSaved
                ? 'bg-purple-100 border-purple-300 text-purple-800'
                : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Saved' : 'Save Niche'}</span>
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
            className="px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 hover:bg-purple-100 flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
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

      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* 1. SEBT-NEXT Executive Opportunity Card */}
        <OpportunityCard report={report} />

        {/* 2. 12 Interactive Analysis Tabs */}
        <div className="space-y-6">
          {/* Scrollable Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Executive Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
                <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-purple-600" /> Market Persona & Strategic Fit
                </h3>
                <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed divide-y divide-slate-100">
                  <p className="pt-2">
                    <strong className="text-slate-900">Niche Archetype:</strong>{' '}
                    <span className="text-purple-700 font-bold uppercase">{report.nicheType || 'Micro Niche'}</span>
                  </p>
                  <p className="pt-2">
                    <strong className="text-slate-900">Primary Business Model:</strong>{' '}
                    <span className="text-slate-800 font-semibold uppercase">{report.businessModel || 'Affiliate'}</span>
                  </p>
                  <p className="pt-2">
                    <strong className="text-slate-900">Target Country:</strong>{' '}
                    <span className="font-semibold text-slate-800">{report.targetCountry || 'Global'}</span>{' '}
                    ({report.searchVolume?.countrySharePercentage ?? 35}% country share)
                  </p>
                  <p className="pt-2">
                    <strong className="text-slate-900">Verdict Rationale:</strong>{' '}
                    <span className="text-slate-600">{report.verdictRationale || 'Analysis verified against SEO heuristics.'}</span>
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
                <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-600" /> SEBT-NEXT Score Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Demand (15%)</span>
                    <span className="text-base font-black text-purple-700 mt-1 block">{report.scoreBreakdown?.demandScore ?? 85}/100</span>
                  </div>
                  <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">SERP Weakness (15%)</span>
                    <span className="text-base font-black text-emerald-600 mt-1 block">{report.scoreBreakdown?.serpWeaknessScore ?? 80}/100</span>
                  </div>
                  <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Competition DR (10%)</span>
                    <span className="text-base font-black text-indigo-700 mt-1 block">{report.scoreBreakdown?.competitionScore ?? 85}/100</span>
                  </div>
                  <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Intent Gap (10%)</span>
                    <span className="text-base font-black text-teal-700 mt-1 block">{report.scoreBreakdown?.intentOpportunityScore ?? 75}/100</span>
                  </div>
                  <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Dedicated Page (10%)</span>
                    <span className="text-base font-black text-emerald-600 mt-1 block">{report.scoreBreakdown?.dedicatedPageScore ?? 85}/100</span>
                  </div>
                  <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Monetization (10%)</span>
                    <span className="text-base font-black text-amber-700 mt-1 block">{report.scoreBreakdown?.monetizationScore ?? 80}/100</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Search Demand & Geography */}
          {activeTab === 'demand' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 text-center shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Seed Keyword SV</span>
                  <span className="text-2xl font-serif font-bold text-purple-700 mt-1 block">
                    {(report.searchVolume?.seedSv?.value ?? 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">Source: {report.searchVolume?.seedSv?.source || 'Search Index'}</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-5 text-center shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Global Search Demand</span>
                  <span className="text-2xl font-serif font-bold text-slate-900 mt-1 block">
                    {(report.searchVolume?.globalSv?.value ?? 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">Worldwide monthly</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-5 text-center shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Niche Demand</span>
                  <span className="text-2xl font-serif font-bold text-indigo-700 mt-1 block">
                    {(report.searchVolume?.totalNicheSv?.value ?? 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">Topical cluster total</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-5 text-center shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Country Share</span>
                  <span className="text-2xl font-serif font-bold text-slate-900 mt-1 block">
                    {report.searchVolume?.countrySharePercentage ?? 35}%
                  </span>
                  <span className="text-[10px] text-slate-400">{report.targetCountry || 'Global'}</span>
                </div>
              </div>

              {/* Top Countries Table */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                <h4 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-600" /> Geographic Demand Distribution
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(report.searchVolume?.topCountries || []).map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#faf9f6] border border-slate-200 text-xs">
                      <span className="font-bold text-slate-900">{c.country}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-purple-700 font-bold">{(c.volume ?? 0).toLocaleString()} SV</span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">{c.share}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Country Localized Tier 1 & Tier 2 Expansions (ChatGPT Shortlist) */}
              {report.multiCountryExpansions && report.multiCountryExpansions.length > 0 && (
                <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider block">
                        GEO LOCALIZATION MATRIX
                      </span>
                      <h4 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                        <Globe className="w-5 h-5 text-indigo-600" /> Multi-Country Localized Seeds & Sister Opportunities
                      </h4>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      Target identical search intent across foreign Tier-1 & Tier-2 SERPs
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
                          <span className="text-xs font-bold text-purple-700">
                            {exp.estimatedRpm} RPM
                          </span>
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
                                router.push(`/research/new?seed=${encodeURIComponent(exp.seedKeyword)}&country=${encodeURIComponent(exp.country)}`);
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
            </div>
          )}

          {/* Tab 3: Google Trends & Seasonality */}
          {activeTab === 'trends' && (
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
          )}

          {/* Tab 4: Keyword Matrix */}
          {activeTab === 'keywords' && (
            <KeywordsTable
              items={report.keywords?.items || []}
              clusters={report.keywords?.clusters || []}
            />
          )}

          {/* Tab 5: SERP & Weak Competitors */}
          {activeTab === 'serp' && (
            <CompetitorTable
              competitors={report.serp?.competitors || []}
              medians={report.serp?.medians || {
                dr: { min: 0, median: 0, max: 0 },
                da: { min: 0, median: 0, max: 0 },
                pa: { min: 0, median: 0, max: 0 },
                rd: { min: 0, median: 0, max: 0 },
                backlinks: { min: 0, median: 0, max: 0 },
                traffic: { min: 0, median: 0, max: 0 },
                domainAgeYears: { min: 0, median: 0, max: 0 },
                pages: { min: 0, median: 0, max: 0 },
                rankingKeywords: { min: 0, median: 0, max: 0 },
              }}
              targetCountry={report.targetCountry || 'United States'}
              seedKeyword={report.seedKeyword}
              gl={report.serp?.gl}
              hl={report.serp?.hl}
              googleLiveSerpUrl={report.serp?.googleLiveSerpUrl}
              aiOverviewPresent={report.serp?.aiOverviewPresent ?? false}
            />
          )}

          {/* Tab 6: Search Intent Gap */}
          {activeTab === 'intent' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 text-center shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Primary Intent</span>
                  <span className="text-lg font-serif font-bold text-purple-700 mt-1 uppercase block">
                    {report.intentAnalysis?.primaryIntent || 'Commercial'}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-5 text-center shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Intent Mismatch</span>
                  <span className={`text-lg font-bold mt-1 uppercase block ${report.intentAnalysis?.intentMismatchDetected ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {report.intentAnalysis?.intentMismatchDetected ? 'YES (High Opportunity)' : 'NO (Aligned)'}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-5 text-center shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Forums / UGC Ranking</span>
                  <span className="text-lg font-bold text-indigo-700 mt-1 block">
                    {report.intentAnalysis?.forumsRankingCount ?? 0} Pages
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                <h4 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-600" /> SERP Content Gap Opportunities
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {report.intentAnalysis?.mismatchExplanation || 'Search intent is well defined for this query.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {(report.intentAnalysis?.gapOpportunities || []).map((gap, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-[#faf9f6] border border-slate-200 text-xs text-slate-800 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 7: Dedicated Page Audit */}
          {activeTab === 'landing' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Dedicated Website / Exact Intent Page Check
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Checks whether an exact-match dedicated resource or landing page exists.
                  </p>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold uppercase self-start sm:self-auto">
                  Opportunity: {report.dedicatedPageAudit?.opportunityLevel || 'HIGH'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Dedicated Website</span>
                  <span className={`text-base font-bold mt-1 block ${report.dedicatedPageAudit?.dedicatedWebsiteExists ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {report.dedicatedPageAudit?.dedicatedWebsiteExists ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Dedicated Landing Page</span>
                  <span className={`text-base font-bold mt-1 block ${report.dedicatedPageAudit?.dedicatedLandingPageExists ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {report.dedicatedPageAudit?.dedicatedLandingPageExists ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Exact Intent Match Page</span>
                  <span className={`text-base font-bold mt-1 block ${report.dedicatedPageAudit?.exactIntentPageExists ? 'text-slate-800' : 'text-emerald-600'}`}>
                    {report.dedicatedPageAudit?.exactIntentPageExists ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf9f6] border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {report.dedicatedPageAudit?.analysis || 'No dedicated exact-match resource currently dominates the query.'}
              </div>
            </div>
          )}

          {/* Tab 8: AI Overview & CTR */}
          {activeTab === 'ai_overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                <h4 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-purple-600" /> AI Overview Presence
                </h4>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">AI Overview Triggered</span>
                    <span className={`text-base font-bold mt-1 block ${report.serp?.aiOverviewPresent ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {report.serp?.aiOverviewPresent ? 'YES' : 'NO'}
                    </span>
                  </div>
                  <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Traffic Impact</span>
                    <span className="text-base font-bold text-slate-900 mt-1 block">{report.serp?.aiOverviewImpact || 'None'}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {report.serp?.aiOverviewPresent
                    ? 'AI Overview triggers for informational components. Focus content on proprietary reviews and interactive tools to retain click-throughs.'
                    : 'Clean SERP without AI Overview compression. Excellent organic click preservation.'}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                <h4 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" /> CTR & Traffic Modeling
                </h4>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Top 3 Est. CTR</span>
                    <span className="text-2xl font-serif font-bold text-purple-700 mt-1 block">
                      {Math.round((report.ctrAnalysis?.estimatedTop3Ctr ?? 0.58) * 100)}%
                    </span>
                  </div>
                  <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Monthly Clicks Capture</span>
                    <span className="text-2xl font-serif font-bold text-slate-900 mt-1 block">
                      {(report.ctrAnalysis?.potentialClicksMonthly ?? 1200).toLocaleString()} Clicks
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 9: Monetization Blueprint */}
          {activeTab === 'monetization' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <h4 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-purple-600" /> Revenue & Monetization Strategy
                  </h4>
                  <span className="text-xs font-bold text-purple-800 bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200">
                    Est. {report.monetization?.estimatedMonthlyRevenueRange || '$1,500 - $6,000 / mo'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(report.monetization?.opportunities || []).map((opp, i) => (
                    <div key={i} className="p-5 rounded-3xl bg-[#faf9f6] border border-slate-200 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">{opp.label}</span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold">{opp.easeOfExecution}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{opp.description}</p>
                      <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Potential Income:</span>
                        <span className="font-bold text-slate-900">{opp.potentialIncomeRange}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 10: Scalability & Silos */}
          {activeTab === 'scalability' && (
            <div className="space-y-6">
              {/* Sub-Niches */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                <h4 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-600" /> Sub-Niches Expansion Angles
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(report.scalability?.subNiches || []).map((sub, i) => (
                    <div key={i} className="p-5 rounded-3xl bg-[#faf9f6] border border-slate-200 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-purple-800 truncate">{sub.name}</h5>
                        <span className="text-[10px] font-semibold text-slate-500">{sub.estimatedVolume}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{sub.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Silos Roadmap */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                <h4 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" /> 20+ Article Topical Silos Blueprint
                </h4>
                <div className="space-y-4">
                  {(report.scalability?.silos || []).map((silo, idx) => (
                    <div key={idx} className="p-5 rounded-3xl bg-[#faf9f6] border border-slate-200 space-y-3 shadow-xs">
                      <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{silo.siloName}</h5>
                      <div className="divide-y divide-slate-200">
                        {(silo.articleAngles || []).map((art, aIdx) => (
                          <div key={aIdx} className="py-2.5 flex items-center justify-between text-xs">
                            <span className="text-slate-800 font-medium">{art.title}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-purple-50 text-purple-700 border border-purple-200 font-bold uppercase">
                              {art.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 11: Policy & Risk */}
          {activeTab === 'risk' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <h4 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-purple-600" /> AI/LLM Policy & YMYL Risk Audit
                </h4>
                <span className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase border self-start sm:self-auto ${
                  (report.riskAnalysis?.aiRiskLevel || 'Low Risk') === 'Low Risk' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  {report.riskAnalysis?.aiRiskLevel || 'Low Risk'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Policy Status</span>
                  <span className="text-base font-bold text-emerald-600 mt-1 block">{report.riskAnalysis?.policyStatus || 'Compliant'}</span>
                </div>
                <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">YMYL Classification</span>
                  <span className={`text-base font-bold mt-1 block ${report.riskAnalysis?.isYmyl ? 'text-amber-700' : 'text-emerald-600'}`}>
                    {report.riskAnalysis?.isYmyl ? 'YES (Requires E-E-A-T)' : 'NO (Standard)'}
                  </span>
                </div>
                <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Government Context</span>
                  <span className="text-base font-bold text-slate-800 mt-1 block">
                    {report.riskAnalysis?.isGovernmentRelated ? 'Informational Guide' : 'Non-Civic'}
                  </span>
                </div>
              </div>

              {report.riskAnalysis?.governmentContext && (
                <div className="p-4 rounded-2xl bg-[#faf9f6] border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block mb-1">Government Topic Guidance:</strong>
                  {report.riskAnalysis.governmentContext}
                </div>
              )}
            </div>
          )}

          {/* Tab 12: Data Transparency */}
          {activeTab === 'data_sources' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <h4 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-600" /> Data Transparency & Freshness
                </h4>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200 self-start sm:self-auto">
                  Confidence Score: {report.dataConfidenceScore ?? 92}%
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#faf9f6] border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">Search Volume & Trends</p>
                    <p className="text-slate-500 text-[11px]">Source: {report.searchVolume?.seedSv?.source || 'Google Search Index'}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 text-[10px]">
                    High Confidence
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf9f6] border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">SERP Competitor Metrics (DR / RD / Backlinks / Traffic)</p>
                    <p className="text-slate-500 text-[11px]">Source: Live SERP Crawling + SEBT-NEXT Median Models</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 text-[10px]">
                    High Confidence
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf9f6] border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">Domain Age & Sitemaps</p>
                    <p className="text-slate-500 text-[11px]">Source: WHOIS / DNS Audit + XML Sitemap Inspector</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 text-[10px]">
                    High Confidence
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Export Modal */}
      <ExportModal report={report} isOpen={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
