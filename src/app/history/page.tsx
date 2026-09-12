'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  History,
  Target,
  Radio,
  Store,
  Flame,
  Search,
  Trash2,
  ExternalLink,
  RefreshCw,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  Globe,
  DollarSign,
  Layers,
  Activity,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  ChevronRight,
  Cpu,
  Database,
  BarChart3,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { ResearchRecord, SearchOrigin } from '@/lib/providers/types';

export default function HistoryPage() {
  const router = useRouter();

  const [historyItems, setHistoryItems] = useState<ResearchRecord[]>([]);
  const [stats, setStats] = useState<{
    totalSearches: number;
    manualCount: number;
    autoHunterCount: number;
    marketplaceCount: number;
    anomalyCount: number;
    strongOpportunityCount: number;
    averageScore: number;
  }>({
    totalSearches: 0,
    manualCount: 0,
    autoHunterCount: 0,
    marketplaceCount: 0,
    anomalyCount: 0,
    strongOpportunityCount: 0,
    averageScore: 0,
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SearchOrigin | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'score' | 'weakComps' | 'volume'>('newest');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setHistoryItems(data.history || []);
          if (data.stats) setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this search from history?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistoryItems((prev) => prev.filter((item) => item.id !== id));
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearHistory = async (originToClear: SearchOrigin | 'all') => {
    try {
      const url = originToClear === 'all' ? '/api/history?clearAll=true' : `/api/history?origin=${originToClear}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        setShowClearModal(false);
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopySeed = (seed: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(seed);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCsv = () => {
    const headers = [
      'Origin',
      'Executed By',
      'Seed Keyword',
      'Niche Name',
      'Country',
      'Viability Score',
      'Verdict',
      'Weak Competitors (<20 DR)',
      'Lowest DR',
      'Zero AI Overview Immune',
      'Estimated RPM',
      'Recommended Asset',
      'Auto Hunter Deduction Summary',
      'Created At',
    ];

    const rows = filteredItems.map((item) => {
      const deductions = item.deductions;
      return [
        `"${item.searchOrigin || 'manual'}"`,
        `"${item.executedBy || 'User'}"`,
        `"${item.seedKeyword}"`,
        `"${item.report?.nicheName || item.seedKeyword}"`,
        `"${item.targetCountry}"`,
        item.viabilityScore,
        `"${item.verdict}"`,
        deductions?.weakCompetitorsFound ?? (item.report?.serp?.weakCompetitorCount || 0),
        deductions?.lowestCompetitorDr ?? 'N/A',
        deductions?.zeroClickImmune ? 'Yes (Immune)' : 'No',
        `"${deductions?.estimatedRpm || 'Tier 1'}"`,
        `"${deductions?.recommendedAsset || 'Programmatic Hub'}"`,
        `"${(deductions?.summary || '').replace(/"/g, '""')}"`,
        `"${item.createdAt}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `niche_hunter_search_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredItems = useMemo(() => {
    return historyItems
      .filter((item) => {
        if (activeTab !== 'all' && item.searchOrigin !== activeTab) {
          return false;
        }
        if (verdictFilter !== 'all' && !item.verdict.toLowerCase().includes(verdictFilter.toLowerCase())) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesKeyword = item.seedKeyword.toLowerCase().includes(q);
          const matchesCountry = item.targetCountry.toLowerCase().includes(q);
          const matchesName = (item.report?.nicheName || '').toLowerCase().includes(q);
          const matchesDeduction = (item.deductions?.summary || '').toLowerCase().includes(q);
          const matchesAsset = (item.deductions?.recommendedAsset || '').toLowerCase().includes(q);
          if (!matchesKeyword && !matchesCountry && !matchesName && !matchesDeduction && !matchesAsset) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.viabilityScore - a.viabilityScore;
        if (sortBy === 'weakComps') {
          const aComps = a.deductions?.weakCompetitorsFound || 0;
          const bComps = b.deductions?.weakCompetitorsFound || 0;
          return bComps - aComps;
        }
        if (sortBy === 'volume') {
          const aVol = a.report?.searchVolume?.totalNicheSv?.value || 0;
          const bVol = b.report?.searchVolume?.totalNicheSv?.value || 0;
          return bVol - aVol;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [historyItems, activeTab, verdictFilter, searchQuery, sortBy]);

  const getOriginBadge = (origin?: SearchOrigin) => {
    switch (origin) {
      case 'auto_hunter':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 border border-purple-300 text-purple-800 text-[10px] font-extrabold uppercase tracking-wider">
            <Radio className="w-3 h-3 text-purple-600 animate-pulse" />
            <span>⚡ AUTO HUNTER RADAR</span>
          </span>
        );
      case 'marketplace_reverse':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-800 text-[10px] font-extrabold uppercase tracking-wider">
            <Store className="w-3 h-3 text-rose-600" />
            <span>🏪 MARKETPLACE BLUEPRINT</span>
          </span>
        );
      case 'anomaly_scanner':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider">
            <Flame className="w-3 h-3 text-amber-600" />
            <span>🔥 ANOMALY SCANNER</span>
          </span>
        );
      case 'manual':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-800 text-[10px] font-extrabold uppercase tracking-wider">
            <Target className="w-3 h-3 text-blue-600" />
            <span>👤 USER MANUAL HUNT</span>
          </span>
        );
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen font-sans">
      <Header
        title="Search & Discovery History"
        subtitle="Complete audit trail of User Manual Hunts, Auto Hunter Autonomous Deductions, and Marketplace Reversals"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Niche Hunter Suite', href: '/dashboard' },
          { label: 'Search History' },
        ]}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={fetchHistory}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            title="Refresh History"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          </button>
          <button
            onClick={handleExportCsv}
            disabled={filteredItems.length === 0}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-purple-700 hover:border-purple-300 flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowClearModal(true)}
            disabled={historyItems.length === 0}
            className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </Header>

      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* 1. TOP TELEMETRY STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Searches</span>
              <History className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalSearches}</p>
            <span className="text-[10px] text-slate-500 block mt-0.5">All tracked searches</span>
          </div>

          <div className="bg-white border border-blue-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Manual Searches</span>
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-blue-700 mt-1">{stats.manualCount}</p>
            <span className="text-[10px] text-blue-500 block mt-0.5">Direct user hunts</span>
          </div>

          <div className="bg-white border border-purple-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">Auto Hunter Discovered</span>
              <Radio className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-black text-purple-700 mt-1">{stats.autoHunterCount}</p>
            <span className="text-[10px] text-purple-500 block mt-0.5">Autonomous radar finds</span>
          </div>

          <div className="bg-white border border-emerald-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Strong Opportunities</span>
              <Zap className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-emerald-700 mt-1">{stats.strongOpportunityCount}</p>
            <span className="text-[10px] text-emerald-600 block mt-0.5">Score &gt;= 80/100 verified</span>
          </div>

          <div className="bg-white border border-amber-200/90 rounded-2xl p-4 shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Avg Viability Score</span>
              <Activity className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-700 mt-1">{stats.averageScore}/100</p>
            <span className="text-[10px] text-amber-600 block mt-0.5">Across all historical runs</span>
          </div>
        </div>

        {/* 2. ORIGIN FILTER TABS & SEARCH TOOLBAR */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-4 shadow-xs">
          {/* Origin Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>All History</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/20">
                {stats.totalSearches}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'manual'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>👤 Manual Searches (User)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-500/30">
                {stats.manualCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('auto_hunter')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'auto_hunter'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>⚡ Auto Hunter Radar</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-500/30">
                {stats.autoHunterCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('marketplace_reverse')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'marketplace_reverse'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>🏪 Marketplace Exit Blueprints</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-500/30">
                {stats.marketplaceCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('anomaly_scanner')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'anomaly_scanner'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>🔥 DR 0-20 Anomalies</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/30">
                {stats.anomalyCount}
              </span>
            </button>
          </div>

          {/* Search and Filters row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search seed keyword, country, deduction text, asset..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-purple-500 focus:bg-white transition"
                />
              </div>

              {/* Verdict Filter */}
              <select
                value={verdictFilter}
                onChange={(e) => setVerdictFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Verdicts</option>
                <option value="STRONG GO">Strong Go</option>
                <option value="GO">Go</option>
                <option value="MAYBE">Maybe</option>
                <option value="RESEARCH MORE">Research More</option>
                <option value="AVOID">Avoid</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="score">Sort: Highest Score</option>
                <option value="weakComps">Sort: Most Weak Competitors</option>
                <option value="volume">Sort: Highest Search Volume</option>
              </select>
            </div>

            <span className="text-xs font-semibold text-slate-500">
              Showing <strong className="text-purple-700 font-bold">{filteredItems.length}</strong> searches
            </span>
          </div>
        </div>

        {/* 3. HISTORY LIST / CARDS */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">Loading your search & discovery audit trail...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <History className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-900">No Search History Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {searchQuery || activeTab !== 'all' || verdictFilter !== 'all'
                  ? 'No searches matched your active filters. Try resetting the search or category tabs.'
                  : 'You have not performed any research runs yet. Launch a manual hunt in Studio or trigger an autonomous Autopilot Radar cycle.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/research/new"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition"
              >
                Launch Studio Hunt
              </Link>
              <Link
                href="/autopilot"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
              >
                Run Autopilot Radar
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const deductions = item.deductions;
              const isStrong = item.viabilityScore >= 80;
              const weakCount = deductions?.weakCompetitorsFound ?? (item.report?.serp?.weakCompetitorCount || 0);
              const lowestDr = deductions?.lowestCompetitorDr ?? (item.report?.serp?.medians?.dr?.min || 18);
              const searchVol = item.report?.searchVolume?.targetCountrySv?.value || item.report?.searchVolume?.seedSv?.value || 0;
              const estRev = deductions?.estimatedMonthlyRevenue || item.report?.monetization?.estimatedMonthlyRevenueRange || '$1,500 - $4,500 / mo';

              return (
                <div
                  key={item.id}
                  className="bg-white border-2 border-slate-200/90 hover:border-purple-400 rounded-3xl p-6 transition duration-200 shadow-xs hover:shadow-md space-y-4 relative group"
                >
                  {/* Top Meta Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getOriginBadge(item.searchOrigin)}

                      <span className="text-[11px] text-slate-500 font-medium">
                        Executed by: <strong className="text-slate-700">{item.executedBy || 'User'}</strong>
                      </span>

                      <span className="text-slate-300">•</span>

                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatRelativeTime(item.createdAt)}</span>
                        <span className="text-slate-400">({new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black px-3 py-1 rounded-full ${
                          isStrong
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : item.viabilityScore >= 65
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {item.viabilityScore}/100 • {item.verdict}
                      </span>
                    </div>
                  </div>

                  {/* Main Info Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Left: Niche info & Seed */}
                    <div className="lg:col-span-4 space-y-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Niche Topic & Target Country
                        </span>
                        <h3 className="text-lg font-serif font-bold text-slate-900 mt-0.5 leading-snug">
                          {item.report?.nicheName || item.seedKeyword}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <div className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-slate-800 flex items-center gap-1">
                          <span>&quot;{item.seedKeyword}&quot;</span>
                          <button
                            onClick={(e) => handleCopySeed(item.seedKeyword, item.id, e)}
                            className="text-slate-400 hover:text-slate-700 ml-1"
                            title="Copy Seed Keyword"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        <span className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                          {item.targetCountry}
                        </span>

                        <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          {item.nicheType}
                        </span>
                      </div>
                    </div>

                    {/* Middle & Right: Auto Hunter Deductions & Strategic Findings Box */}
                    <div className="lg:col-span-8 bg-[#18181b] text-white rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-inner">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400">
                            <Cpu className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold tracking-wide text-purple-300">
                            AUTO HUNTER DEDUCTIONS & STRATEGIC FINDINGS
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono">
                          {deductions?.countryTier || 'Tier 1 Priority'}
                        </span>
                      </div>

                      {/* Deduction Summary Text */}
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {deductions?.summary ||
                          `Auto Hunter identified ${weakCount} low DR competitors ranking in Google Top 10 with lowest DR ${lowestDr}. High revenue viability in ${item.targetCountry}.`}
                      </p>

                      {/* 4 Deduction Metric Badges */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-center">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Weak Competitors</span>
                          <strong className="text-emerald-400 text-xs font-mono block mt-0.5">
                            {weakCount} Sites (&lt;20 DR)
                          </strong>
                          <span className="text-[9px] text-slate-500">Lowest DR {lowestDr}</span>
                        </div>

                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-center">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Zero-Click Shield</span>
                          <strong className="text-cyan-300 text-xs font-mono block mt-0.5">
                            {deductions?.zeroClickImmune ? '100% Immune' : 'AI Overview Active'}
                          </strong>
                          <span className="text-[9px] text-slate-500">
                            {deductions?.zeroClickImmune ? 'Raw Tables/Specs' : 'Summary Triggered'}
                          </span>
                        </div>

                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-center">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">RPM & Revenue</span>
                          <strong className="text-amber-400 text-xs font-mono block mt-0.5">
                            {deductions?.estimatedRpm || '$30-$52 RPM'}
                          </strong>
                          <span className="text-[9px] text-slate-500">{estRev}</span>
                        </div>

                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-center">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Search Volume</span>
                          <strong className="text-purple-300 text-xs font-mono block mt-0.5">
                            {searchVol.toLocaleString()}/mo
                          </strong>
                          <span className="text-[9px] text-slate-500">Local demand</span>
                        </div>
                      </div>

                      {/* Recommended Digital Asset */}
                      {deductions?.recommendedAsset && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-300 bg-purple-950/50 border border-purple-800/40 rounded-xl px-3 py-1.5">
                          <strong className="text-purple-300 shrink-0">Recommended Asset:</strong>
                          <span className="truncate">{deductions.recommendedAsset}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-400 font-mono">
                      <span>ID: {item.id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        disabled={deletingId === item.id}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition flex items-center gap-1"
                        title="Delete from History"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>

                      <Link
                        href={`/research/new?seed=${encodeURIComponent(item.seedKeyword)}&country=${encodeURIComponent(item.targetCountry)}`}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Re-Run Scan</span>
                      </Link>

                      <Link
                        href={`/research/${item.id}`}
                        className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 active:scale-95"
                      >
                        <span>Open Full Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Clear History Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-serif font-bold text-lg text-slate-900">Clear Search History</h3>
              </div>
              <button
                onClick={() => setShowClearModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Choose which search history you want to clear. This will delete the recorded audit entries.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleClearHistory('manual')}
                className="w-full py-2.5 px-4 rounded-xl border border-blue-200 text-blue-700 font-bold text-xs hover:bg-blue-50 text-left flex items-center justify-between transition"
              >
                <span>Clear Manual Searches Only ({stats.manualCount})</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleClearHistory('auto_hunter')}
                className="w-full py-2.5 px-4 rounded-xl border border-purple-200 text-purple-700 font-bold text-xs hover:bg-purple-50 text-left flex items-center justify-between transition"
              >
                <span>Clear Auto Hunter Radar Scans Only ({stats.autoHunterCount})</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleClearHistory('all')}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs text-left flex items-center justify-between transition shadow-xs"
              >
                <span>Clear ALL History ({stats.totalSearches} records)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
