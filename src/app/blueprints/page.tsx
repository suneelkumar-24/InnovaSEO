'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import {
  Layers,
  DollarSign,
  Store,
  Sparkles,
  ArrowRight,
  Download,
  Calculator,
  Database,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  Globe,
  ExternalLink,
  ChevronRight,
  FileSpreadsheet,
  Zap,
  Calendar,
  Clock,
  Copy,
  Check,
  Flame,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { COUNTRY_GEO_REGISTRY } from '@/lib/geo';

function BlueprintsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'programmatic';

  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t) setActiveTab(t);
  }, [searchParams]);

  // --- TAB 1: Programmatic State ---
  const [selectedSchema, setSelectedSchema] = useState<'menu' | 'car_specs' | 'tools'>('menu');

  // --- TAB 2: RPM Calculator State ---
  const [calcCountry, setCalcCountry] = useState<string>('United States');
  const [calcSearchVolume, setCalcSearchVolume] = useState<number>(35000);
  const [calcRpm, setCalcRpm] = useState<number>(45);

  const selectedCountryGeo = COUNTRY_GEO_REGISTRY[calcCountry] || COUNTRY_GEO_REGISTRY['United States'];

  // Calculations:
  // Rank 1: 32% CTR, Rank 2: 22% CTR, Rank 3: 16% CTR
  const rank1Visitors = Math.round(calcSearchVolume * 0.32);
  const rank2Visitors = Math.round(calcSearchVolume * 0.22);
  const rank3Visitors = Math.round(calcSearchVolume * 0.16);

  const rank1Earnings = Math.round((rank1Visitors / 1000) * calcRpm);
  const rank2Earnings = Math.round((rank2Visitors / 1000) * calcRpm);
  const rank3Earnings = Math.round((rank3Visitors / 1000) * calcRpm);

  const exitValuationRank1 = rank1Earnings * 35; // 35x monthly multiplier

  // --- TAB 3: Marketplace State ---
  const [marketplaceUrl, setMarketplaceUrl] = useState('');
  const [analyzingMarket, setAnalyzingMarket] = useState(false);

  // --- TAB 4: Fast-Mover Keyword Mapping & Content Scheduler State ---
  const [mappingSeed, setMappingSeed] = useState('Monday Morning Blessings');
  const [mappingCadence, setMappingCadence] = useState<'1_per_day' | '2_per_day'>('2_per_day');
  const [mappingCompetitor, setMappingCompetitor] = useState('blessingquoteshub.com (DR 3, Age 0.7 yrs, 34k visits)');
  const [mappingBackup1, setMappingBackup1] = useState('morningprayersdaily.org (DR 4, Age 0.9 yrs, 22k visits)');
  const [mappingBackup2, setMappingBackup2] = useState('dailyblessedquotes.net (DR 2, Age 0.5 yrs, 18k visits)');
  const [copiedSchedule, setCopiedSchedule] = useState(false);

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen font-sans">
      <Header
        title="Monetization Blueprints & Programmatic Builder"
        subtitle="Turn validated micro-niches into high-RPM digital assets and scalable programmatic database sites"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Niche Hunter Suite', href: '/dashboard' },
          { label: 'Monetization Blueprints' },
        ]}
      />

      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl max-w-4xl shadow-xs">
          <button
            onClick={() => setActiveTab('programmatic')}
            className={`flex-1 min-w-[180px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition ${
              activeTab === 'programmatic'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Programmatic DB (500+ URLs)</span>
          </button>

          <button
            onClick={() => setActiveTab('mapping')}
            className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition ${
              activeTab === 'mapping'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>⚡ 90-Day Keyword Mapping &amp; Scheduler</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 min-w-[180px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition ${
              activeTab === 'calculator'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Tier 1 RPM Calculator ($30-$52)</span>
          </button>

          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex-1 min-w-[180px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition ${
              activeTab === 'marketplace'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Marketplace Exit Flippa</span>
          </button>
        </div>

        {/* TAB 1: PROGRAMMATIC DATABASE BUILDER */}
        {activeTab === 'programmatic' && (
          <div className="space-y-6">
            <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-xs font-black uppercase mb-2">
                    <Database className="w-3.5 h-3.5" /> Programmatic Asset Architecture
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-slate-900">
                    500+ URLs Programmatic Database Blueprint
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Programmatic database sites (specs, dimensions, menu prices, local costs) are 100% immune to Google AI Overviews because users require granular tables and multi-parameter filtering.
                  </p>
                </div>
              </div>

              {/* Schema Type Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedSchema('menu')}
                  className={`p-4 rounded-2xl border text-left transition ${
                    selectedSchema === 'menu'
                      ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block">Fast Casual Menu & Price Schema</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">50 States x 30 Items = 1,500 programmatic URLs</span>
                </button>

                <button
                  onClick={() => setSelectedSchema('car_specs')}
                  className={`p-4 rounded-2xl border text-left transition ${
                    selectedSchema === 'car_specs'
                      ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block">Vehicle Wheel & Fitment Specs</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">400 Models x 4 Trims = 1,600 programmatic spec sheets</span>
                </button>

                <button
                  onClick={() => setSelectedSchema('tools')}
                  className={`p-4 rounded-2xl border text-left transition ${
                    selectedSchema === 'tools'
                      ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block">Micro Utility Calculator Hub</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Interactive single-page apps with freemium CTAs</span>
                </button>
              </div>

              {/* Programmatic Schema Specs Table */}
              <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between text-purple-300 border-b border-slate-800 pb-3 font-sans">
                  <span className="font-bold text-sm">Generated Database Fields & URL Structure</span>
                  <span className="bg-purple-900/80 text-purple-200 text-[10px] px-2 py-0.5 rounded font-bold">
                    AI Overview Immune: 100%
                  </span>
                </div>

                <div className="space-y-2 text-slate-300">
                  <p><span className="text-amber-400">URL Pattern:</span> /{'{brand}'}/{'{category}'}/{'{item-slug}'}-prices-{'{state-code}'}</p>
                  <p><span className="text-emerald-400">Schema Fields:</span> item_name, price_usd, calories, allergen_info, category, state_tax_multiplier, date_verified</p>
                  <p><span className="text-purple-400">Monetization:</span> Mediavine / Raptive Header Bidding Ads ($48 RPM) + UberEats / DoorDash Affiliate CTAs ($3 per new customer)</p>
                  <p><span className="text-sky-400">Target Silo Count:</span> 500 - 2,500 programmatic indexable nodes</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TIER 1 RPM REVENUE CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-black uppercase mb-2">
                    <DollarSign className="w-3.5 h-3.5" /> High-RPM Revenue Engine
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-slate-900">
                    Tier 1 Market Earnings & Asset Valuation Calculator
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Calculate realistic monthly earnings across Google positions #1 (32% CTR), #2 (22% CTR), and #3 (16% CTR) and projected exit valuation at 35x multiplier.
                  </p>
                </div>
              </div>

              {/* Calculator Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Country & Tier</label>
                  <select
                    value={calcCountry}
                    onChange={(e) => {
                      setCalcCountry(e.target.value);
                      const conf = COUNTRY_GEO_REGISTRY[e.target.value];
                      if (conf) setCalcRpm(conf.baseRpm);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden"
                  >
                    <option value="United States">United States (Tier 1 - $38-$52 RPM)</option>
                    <option value="Germany">Germany (Tier 1 - €32-€55 RPM)</option>
                    <option value="United Kingdom">United Kingdom (Tier 1 - £28-£48 RPM)</option>
                    <option value="Canada">Canada (Tier 1 - $30-$48 RPM)</option>
                    <option value="Australia">Australia (Tier 1 - $32-$50 RPM)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Monthly Search Volume</label>
                  <input
                    type="number"
                    value={calcSearchVolume}
                    onChange={(e) => setCalcSearchVolume(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Expected RPM ($ / 1k Views)</label>
                  <input
                    type="number"
                    value={calcRpm}
                    onChange={(e) => setCalcRpm(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-purple-700 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Ranking Position Revenue Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {/* Position #1 */}
                <div className="bg-gradient-to-tr from-purple-700 via-purple-800 to-indigo-900 rounded-3xl p-6 text-white space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-purple-200">Google Position #1</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-[10px] font-bold">32% CTR</span>
                  </div>
                  <span className="text-3xl font-black font-mono block">${rank1Earnings.toLocaleString()}<span className="text-xs font-normal text-purple-200"> /mo</span></span>
                  <div className="text-xs text-purple-200 border-t border-purple-500/30 pt-2 space-y-1">
                    <p>Estimated Visitors: <strong>{rank1Visitors.toLocaleString()} visits/mo</strong></p>
                    <p>35x Exit Valuation: <strong>${exitValuationRank1.toLocaleString()}</strong></p>
                  </div>
                </div>

                {/* Position #2 */}
                <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 text-slate-900 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Google Position #2</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">22% CTR</span>
                  </div>
                  <span className="text-3xl font-black font-mono text-purple-700 block">${rank2Earnings.toLocaleString()}<span className="text-xs font-normal text-slate-400"> /mo</span></span>
                  <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 space-y-1">
                    <p>Estimated Visitors: <strong>{rank2Visitors.toLocaleString()} visits/mo</strong></p>
                    <p>35x Exit Valuation: <strong>${(rank2Earnings * 35).toLocaleString()}</strong></p>
                  </div>
                </div>

                {/* Position #3 */}
                <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 text-slate-900 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Google Position #3</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">16% CTR</span>
                  </div>
                  <span className="text-3xl font-black font-mono text-slate-800 block">${rank3Earnings.toLocaleString()}<span className="text-xs font-normal text-slate-400"> /mo</span></span>
                  <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 space-y-1">
                    <p>Estimated Visitors: <strong>{rank3Visitors.toLocaleString()} visits/mo</strong></p>
                    <p>35x Exit Valuation: <strong>${(rank3Earnings * 35).toLocaleString()}</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MARKETPLACE EXIT BLUEPRINTS */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 border border-rose-200 text-rose-800 text-xs font-black uppercase mb-2">
                    <Store className="w-3.5 h-3.5" /> Flippa / Empire Flippers Reverse Engine
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-slate-900">
                    Marketplace Reverse Engineering & Exit Patterns
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Reverse engineer verified sold businesses on digital brokerages to decode their exact traffic sources, link profile benchmarks (~305 BL / ~276 RD), and revenue multipliers.
                  </p>
                </div>
              </div>

              {/* Paste Marketplace Listing */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block">Enter Flippa / Empire Flippers Listing or Website URL</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="https://flippa.com/12345678 or website domain..."
                    value={marketplaceUrl}
                    onChange={(e) => setMarketplaceUrl(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-purple-400"
                  />
                  <button
                    onClick={() => {
                      if (!marketplaceUrl.trim()) return;
                      setAnalyzingMarket(true);
                      setTimeout(() => setAnalyzingMarket(false), 800);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{analyzingMarket ? 'Decoding Asset...' : 'Reverse Engineer'}</span>
                  </button>
                </div>
              </div>

              {/* Marketplace Benchmark Rules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Standard Exit Multiple</span>
                  <span className="text-xl font-bold text-slate-900">30x – 40x Monthly Profit</span>
                  <p className="text-[11px] text-slate-500 leading-tight pt-1">
                    A $1,500/mo micro-niche site sells for $45,000 - $60,000 on Flippa/Empire Flippers.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Link Building Standard</span>
                  <span className="text-xl font-bold text-slate-900">~305 BL / ~276 RD</span>
                  <p className="text-[11px] text-slate-500 leading-tight pt-1">
                    Average link-building benchmark required to achieve stable Page 1 dominance.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Monetization Blend</span>
                  <span className="text-xl font-bold text-slate-900">Mediavine + Affiliate CTAs</span>
                  <p className="text-[11px] text-slate-500 leading-tight pt-1">
                    Dual monetization stream prevents dependency on single ad network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FAST-MOVER KEYWORD MAPPING & CONTENT SCHEDULER */}
        {activeTab === 'mapping' && (
          <div className="space-y-6">
            <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase">
                    <Zap className="w-3.5 h-3.5 text-amber-700" /> Fast-Mover Content Execution Playbook
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                    90-Day Competitor Keyword Mapping &amp; Daily Scheduler
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                    <strong>&ldquo;Chalte Huye Business Ko Copy Karo&rdquo;</strong> — Zero se keyword research karne ke bajaye low-DR (&lt;5), young (&lt;1 yr) competitor ke Top Pages ko Paid Ahrefs se export karein aur 60&ndash;100 articles ka 90-day daily roadmap pre-map karein.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const csvContent = [
                      'Schedule Day,Article #,Target Keyword,Search Volume,KD,Competitor URL,Our Recommended Slug,Word Count Target,Status',
                      'Day 1,1,Monday Morning Blessings,18000,4,https://blessingquoteshub.com/monday-morning-blessings/,/monday-morning-blessings/,2200,To Write',
                      'Day 1,2,Monday Morning Blessings and Prayers,8500,2,https://blessingquoteshub.com/monday-morning-prayers/,/monday-morning-prayers/,1800,To Write',
                      'Day 2,3,Positive Monday Morning Blessings Images,12000,5,https://blessingquoteshub.com/monday-blessings-images/,/monday-blessings-images/,2000,To Write',
                      'Day 2,4,Inspirational Monday Blessings,6400,3,https://blessingquoteshub.com/inspirational-monday-blessings/,/inspirational-monday-blessings/,1800,To Write',
                      'Day 3,5,Good Morning Monday Blessings Quotes,14500,6,https://blessingquoteshub.com/good-morning-monday-quotes/,/good-morning-monday-quotes/,2500,To Write',
                      'Day 3,6,Happy Monday Blessings Bible Verses,5200,1,https://blessingquoteshub.com/monday-bible-verses/,/monday-bible-verses/,1900,To Write',
                    ].join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `Competitor_Keyword_Mapping_Sheet.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition self-start sm:self-auto shrink-0"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Download Google Sheets CSV</span>
                </button>
              </div>

              {/* 4 Core Playbook Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>1. Paid Ahrefs Export</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Semrush se niche dhoondein, lekin ranking pages ki sheet hamesha <strong>Paid Ahrefs Top Pages</strong> se export karein for 100% traffic accuracy.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>2. Daily Publishing Pace</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Rozana <strong>1 se 2 articles</strong> publish karne ka schedule banayein. Day 1, Day 2 colors ke sath sheet maintain karein.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span>3. Execution Sequence</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Top, Bottom, ya Middle — kisi bhi sequence se keywords uthayein. Jab competitor DA &lt; 5 hai to fresh site bhi har keyword par rank karegi.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>4. 1 Main + 3 Backups</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Sirf 1 competitor par depend na hon. 1 Main + 2-3 Backup low-DR competitors rakhein taake 60-100 articles poore hotay hi next sheet par shift ho sakein.
                  </p>
                </div>
              </div>

              {/* Competitors Management Strip */}
              <div className="bg-[#faf9f6] border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <span className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">
                    Competitors Cluster Tracking (1 Primary + 2 Backups)
                  </span>
                  <span className="text-xs text-purple-700 font-bold">
                    Target: DA &le; 5 · DR &le; 5 · Age &lt; 1.0 yr · 15k+ Traffic
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border-2 border-amber-400 space-y-1 shadow-xs">
                    <span className="text-[10px] uppercase font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      Primary Target (Replicate 1st)
                    </span>
                    <input
                      type="text"
                      value={mappingCompetitor}
                      onChange={(e) => setMappingCompetitor(e.target.value)}
                      className="w-full text-xs font-bold text-slate-900 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 mt-1"
                    />
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Backup Competitor #1
                    </span>
                    <input
                      type="text"
                      value={mappingBackup1}
                      onChange={(e) => setMappingBackup1(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 mt-1"
                    />
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Backup Competitor #2
                    </span>
                    <input
                      type="text"
                      value={mappingBackup2}
                      onChange={(e) => setMappingBackup2(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Interactive Daily Posting Schedule Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    Interactive Google Sheets Mapping Preview (First 10 Days)
                  </h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-medium">Publishing Cadence:</span>
                    <button
                      onClick={() => setMappingCadence('2_per_day')}
                      className={`px-3 py-1 rounded-full font-bold transition ${
                        mappingCadence === '2_per_day'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      2 Articles / Day (Fastest 30-Day Rank)
                    </button>
                    <button
                      onClick={() => setMappingCadence('1_per_day')}
                      className={`px-3 py-1 rounded-full font-bold transition ${
                        mappingCadence === '1_per_day'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      1 Article / Day (Standard)
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-xs">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-[#faf9f6] uppercase text-[10px] tracking-wider text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3">Schedule Day</th>
                        <th className="py-3 px-2 text-center">#</th>
                        <th className="py-3 px-4">Target Keyword</th>
                        <th className="py-3 px-3 text-right">Volume</th>
                        <th className="py-3 px-2 text-center">KD</th>
                        <th className="py-3 px-4">Competitor Reference Slug</th>
                        <th className="py-3 px-4">Our Target Slug</th>
                        <th className="py-3 px-3 text-right">Word Count</th>
                        <th className="py-3 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {[
                        { day: 'Day 1', num: 1, kw: 'Monday Morning Blessings', vol: 18000, kd: 4, compSlug: '/monday-morning-blessings/', ourSlug: '/monday-morning-blessings/', words: '2,200 words', status: 'To Write', bg: 'bg-amber-50/40' },
                        { day: 'Day 1', num: 2, kw: 'Monday Morning Blessings and Prayers', vol: 8500, kd: 2, compSlug: '/monday-morning-prayers/', ourSlug: '/monday-morning-prayers/', words: '1,800 words', status: 'To Write', bg: 'bg-amber-50/40' },
                        { day: 'Day 2', num: 3, kw: 'Positive Monday Morning Blessings Images', vol: 12000, kd: 5, compSlug: '/monday-blessings-images/', ourSlug: '/monday-blessings-images/', words: '2,000 words', status: 'To Write', bg: 'bg-white' },
                        { day: 'Day 2', num: 4, kw: 'Inspirational Monday Blessings', vol: 6400, kd: 3, compSlug: '/inspirational-monday-blessings/', ourSlug: '/inspirational-monday-blessings/', words: '1,800 words', status: 'To Write', bg: 'bg-white' },
                        { day: 'Day 3', num: 5, kw: 'Good Morning Monday Blessings Quotes', vol: 14500, kd: 6, compSlug: '/good-morning-monday-quotes/', ourSlug: '/good-morning-monday-quotes/', words: '2,500 words', status: 'To Write', bg: 'bg-amber-50/40' },
                        { day: 'Day 3', num: 6, kw: 'Happy Monday Blessings Bible Verses', vol: 5200, kd: 1, compSlug: '/monday-bible-verses/', ourSlug: '/monday-bible-verses/', words: '1,900 words', status: 'To Write', bg: 'bg-amber-50/40' },
                        { day: 'Day 4', num: 7, kw: 'Short Monday Morning Blessings', vol: 4100, kd: 2, compSlug: '/short-monday-blessings/', ourSlug: '/short-monday-blessings/', words: '1,600 words', status: 'To Write', bg: 'bg-white' },
                        { day: 'Day 4', num: 8, kw: 'Monday Morning Blessings for Friends and Family', vol: 3800, kd: 3, compSlug: '/monday-blessings-family/', ourSlug: '/monday-blessings-family/', words: '1,900 words', status: 'To Write', bg: 'bg-white' },
                      ].map((row, idx) => (
                        <tr key={idx} className={`${row.bg} hover:bg-amber-100/50 transition`}>
                          <td className="py-3 px-3 font-bold text-amber-900 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                              {row.day}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center text-slate-400 font-bold">{row.num}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{row.kw}</td>
                          <td className="py-3 px-3 text-right font-bold text-purple-700">{row.vol.toLocaleString()}</td>
                          <td className="py-3 px-2 text-center">
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              {row.kd}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500 truncate max-w-[180px]">{row.compSlug}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-purple-700 font-bold truncate max-w-[180px]">{row.ourSlug}</td>
                          <td className="py-3 px-3 text-right text-slate-700 font-medium">{row.words}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function BlueprintsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading Blueprints...</div>}>
      <BlueprintsContent />
    </Suspense>
  );
}
