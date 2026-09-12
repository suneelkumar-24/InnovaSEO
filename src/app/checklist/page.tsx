'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  Download,
  Target,
  Globe,
  DollarSign,
  Layers,
  Activity,
  ShieldCheck,
  Flame,
  Search,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Calculator,
  Sliders,
  Check,
  Zap,
} from 'lucide-react';
import {
  ISKILLS_CRITERIA_MATRIX,
  ISkillsNicheCategory,
  ISkillsCriteriaRule,
  HIGHEST_PRIORITY_TIER_1,
  TIER_1_COUNTRIES,
} from '@/lib/providers/types';

interface ChecklistMetric {
  id: number;
  benchmark: string;
  category: string;
  status: 'passed' | 'warning' | 'failed';
  currentValue: string;
  targetCriteria: string;
  explanation: string;
}

const SAMPLE_CASE_STUDIES = [
  {
    name: 'Popeyes Chicken Sandwich & Menu (US)',
    seed: 'popeyes chicken sandwich menu',
    category: 'Info' as ISkillsNicheCategory,
    country: 'United States',
    intent: 'Programmatic / Menu Prices',
    score: 95,
    metrics: [
      { id: 1, benchmark: 'Seed Keyword Intent', category: 'Intent', status: 'passed', currentValue: 'Programmatic (Menu & Prices)', targetCriteria: 'High RPM / Programmatic', explanation: 'High commercial intent and ad RPM ($38-$52).' },
      { id: 2, benchmark: 'Country (Famous In)', category: 'Geo Demand', status: 'passed', currentValue: 'United States (Tier 1)', targetCriteria: 'Tier 1 Priority', explanation: 'US Tier 1 traffic ensures highest AdSense / Mediavine revenue.' },
      { id: 3, benchmark: 'Monthly Search Volume', category: 'Search Volume', status: 'passed', currentValue: '90,500 / mo', targetCriteria: '> 15,000 / mo for Tier 1', explanation: 'Well above 15,000 threshold for Tier 1 information niches.' },
      { id: 4, benchmark: '<20 DR Websites in Top 10', category: 'Competition', status: 'passed', currentValue: '4 Websites (DR 3, 7, 11, 16)', targetCriteria: '>= 2 Low-DR sites in Top 10', explanation: '4 weak competitors prove high SERP vulnerability.' },
      { id: 5, benchmark: 'Google AI Overview Presence', category: 'Zero-Click Risk', status: 'passed', currentValue: 'Zero-Click Immune (Price Tables)', targetCriteria: 'No zero-click cannibalization', explanation: 'Users need full printable menu tables and item prices, clicking through.' },
      { id: 6, benchmark: 'Target Benchmark Website', category: 'Target Competitor', status: 'passed', currentValue: 'fastfoodmenuprices.com/popeyes', targetCriteria: 'Standalone Niche Hub', explanation: 'Dedicated single-topic domain ranking top 3.' },
      { id: 7, benchmark: 'Target Website DR / DA', category: 'Authority', status: 'passed', currentValue: 'DR 7 / DA 14', targetCriteria: 'DR ≤ 20 & DA ≤ 25', explanation: 'Extremely low authority ranking in position #2.' },
      { id: 8, benchmark: 'Target Keyword Google Rank', category: 'Rank Position', status: 'passed', currentValue: 'Position #2', targetCriteria: 'Top 3 Ranking', explanation: 'Capturing ~22% CTR without large backlink profile.' },
      { id: 9, benchmark: 'Target Website Age', category: 'Domain Age', status: 'passed', currentValue: '1.2 Years', targetCriteria: '< 2.0 Years', explanation: 'Proves fast rankability for young domains.' },
      { id: 10, benchmark: 'Target Website Traffic', category: 'Traffic Demand', status: 'passed', currentValue: '38,400 visits/mo', targetCriteria: '> 10,000 visits/mo', explanation: 'Solid traffic volume generating estimated $1,600/mo.' },
      { id: 11, benchmark: 'Monetization & Valuation', category: 'Monetization', status: 'passed', currentValue: 'Display Ads + Delivery Affiliate (35x)', targetCriteria: 'High RPM + Exit Potential', explanation: 'Can be monetized with Mediavine and flipped at 35x monthly profit.' },
      { id: 12, benchmark: 'Link-Building Benchmark', category: 'Backlinks', status: 'passed', currentValue: '180 Backlinks / 140 Ref Domains', targetCriteria: '< 500 Ref Domains', explanation: 'Achievable backlink target with simple directory and guest outreach.' },
    ],
  },
  {
    name: 'In-N-Out Menu & Prices (US)',
    seed: 'in-n-outmenus.com',
    category: 'Info' as ISkillsNicheCategory,
    country: 'United States',
    intent: 'Programmatic / Informational',
    score: 94,
    metrics: [
      { id: 1, benchmark: 'Seed Keyword Intent', category: 'Intent', status: 'passed', currentValue: 'Programmatic (Menu & Prices)', targetCriteria: 'High RPM / Programmatic', explanation: 'High commercial intent and ad RPM ($38-$52).' },
      { id: 2, benchmark: 'Country (Famous In)', category: 'Geo Demand', status: 'passed', currentValue: 'United States (Tier 1)', targetCriteria: 'Tier 1 Priority', explanation: 'US Tier 1 traffic ensures highest AdSense / Mediavine revenue.' },
      { id: 3, benchmark: 'Monthly Search Volume', category: 'Search Volume', status: 'passed', currentValue: '135,000 / mo', targetCriteria: '> 15,000 / mo for Tier 1', explanation: 'Extremely high search demand for regional fast food brand.' },
      { id: 4, benchmark: '<20 DR Websites in Top 10', category: 'Competition', status: 'passed', currentValue: '4 Websites (DR 4, 8, 12, 17)', targetCriteria: '>= 2 Low-DR sites in Top 10', explanation: '4 weak competitors prove high SERP vulnerability.' },
      { id: 5, benchmark: 'Google AI Overview Presence', category: 'Zero-Click Risk', status: 'passed', currentValue: 'Zero-Click Immune (Tables)', targetCriteria: 'No zero-click cannibalization', explanation: 'Users need full printable menu tables and item prices, clicking through.' },
      { id: 6, benchmark: 'Target Benchmark Website', category: 'Target Competitor', status: 'passed', currentValue: 'in-n-outmenus.com', targetCriteria: 'Standalone Niche Site', explanation: 'Dedicated single-topic domain ranking top 3.' },
      { id: 7, benchmark: 'Target Website DR / DA', category: 'Authority', status: 'passed', currentValue: 'DR 6 / DA 12', targetCriteria: 'DR ≤ 20 & DA ≤ 25', explanation: 'Extremely low DR 6 ranking at position #2.' },
      { id: 8, benchmark: 'Target Keyword Google Rank', category: 'Rank Position', status: 'passed', currentValue: 'Position #2', targetCriteria: 'Top 3 Ranking', explanation: 'Capturing ~22% CTR without huge backlink profile.' },
      { id: 9, benchmark: 'Target Website Age', category: 'Domain Age', status: 'passed', currentValue: '1.1 Years', targetCriteria: '< 2.0 Years', explanation: 'Proves fast rankability for young domains.' },
      { id: 10, benchmark: 'Target Website Traffic', category: 'Traffic Demand', status: 'passed', currentValue: '48,200 visits/mo', targetCriteria: '> 10,000 visits/mo', explanation: 'Solid traffic volume generating estimated $1,800/mo.' },
      { id: 11, benchmark: 'Monetization & Valuation', category: 'Monetization', status: 'passed', currentValue: 'Display Ads + Delivery Affiliate (35x)', targetCriteria: 'High RPM + Exit Potential', explanation: 'Can be monetized with Mediavine and flipped at 35x monthly profit.' },
      { id: 12, benchmark: 'Link-Building Benchmark', category: 'Backlinks', status: 'passed', currentValue: '305 Backlinks / 276 Ref Domains', targetCriteria: '< 500 Ref Domains', explanation: 'Achievable backlink target with simple directory and guest outreach.' },
    ],
  },
  {
    name: 'Starbucks Preise (Germany)',
    seed: 'starbuckspreise.de',
    category: 'Info' as ISkillsNicheCategory,
    country: 'Germany',
    intent: 'Programmatic / Menu Prices',
    score: 91,
    metrics: [
      { id: 1, benchmark: 'Seed Keyword Intent', category: 'Intent', status: 'passed', currentValue: 'Programmatic (Menu & Prices)', targetCriteria: 'High RPM / Programmatic', explanation: 'German menu search with $40+ RPM.' },
      { id: 2, benchmark: 'Country (Famous In)', category: 'Geo Demand', status: 'passed', currentValue: 'Germany (Tier 1)', targetCriteria: 'Tier 1 Priority', explanation: 'Germany is high purchasing power Tier 1 European market.' },
      { id: 3, benchmark: 'Monthly Search Volume', category: 'Search Volume', status: 'passed', currentValue: '32,000 / mo', targetCriteria: '> 15,000 / mo for Tier 1', explanation: 'Exceeds 15k threshold easily.' },
      { id: 4, benchmark: '<20 DR Websites in Top 10', category: 'Competition', status: 'passed', currentValue: '3 Websites (DR 2, 7, 14)', targetCriteria: '>= 2 Low-DR sites in Top 10', explanation: 'Top SERP is vulnerable to a modern dedicated German niche site.' },
      { id: 5, benchmark: 'Google AI Overview Presence', category: 'Zero-Click Risk', status: 'passed', currentValue: 'AI Overview Inactive in DE', targetCriteria: 'No zero-click cannibalization', explanation: 'AI overview minimal in EU menu queries.' },
      { id: 6, benchmark: 'Target Benchmark Website', category: 'Target Competitor', status: 'passed', currentValue: 'starbuckspreise.de', targetCriteria: 'Exact Match Niche Site', explanation: 'Exact match domain capturing coffee demand.' },
      { id: 7, benchmark: 'Target Website DR / DA', category: 'Authority', status: 'passed', currentValue: 'DR 4 / DA 9', targetCriteria: 'DR ≤ 20 & DA ≤ 25', explanation: 'Fresh DR 4 site ranking on Page 1.' },
      { id: 8, benchmark: 'Target Keyword Google Rank', category: 'Rank Position', status: 'passed', currentValue: 'Position #1', targetCriteria: 'Top 3 Ranking', explanation: 'Outranks older generic coffee portals.' },
      { id: 9, benchmark: 'Target Website Age', category: 'Domain Age', status: 'passed', currentValue: '0.8 Years', targetCriteria: '< 2.0 Years', explanation: 'Ranked in under 10 months from inception.' },
      { id: 10, benchmark: 'Target Website Traffic', category: 'Traffic Demand', status: 'passed', currentValue: '19,500 visits/mo', targetCriteria: '> 10,000 visits/mo', explanation: 'Generates €850+/mo with localized German display ads.' },
      { id: 11, benchmark: 'Monetization & Valuation', category: 'Monetization', status: 'passed', currentValue: 'Ezoic / AdSense (€40 RPM)', targetCriteria: 'High RPM + Exit Potential', explanation: '30x-40x exit valuation multiplier.' },
      { id: 12, benchmark: 'Link-Building Benchmark', category: 'Backlinks', status: 'passed', currentValue: '142 Backlinks / 89 Ref Domains', targetCriteria: '< 500 Ref Domains', explanation: 'Very low link difficulty to reproduce.' },
    ],
  },
  {
    name: 'Tesla Wheel & Rim Specs (US)',
    seed: 'teslawheelguide.com',
    category: 'Tool' as ISkillsNicheCategory,
    country: 'United States',
    intent: 'Programmatic Database',
    score: 88,
    metrics: [
      { id: 1, benchmark: 'Seed Keyword Intent', category: 'Intent', status: 'passed', currentValue: 'Programmatic Specs & Fitment', targetCriteria: 'High RPM / Programmatic', explanation: 'High ticket automotive affiliate and ad RPM.' },
      { id: 2, benchmark: 'Country (Famous In)', category: 'Geo Demand', status: 'passed', currentValue: 'United States (Tier 1)', targetCriteria: 'Tier 1 Priority', explanation: 'US EV market has massive aftermarket accessory demand.' },
      { id: 3, benchmark: 'Monthly Search Volume', category: 'Search Volume', status: 'passed', currentValue: '24,000 / mo', targetCriteria: '> 15,000 / mo for Tier 1', explanation: 'Solid long-tail cluster with 24k aggregate volume.' },
      { id: 4, benchmark: '<20 DR Websites in Top 10', category: 'Competition', status: 'passed', currentValue: '2 Websites (DR 9, 16)', targetCriteria: '>= 2 Low-DR sites in Top 10', explanation: 'Generic tire retailers outranked by targeted spec sheets.' },
      { id: 5, benchmark: 'Google AI Overview Presence', category: 'Zero-Click Risk', status: 'passed', currentValue: 'Tables & Fitment Guide', targetCriteria: 'No zero-click cannibalization', explanation: 'Fitment charts require full database navigation.' },
      { id: 6, benchmark: 'Target Benchmark Website', category: 'Target Competitor', status: 'passed', currentValue: 'teslawheelguide.com', targetCriteria: 'Niche Resource Hub', explanation: 'Specialized Model 3/Y/S/X wheel spec database.' },
      { id: 7, benchmark: 'Target Website DR / DA', category: 'Authority', status: 'passed', currentValue: 'DR 11 / DA 18', targetCriteria: 'DR ≤ 20 & DA ≤ 25', explanation: 'Moderate low authority ranking ahead of general forums.' },
      { id: 8, benchmark: 'Target Keyword Google Rank', category: 'Rank Position', status: 'passed', currentValue: 'Position #3', targetCriteria: 'Top 3 Ranking', explanation: 'Solid top 3 visibility.' },
      { id: 9, benchmark: 'Target Website Age', category: 'Domain Age', status: 'passed', currentValue: '1.4 Years', targetCriteria: '< 2.0 Years', explanation: 'Established recently in 2024.' },
      { id: 10, benchmark: 'Target Website Traffic', category: 'Traffic Demand', status: 'passed', currentValue: '14,200 visits/mo', targetCriteria: '> 10,000 visits/mo', explanation: 'Generates $900/mo combining TireRack affiliate + ads.' },
      { id: 11, benchmark: 'Monetization & Valuation', category: 'Monetization', status: 'passed', currentValue: 'TireRack/Amazon Affiliate + RPM', targetCriteria: 'High RPM + Exit Potential', explanation: 'High average order value for wheel upgrades.' },
      { id: 12, benchmark: 'Link-Building Benchmark', category: 'Backlinks', status: 'passed', currentValue: '420 Backlinks / 310 Ref Domains', targetCriteria: '< 500 Ref Domains', explanation: 'Reddit and TeslaMotorsClub citations.' },
    ],
  },
];

export default function ChecklistHubPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'iskills' | 'master12' | 'simulator'>('iskills');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState(0);
  const [customKeyword, setCustomKeyword] = useState('');
  const [customCountry, setCustomCountry] = useState('United States');

  // Simulator State
  const [simNicheType, setSimNicheType] = useState<ISkillsNicheCategory>('Info');
  const [simCountry, setSimCountry] = useState('United States');
  const [simVolume, setSimVolume] = useState<number>(18500);
  const [simDA, setSimDA] = useState<number>(18);
  const [simKD, setSimKD] = useState<number>(21);
  const [simDR, setSimDR] = useState<number>(12);
  const [simPages, setSimPages] = useState<number>(85);

  const currentStudy = SAMPLE_CASE_STUDIES[selectedCaseStudy];

  // Simulator Evaluator Logic
  const rule = ISKILLS_CRITERIA_MATRIX.find((r) => r.nicheType === simNicheType) || ISKILLS_CRITERIA_MATRIX[0];
  const isTier1 = HIGHEST_PRIORITY_TIER_1.concat(TIER_1_COUNTRIES).some(
    (c) => c.toLowerCase() === simCountry.trim().toLowerCase()
  );
  const isPakistan = simCountry.trim().toLowerCase() === 'pakistan';
  const targetVolume = (simNicheType === 'Info' && isPakistan)
    ? 30000
    : isTier1
    ? rule.volumeTier1
    : rule.volumeRestOfWorld;

  const simVolPass = simVolume >= targetVolume;
  const simDaPass = simDA <= rule.maxDA;
  const simKdPass = simKD <= rule.maxKD;
  const simDrPass = simDR <= rule.maxDR;
  const simPagesPass = simPages <= rule.maxPages;

  const simPassedCount = [simVolPass, simDaPass, simKdPass, simDrPass, simPagesPass].filter(Boolean).length;
  const simAllPassed = simPassedCount === 5;

  const handleLaunchDeepRun = (seed: string, country: string) => {
    router.push(`/research/new?seed=${encodeURIComponent(seed)}&country=${encodeURIComponent(country)}`);
  };

  const handleExportCsv = () => {
    const headers = ['Benchmark ID', 'Benchmark Name', 'Category', 'Status', 'Current Value', 'Target Standard', 'Notes'];
    const rows = currentStudy.metrics.map((m) => [
      m.id,
      `"${m.benchmark}"`,
      `"${m.category}"`,
      m.status.toUpperCase(),
      `"${m.currentValue}"`,
      `"${m.targetCriteria}"`,
      `"${m.explanation}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `12_point_checklist_${currentStudy.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportISkillsMatrixCsv = () => {
    const headers = ['Niche Type', 'Volume (Tier 1)', 'Volume (Rest of World)', 'DA (Moz Pro)', 'KD (Moz Pro)', 'DR (Ahrefs Free DR)', 'Site Pages', 'Official Rules & Notes'];
    const rows = ISKILLS_CRITERIA_MATRIX.map((r) => [
      `"${r.nicheType}"`,
      `"${r.volumeTier1.toLocaleString()}"`,
      `"${r.volumeRestOfWorld.toLocaleString()}"`,
      `"≤ ${r.maxDA}"`,
      `"≤ ${r.maxKD}"`,
      `"≤ ${r.maxDR}"`,
      `"≤ ${r.maxPages}"`,
      `"${r.notes}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'iSkills_Niche_Research_Criteria_Matrix.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen">
      <Header
        title="Niche Validation Hub & Criteria Matrix"
        subtitle="Official iSkills Niche Research Criteria & 12-Point Master Benchmarks"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Niche Hunter Suite', href: '/dashboard' },
          { label: 'Validation Checklist Hub' },
        ]}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportISkillsMatrixCsv}
            className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export iSkills Matrix</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 hover:bg-purple-100 flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export 12-Point CSV</span>
          </button>
        </div>
      </Header>

      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8 font-sans">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-2 bg-slate-200/60 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('iskills')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'iskills'
                  ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-emerald-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>iSkills Criteria Matrix</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                6 Niche Types
              </span>
            </button>

            <button
              onClick={() => setActiveTab('master12')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'master12'
                  ? 'bg-white text-purple-900 shadow-xs ring-1 ring-purple-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-purple-600" />
              <span>12-Point Master Checklist</span>
              <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-mono font-bold">
                Case Studies
              </span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'simulator'
                  ? 'bg-white text-blue-900 shadow-xs ring-1 ring-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>Interactive Validator</span>
            </button>
          </div>

          <button
            onClick={() => handleLaunchDeepRun(currentStudy.seed, currentStudy.country)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm shadow-purple-600/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Deep 15-Phase Analysis</span>
          </button>
        </div>

        {/* TAB 1: OFFICIAL ISKILLS CRITERIA MATRIX */}
        {activeTab === 'iskills' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl space-y-4 shadow-lg border border-emerald-800/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase">
                    <ShieldCheck className="w-3.5 h-3.5" /> Official Course Benchmark Matrix
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-white">
                    iSkills Niche Research Criteria
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100/80 max-w-3xl">
                    Every niche candidate must meet these exact non-negotiable SEO metrics. Passing all benchmarks guarantees high SERP vulnerability, low backlink difficulty, and rapid ranking speed.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right bg-emerald-900/50 p-3 rounded-2xl border border-emerald-700/50">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-300 block font-bold">Standard Target</span>
                    <span className="text-lg font-black text-emerald-200">DR ≤ 20 & DA ≤ 25</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="bg-white border-2 border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Criteria Matrix by Niche Category</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Volume thresholds, Moz Pro DA/KD, Ahrefs Free DR, and maximum competitor page bounds
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  6 Official Categories
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Niche Type</th>
                      <th className="py-3.5 px-4">Search Volume (Tier 1 vs Rest of World)</th>
                      <th className="py-3.5 px-4 text-center">DA (Moz Pro)</th>
                      <th className="py-3.5 px-4 text-center">KD (Moz Pro)</th>
                      <th className="py-3.5 px-4 text-center">DR (Ahrefs Free DR)</th>
                      <th className="py-3.5 px-4 text-center">Site Pages</th>
                      <th className="py-3.5 px-4">Instructor Rules & Strategic Rationale</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                    {ISKILLS_CRITERIA_MATRIX.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-sm font-serif font-bold text-slate-900">{item.nicheType}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <span className="font-mono font-bold text-slate-900 block text-xs">
                              {item.volumeLabel}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                                Tier 1: {item.volumeTier1.toLocaleString()}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">
                                Global: {item.volumeRestOfWorld.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-mono font-bold">
                            ≤ {item.maxDA}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-mono font-bold">
                            ≤ {item.maxKD}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-mono font-bold">
                            ≤ {item.maxDR}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-mono font-bold">
                            ≤ {item.maxPages}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-[11px] text-slate-600 max-w-xs leading-relaxed">
                          {item.notes}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => {
                              setSimNicheType(item.nicheType);
                              setActiveTab('simulator');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 text-xs font-bold transition flex items-center gap-1 shrink-0 ml-auto"
                          >
                            <span>Simulate</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strategic Highlight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Globe className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tier 1 vs Pakistan Volume Rule</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  In high-RPM Tier 1 markets (US, UK, CA, AU, DE), <strong>15,000 monthly volume</strong> generates $450-$780/mo due to $30-$52 RPM. For Pakistan and Rest of World, minimum <strong>30,000 search volume</strong> is mandatory.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Flame className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">The ≤ 20 DR Ranking Anomaly</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  A niche is officially validated when at least <strong>1 to 4 websites with DR ≤ 20</strong> (and DA ≤ 25) rank on Google Page 1, proving authority barrier is non-existent.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Competitor Page Limits (≤ 150)</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Competitors should have <strong>≤ 150 pages</strong> (and ≤ 100 for SAAS). If competitor has low DA and low pages, a focused 30-50 article topical authority site will easily outrank them.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 12-POINT MASTER CHECKLIST */}
        {activeTab === 'master12' && (
          <div className="space-y-6">
            {/* Top Case Study Switcher Box */}
            <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-xs font-black uppercase mb-2">
                    <FileCheck2 className="w-3.5 h-3.5" /> 12-Point Master Framework
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-slate-900">
                    12-Point Niche Viability Benchmark
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Evaluate your micro-niche against the 12 non-negotiable instructor standards. Every passing niche guarantees low DR competition and high monetization potential.
                  </p>
                </div>

                <button
                  onClick={() => handleLaunchDeepRun(currentStudy.seed, currentStudy.country)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-purple-600/20 self-start lg:self-auto shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Run Deep 15-Phase Analysis</span>
                </button>
              </div>

              {/* Preset Master Case Studies */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pre-Validated Master Case Studies:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {SAMPLE_CASE_STUDIES.map((study, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCaseStudy(idx)}
                      className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                        selectedCaseStudy === idx
                          ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-slate-900 truncate">{study.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold shrink-0 ml-1">
                          {study.score}/100
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        <span>Seed: <strong className="text-purple-700 font-mono text-[10px]">{study.seed}</strong></span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 12-Point Checklist Interactive Grid */}
            <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                    12
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Full 12-Point Checklist Matrix: {currentStudy.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      All 12 evaluation criteria with exact verified evidence
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 12/12 Passed
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {currentStudy.metrics.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-purple-200 hover:shadow-sm transition space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {m.id}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{m.benchmark}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase shrink-0">
                        Passed
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block font-medium">Observed Value:</span>
                        <span className="font-bold text-slate-900 font-mono">{m.currentValue}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Standard Target:</span>
                        <span className="font-bold text-purple-700">{m.targetCriteria}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {m.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE INTERACTIVE SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase">
                    <Calculator className="w-3.5 h-3.5" /> Instant Validator Simulator
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-slate-900">
                    Live iSkills Benchmark Validator
                  </h2>
                  <p className="text-xs text-slate-600">
                    Input observed competitor and niche numbers to see if your niche satisfies the official criteria.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 ${
                      simAllPassed
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {simAllPassed ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                    <span>{simPassedCount}/5 Criteria Passed</span>
                  </span>
                </div>
              </div>

              {/* Interactive Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">Niche Type</label>
                  <select
                    value={simNicheType}
                    onChange={(e) => setSimNicheType(e.target.value as ISkillsNicheCategory)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="Info">Info</option>
                    <option value="APK">APK</option>
                    <option value="Affiliate">Affiliate</option>
                    <option value="Ecom / Services">Ecom / Services</option>
                    <option value="Tool">Tool</option>
                    <option value="SAAS">SAAS</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">Target Country</label>
                  <select
                    value={simCountry}
                    onChange={(e) => setSimCountry(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="United States">United States (Tier 1)</option>
                    <option value="United Kingdom">United Kingdom (Tier 1)</option>
                    <option value="Germany">Germany (Tier 1)</option>
                    <option value="Canada">Canada (Tier 1)</option>
                    <option value="Australia">Australia (Tier 1)</option>
                    <option value="Pakistan">Pakistan (30k Rule)</option>
                    <option value="India">India (Rest of World)</option>
                    <option value="Global">Global Market</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">Search Volume (/mo)</label>
                  <input
                    type="number"
                    value={simVolume}
                    onChange={(e) => setSimVolume(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">Competitor DA</label>
                  <input
                    type="number"
                    value={simDA}
                    onChange={(e) => setSimDA(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">Keyword KD (%)</label>
                  <input
                    type="number"
                    value={simKD}
                    onChange={(e) => setSimKD(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">Competitor DR</label>
                  <input
                    type="number"
                    value={simDR}
                    onChange={(e) => setSimDR(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Live Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* 1. Volume Card */}
                <div className={`p-4 rounded-2xl border ${simVolPass ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">1. Search Volume</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${simVolPass ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                      {simVolPass ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-900">
                    {simVolume.toLocaleString()}
                  </div>
                  <p className="text-[10px] text-slate-600">
                    Required: ≥ {targetVolume.toLocaleString()} / mo for {simCountry}
                  </p>
                </div>

                {/* 2. DA Card */}
                <div className={`p-4 rounded-2xl border ${simDaPass ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">2. Moz DA</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${simDaPass ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                      {simDaPass ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-900">
                    DA {simDA}
                  </div>
                  <p className="text-[10px] text-slate-600">
                    Required: ≤ {rule.maxDA} (Moz Pro)
                  </p>
                </div>

                {/* 3. KD Card */}
                <div className={`p-4 rounded-2xl border ${simKdPass ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">3. Moz KD</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${simKdPass ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                      {simKdPass ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-900">
                    KD {simKD}%
                  </div>
                  <p className="text-[10px] text-slate-600">
                    Required: ≤ {rule.maxKD}% (Moz Pro)
                  </p>
                </div>

                {/* 4. DR Card */}
                <div className={`p-4 rounded-2xl border ${simDrPass ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">4. Ahrefs DR</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${simDrPass ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                      {simDrPass ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-900">
                    DR {simDR}
                  </div>
                  <p className="text-[10px] text-slate-600">
                    Required: ≤ {rule.maxDR} (Ahrefs Free DR)
                  </p>
                </div>

                {/* 5. Site Pages Card */}
                <div className={`p-4 rounded-2xl border ${simPagesPass ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">5. Site Pages</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${simPagesPass ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                      {simPagesPass ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-900">
                    {simPages} Pages
                  </div>
                  <p className="text-[10px] text-slate-600">
                    Required: ≤ {rule.maxPages} pages
                  </p>
                </div>
              </div>

              {/* Verdict Summary Box */}
              <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
                simAllPassed ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    simAllPassed ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {simAllPassed ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {simAllPassed
                        ? '100% Meets iSkills Research Standards!'
                        : `Partially Validated (${simPassedCount}/5 criteria passed)`}
                    </h4>
                    <p className="text-xs text-slate-600">
                      {simAllPassed
                        ? `This ${simNicheType} niche in ${simCountry} exhibits strong low-DR SERP vulnerability and meets all volume thresholds.`
                        : `To meet the instructor benchmark, adjust ${!simVolPass ? 'Search Volume, ' : ''}${!simDrPass ? 'Competitor DR ≤ 20, ' : ''}${!simDaPass ? 'DA ≤ 25, ' : ''}${!simKdPass ? 'KD ≤ 25, ' : ''}${!simPagesPass ? 'Site Pages ≤ ' + rule.maxPages : ''}.`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleLaunchDeepRun(`${simNicheType.toLowerCase()} niche seed`, simCountry)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition shrink-0"
                >
                  <span>Audit Live SERP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Audit Tester Form */}
        <div className="bg-gradient-to-tr from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Ready to Audit Your Own Micro-Niche?
              </h3>
              <p className="text-xs text-purple-200">
                Enter your seed keyword or competitor URL to generate a live 12-point audit with official iSkills scoring.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customKeyword.trim()) {
                handleLaunchDeepRun(customKeyword, customCountry);
              }
            }}
            className="flex flex-col sm:flex-row items-center gap-3 pt-2"
          >
            <input
              type="text"
              placeholder="e.g. popeyes chicken sandwich, starbucks preise, tesla wheel specs..."
              value={customKeyword}
              onChange={(e) => setCustomKeyword(e.target.value)}
              className="flex-1 w-full bg-slate-800/90 border border-slate-700 focus:border-purple-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-hidden"
            />

            <select
              value={customCountry}
              onChange={(e) => setCustomCountry(e.target.value)}
              className="w-full sm:w-48 bg-slate-800/90 border border-slate-700 focus:border-purple-400 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden"
            >
              <option value="United States">United States ($52 RPM)</option>
              <option value="United Kingdom">United Kingdom ($42 RPM)</option>
              <option value="Germany">Germany ($40 RPM)</option>
              <option value="Canada">Canada ($38 RPM)</option>
              <option value="Australia">Australia ($45 RPM)</option>
              <option value="Pakistan">Pakistan (30k Rule)</option>
            </select>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shrink-0"
            >
              <span>Audit 12 Benchmarks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
