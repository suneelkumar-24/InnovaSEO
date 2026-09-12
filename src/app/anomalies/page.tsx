'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  Flame,
  Target,
  Sparkles,
  ArrowRight,
  Download,
  Filter,
  Globe,
  DollarSign,
  Layers,
  Activity,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Zap,
  TrendingUp,
  Search,
} from 'lucide-react';

interface AnomalyItem {
  id: string;
  brand: string;
  seed: string;
  category: 'Fast Casual & Menus' | 'Automotive Specs' | 'Utility Calculators' | 'Specialized Gear';
  country: string;
  countryCode: string;
  targetDomain: string;
  targetDr: number;
  targetRank: number;
  domainAgeYears: number;
  monthlyTraffic: number;
  tier: 'Tier 1' | 'Tier 2';
  estimatedEarnings: string;
  zeroClickImmune: boolean;
  opportunityRating: 'Apex Anomaly (DR 0-5)' | 'Low DR Target (DR 6-12)' | 'Vulnerable Authority (DR 13-20)';
  isFastMoverWinner?: boolean;
  topicalCompression?: string;
  notes: string;
}

const PRELOADED_ANOMALIES: AnomalyItem[] = [
  {
    id: 'anom-1',
    brand: 'Popeyes Louisiana Kitchen',
    seed: 'popeyes menu prices',
    category: 'Fast Casual & Menus',
    country: 'United States',
    countryCode: 'US',
    targetDomain: 'popeyesmenuprices.net',
    targetDr: 3,
    targetRank: 2,
    domainAgeYears: 0.9,
    monthlyTraffic: 62400,
    tier: 'Tier 1',
    estimatedEarnings: '$2,300/mo',
    zeroClickImmune: true,
    opportunityRating: 'Apex Anomaly (DR 0-5)',
    isFastMoverWinner: true,
    topicalCompression: '8 Pillar Articles vs 14 Competitor Posts (90-Day Target)',
    notes: 'Fresh DR 3 site capturing $2.3k/mo ad revenue outranking corporate PDF menus.',
  },
  {
    id: 'anom-2',
    brand: 'In-N-Out Burger',
    seed: 'in-n-out menu with prices',
    category: 'Fast Casual & Menus',
    country: 'United States',
    countryCode: 'US',
    targetDomain: 'in-n-outmenus.com',
    targetDr: 4,
    targetRank: 2,
    domainAgeYears: 1.1,
    monthlyTraffic: 48200,
    tier: 'Tier 1',
    estimatedEarnings: '$1,800/mo',
    zeroClickImmune: true,
    opportunityRating: 'Apex Anomaly (DR 0-5)',
    isFastMoverWinner: true,
    topicalCompression: '8 Dense Silo Pages vs 16 Competitor Pages (90-Day Target)',
    notes: 'Cult regional following produces zero-click immune printable price tables.',
  },
  {
    id: 'anom-3',
    brand: 'Starbucks Deutschland',
    seed: 'starbucks preise deutschland',
    category: 'Fast Casual & Menus',
    country: 'Germany',
    countryCode: 'DE',
    targetDomain: 'starbuckspreise.de',
    targetDr: 2,
    targetRank: 1,
    domainAgeYears: 0.7,
    monthlyTraffic: 28500,
    tier: 'Tier 1',
    estimatedEarnings: '€1,100/mo',
    zeroClickImmune: true,
    opportunityRating: 'Apex Anomaly (DR 0-5)',
    isFastMoverWinner: true,
    topicalCompression: '6 Localized Pillar Menus vs 12 Competitor Articles (60-Day Target)',
    notes: 'German Tier 1 RPM ($40+) with fresh exact match domain dominating Google Page 1.',
  },
  {
    id: 'anom-4',
    brand: 'Little Caesars Pizza',
    seed: 'little caesars pizza portal prices',
    category: 'Fast Casual & Menus',
    country: 'United States',
    countryCode: 'US',
    targetDomain: 'littlecaesarsmenuguide.com',
    targetDr: 5,
    targetRank: 3,
    domainAgeYears: 1.2,
    monthlyTraffic: 39100,
    tier: 'Tier 1',
    estimatedEarnings: '$1,450/mo',
    zeroClickImmune: true,
    opportunityRating: 'Apex Anomaly (DR 0-5)',
    isFastMoverWinner: true,
    topicalCompression: '8 Deal Breakdown Silos vs 15 Competitor Posts (90-Day Target)',
    notes: 'Value-oriented pizza seekers wanting deal breakdowns and calorie matrices.',
  },
  {
    id: 'anom-5',
    brand: 'Raising Cane’s',
    seed: 'raising canes sauce calories and prices',
    category: 'Fast Casual & Menus',
    country: 'United States',
    countryCode: 'US',
    targetDomain: 'canesmenuinfo.org',
    targetDr: 1,
    targetRank: 1,
    domainAgeYears: 0.5,
    monthlyTraffic: 33000,
    tier: 'Tier 1',
    estimatedEarnings: '$1,200/mo',
    zeroClickImmune: true,
    opportunityRating: 'Apex Anomaly (DR 0-5)',
    isFastMoverWinner: true,
    topicalCompression: '5 Viral Dipping Sauce/Combo Specs vs 10 Competitor Articles',
    notes: 'Extreme viral TikTok demand for dipping sauce & box combo nutrition specs.',
  },
  {
    id: 'anom-6',
    brand: 'Tesla Aftermarket Fitment',
    seed: 'tesla model y rim dimensions',
    category: 'Automotive Specs',
    country: 'United States',
    countryCode: 'US',
    targetDomain: 'teslawheelguide.com',
    targetDr: 4,
    targetRank: 2,
    domainAgeYears: 1.3,
    monthlyTraffic: 21500,
    tier: 'Tier 1',
    estimatedEarnings: '$1,100/mo',
    zeroClickImmune: true,
    opportunityRating: 'Apex Anomaly (DR 0-5)',
    isFastMoverWinner: true,
    topicalCompression: '8 Model Specs vs 14 Generic Fitment Pages (90-Day Target)',
    notes: 'Programmatic fitment matrix with TireRack & Amazon high-ticket affiliate monetization.',
  },
  {
    id: 'anom-7',
    brand: 'Dutch Bros Coffee',
    seed: 'dutch bros secret menu drinks',
    category: 'Fast Casual & Menus',
    country: 'United States',
    countryCode: 'US',
    targetDomain: 'dutchbrossecretmenu.net',
    targetDr: 7,
    targetRank: 2,
    domainAgeYears: 1.4,
    monthlyTraffic: 44000,
    tier: 'Tier 1',
    estimatedEarnings: '$1,650/mo',
    zeroClickImmune: true,
    opportunityRating: 'Low DR Target (DR 6-12)',
    notes: 'Rebel energy drink custom syrup mixes. High social traffic & return visitor rate.',
  },
  {
    id: 'anom-8',
    brand: 'Culver’s Fresh Frozen Custard',
    seed: 'culvers flavor of the day calendar',
    category: 'Fast Casual & Menus',
    country: 'United States',
    countryCode: 'US',
    targetDomain: 'culverscustardtracker.com',
    targetDr: 8,
    targetRank: 1,
    domainAgeYears: 1.1,
    monthlyTraffic: 31000,
    tier: 'Tier 1',
    estimatedEarnings: '$1,150/mo',
    zeroClickImmune: true,
    opportunityRating: 'Low DR Target (DR 6-12)',
    notes: 'Programmatic calendar widget updating daily rotating custard flavors by ZIP code.',
  },
  {
    id: 'anom-9',
    brand: 'Arby’s Secret Sauce & Sliders',
    seed: 'arbys 2 for 6 menu prices',
    category: 'Fast Casual & Menus',
    country: 'United States',
    countryCode: 'US',
    targetDomain: 'arbysdealtracker.com',
    targetDr: 11,
    targetRank: 2,
    domainAgeYears: 1.6,
    monthlyTraffic: 51200,
    tier: 'Tier 1',
    estimatedEarnings: '$1,950/mo',
    zeroClickImmune: true,
    opportunityRating: 'Low DR Target (DR 6-12)',
    notes: 'Coupon and deal rotation matrix ranking ahead of national coupon aggregators.',
  },
  {
    id: 'anom-10',
    brand: 'Sonic Drive-In Half Price Drinks',
    seed: 'sonic happy hour drink menu prices',
    category: 'Fast Casual & Menus',
    country: 'United States',
    countryCode: 'US',
    targetDomain: 'sonichappyhourguide.org',
    targetDr: 14,
    targetRank: 3,
    domainAgeYears: 1.8,
    monthlyTraffic: 68000,
    tier: 'Tier 1',
    estimatedEarnings: '$2,600/mo',
    zeroClickImmune: true,
    opportunityRating: 'Vulnerable Authority (DR 13-20)',
    notes: 'Slush flavor combo table & time-sensitive happy hour schedule directory.',
  },
  {
    id: 'anom-11',
    brand: 'Ford F-150 Towing Capacities',
    seed: 'ford f150 towing capacity by engine specs',
    category: 'Automotive Specs',
    country: 'United States',
    countryCode: 'US',
    targetDomain: 'trucktowingguide.com',
    targetDr: 17,
    targetRank: 2,
    domainAgeYears: 1.9,
    monthlyTraffic: 42000,
    tier: 'Tier 1',
    estimatedEarnings: '$2,100/mo',
    zeroClickImmune: true,
    opportunityRating: 'Vulnerable Authority (DR 13-20)',
    notes: 'Engine payload and hitch spec database capturing high-RPM automotive ads ($52 RPM).',
  },
  {
    id: 'anom-12',
    brand: 'Mechanical Keyboard Switches',
    seed: 'linear switch actuation force chart',
    category: 'Specialized Gear',
    country: 'United States',
    countryCode: 'US',
    targetDomain: 'switchchart.com',
    targetDr: 18,
    targetRank: 2,
    domainAgeYears: 1.7,
    monthlyTraffic: 36000,
    tier: 'Tier 1',
    estimatedEarnings: '$1,700/mo',
    zeroClickImmune: true,
    opportunityRating: 'Vulnerable Authority (DR 13-20)',
    notes: 'Interactive switch sound and travel distance table with mechanical keyboard affiliate CTAs.',
  },
];

export default function AnomaliesPage() {
  const router = useRouter();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDrMax, setFilterDrMax] = useState<number>(20); // Default to full DR 0-20 standard
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterFastMoverOnly, setFilterFastMoverOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAnomalies = useMemo(() => {
    return PRELOADED_ANOMALIES.filter((item) => {
      if (filterFastMoverOnly && !item.isFastMoverWinner) return false;
      if (filterCategory !== 'all' && item.category !== filterCategory) return false;
      if (item.targetDr > filterDrMax) return false;
      if (filterCountry !== 'all' && item.countryCode !== filterCountry) return false;
      if (
        searchQuery &&
        !item.brand.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.seed.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.targetDomain.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [filterFastMoverOnly, filterCategory, filterDrMax, filterCountry, searchQuery]);

  const handleLaunchResearch = (seed: string, country: string) => {
    router.push(`/research/new?seed=${encodeURIComponent(seed)}&country=${encodeURIComponent(country)}&mode=anomaly`);
  };

  const handleExportCsv = () => {
    const headers = ['Brand', 'Seed Keyword', 'Category', 'Country', 'Target Benchmark Domain', 'Target DR', 'Rank', 'Domain Age (Yrs)', 'Monthly Traffic', 'Estimated Revenue', 'Fast-Mover Winner', 'Topical Compression Plan', 'Notes'];
    const rows = filteredAnomalies.map((a) => [
      `"${a.brand}"`,
      `"${a.seed}"`,
      `"${a.category}"`,
      `"${a.country}"`,
      `"${a.targetDomain}"`,
      a.targetDr,
      a.targetRank,
      a.domainAgeYears,
      a.monthlyTraffic,
      `"${a.estimatedEarnings}"`,
      a.isFastMoverWinner ? 'YES' : 'NO',
      `"${a.topicalCompression || 'N/A'}"`,
      `"${a.notes}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dr_0_20_low_authority_anomalies.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen font-sans">
      <Header
        title="Fast-Mover Anomaly & Challenger Brand Hunter"
        subtitle="Fast-Mover Formula: Target Fast-Ranking Low-Authority Competitors (DR < 5, Age < 1 Yr, 15k-20k+ Traffic)"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Niche Hunter Suite', href: '/dashboard' },
          { label: 'Fast-Mover Anomalies' },
        ]}
      >
        <button
          onClick={handleExportCsv}
          className="px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 hover:bg-purple-100 flex items-center gap-1.5 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Anomalies CSV</span>
        </button>
      </Header>

      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Strategy Explainer Hero Card */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 rounded-3xl p-6 sm:p-8 text-white space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200 block">
                  FAST-MOVER WINNING STRATEGY
                </span>
                <h2 className="text-2xl font-serif font-bold text-white mt-0.5">
                  &quot;Chalte Huye Business Ko Copy Karo&quot; Formula
                </h2>
              </div>
            </div>

            <button
              onClick={() => setFilterFastMoverOnly(!filterFastMoverOnly)}
              className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition self-start sm:self-auto ${
                filterFastMoverOnly
                  ? 'bg-white text-amber-900 shadow-md ring-2 ring-amber-300'
                  : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{filterFastMoverOnly ? 'Showing Fast-Movers Only' : 'Filter Fast-Movers (DR < 5 / Age < 1 Yr)'}</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-amber-100 leading-relaxed max-w-4xl">
            Never waste years fighting ancient authority websites (&quot;magarmach&quot;) in generic broad categories (Home, Health, Fashion). Instead, <strong>find a fresh competitor that ranked in under 1 year with DR &lt; 5 and 15,000–20,000+ traffic</strong>, and replicate their business with <strong>Topical Compression</strong> (e.g. 8 superior, dense articles vs 13 competitor posts) to outrank them within 90 days.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 rounded-2xl p-3 border border-white/20">
              <span className="text-[10px] font-bold uppercase text-amber-200 block">Fast-Mover DR &amp; DA</span>
              <span className="text-sm font-bold text-white block mt-0.5">DR &lt; 5 &amp; DA &lt; 10</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/20">
              <span className="text-[10px] font-bold uppercase text-amber-200 block">Proven Domain Age</span>
              <span className="text-sm font-bold text-white block mt-0.5">&lt; 1.0 Year (Fresh Winner)</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/20">
              <span className="text-[10px] font-bold uppercase text-amber-200 block">Proven Traffic Volume</span>
              <span className="text-sm font-bold text-white block mt-0.5">15,000 – 20,000+ / mo</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/20">
              <span className="text-[10px] font-bold uppercase text-amber-200 block">Execution Target</span>
              <span className="text-sm font-bold text-white block mt-0.5">90-Day Ranking Target</span>
            </div>
          </div>
        </div>

        {/* Live Filter Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search brand, seed, domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-purple-400"
              />
            </div>

            {/* Fast Mover Quick Toggle */}
            <button
              onClick={() => setFilterFastMoverOnly(!filterFastMoverOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                filterFastMoverOnly
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Fast-Movers Only</span>
            </button>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              <option value="Fast Casual & Menus">Fast Casual & Menus</option>
              <option value="Automotive Specs">Automotive Specs</option>
              <option value="Specialized Gear">Specialized Gear</option>
            </select>

            {/* Max DR Filter (0 to 20 range) */}
            <select
              value={filterDrMax}
              onChange={(e) => setFilterDrMax(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value={20}>All DR 0 - 20</option>
              <option value={5}>DR 0 - 5 (Fast-Mover Standard)</option>
              <option value={12}>DR 6 - 12 (Moderate Low Authority)</option>
              <option value={20}>DR 13 - 20 (Vulnerable Authority)</option>
            </select>

            {/* Country Filter */}
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Countries</option>
              <option value="US">United States</option>
              <option value="DE">Germany</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            Showing <strong className="text-purple-700">{filteredAnomalies.length}</strong> anomalies
          </div>
        </div>

        {/* Anomaly Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAnomalies.map((item) => (
            <div
              key={item.id}
              className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-sm hover:border-purple-300 hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {item.opportunityRating}
                      </span>
                      {item.isFastMoverWinner && (
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md uppercase flex items-center gap-1">
                          <Zap className="w-3 h-3 text-emerald-600" /> Fast-Mover Clone
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {item.brand}
                    </h3>
                  </div>

                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {item.country} ({item.countryCode})
                  </span>
                </div>

                {/* Target Metric Box */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Site DR</span>
                    <span className="text-base font-black text-rose-600 font-mono">DR {item.targetDr}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Domain Age</span>
                    <span className="text-base font-black text-slate-900 font-mono">{item.domainAgeYears} Yrs</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Traffic</span>
                    <span className="text-base font-black text-emerald-600 font-mono">{item.monthlyTraffic.toLocaleString()}</span>
                  </div>
                </div>

                {/* Topical Compression Plan */}
                {item.topicalCompression && (
                  <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-3 h-3 text-emerald-700" /> 90-Day Topical Compression Blueprint
                    </span>
                    <p className="text-xs font-semibold text-emerald-950 font-mono">
                      {item.topicalCompression}
                    </p>
                  </div>
                )}

                {/* Details & Target Domain */}
                <div className="text-xs space-y-1 text-slate-600">
                  <p>
                    <strong className="text-slate-700">Seed Keyword:</strong> &quot;{item.seed}&quot;
                  </p>
                  <p>
                    <strong className="text-slate-700">Benchmark Competitor:</strong> <code className="text-purple-700 font-bold bg-purple-50 px-1 py-0.5 rounded">{item.targetDomain}</code> (Age: {item.domainAgeYears} yrs)
                  </p>
                  <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                    {item.notes}
                  </p>
                </div>
              </div>

              {/* Action Row */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Est. Monthly Earnings</span>
                  <span className="text-sm font-bold text-emerald-700">{item.estimatedEarnings}</span>
                </div>

                <button
                  onClick={() => handleLaunchResearch(item.seed, item.country)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze in Studio</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
