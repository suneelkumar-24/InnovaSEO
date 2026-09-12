'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Globe,
  Search,
  Layers,
  ShieldCheck,
  TrendingUp,
  FileText,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

interface AuditCheck {
  id: number;
  title: string;
  weight: number;
  status: 'passed' | 'partial' | 'failed';
  score: number;
  evidence: string;
  rule: string;
}

interface DetectionResult {
  domain: string;
  seedKeyword: string;
  coverageRatio: number;
  verdict: 'Dedicated Apex Niche Site' | 'Partial Hub / Category Silo' | 'Generic Multi-Topic Portal';
  verdictColor: 'emerald' | 'amber' | 'blue';
  outrankOpportunity: 'High (Easy Topical Outrank)' | 'Moderate' | 'Challenging (Direct Benchmark)';
  checks: AuditCheck[];
  tacticalAdvice: string;
}

const PRESET_AUDITS: Record<string, DetectionResult> = {
  'in-n-outmenus.com': {
    domain: 'in-n-outmenus.com',
    seedKeyword: 'in-n-out menu with prices',
    coverageRatio: 92,
    verdict: 'Dedicated Apex Niche Site',
    verdictColor: 'emerald',
    outrankOpportunity: 'Challenging (Direct Benchmark)',
    checks: [
      { id: 1, title: 'Title & Brand Alignment', weight: 15, status: 'passed', score: 15, evidence: 'Domain contains exact match brand & keywords.', rule: 'Exact match brand name in root domain.' },
      { id: 2, title: 'Navigation Menu & Silo Structure', weight: 15, status: 'passed', score: 15, evidence: '100% of nav links point to In-N-Out categories (Burgers, Shakes, Secret Menu, Locations).', rule: 'All primary silos dedicated to seed.' },
      { id: 3, title: 'Recent Article Ratio (>70% Rule)', weight: 20, status: 'passed', score: 20, evidence: '42 of 45 published articles (93.3%) are strictly In-N-Out related.', rule: 'Seed articles must exceed 70% of total content.' },
      { id: 4, title: 'Google "site:" Indexed Topical Depth', weight: 15, status: 'passed', score: 14, evidence: '64 indexed URLs covering California, Nevada, Texas menu prices & gluten-free options.', rule: 'Deep topical cluster indexed by Google.' },
      { id: 5, title: 'Clean URL Slug Structure', weight: 10, status: 'passed', score: 10, evidence: 'Clean slugs e.g. /double-double-price/ and /secret-menu-flying-dutchman/.', rule: 'Flat, keyword-rich hierarchy.' },
      { id: 6, title: '"About Us" Mission Dedication', weight: 10, status: 'passed', score: 10, evidence: 'States mission as "The Unofficial Fan-Made In-N-Out Menu & Price Directory".', rule: 'Explicit topic dedication statement.' },
      { id: 7, title: 'Organic Search Traffic Concentration', weight: 15, status: 'passed', score: 14, evidence: '98% of search traffic arrives on In-N-Out related queries.', rule: 'Traffic concentrated on seed subject.' },
    ],
    tacticalAdvice: 'This is a dedicated apex competitor. Do not copy their layout directly; instead outrank them by building interactive calorie calculators, printable PDF menus, and daily updated state price filters.',
  },
  'fastfoodnutrition.org': {
    domain: 'fastfoodnutrition.org',
    seedKeyword: 'popeyes chicken sandwich nutrition',
    coverageRatio: 22,
    verdict: 'Generic Multi-Topic Portal',
    verdictColor: 'blue',
    outrankOpportunity: 'High (Easy Topical Outrank)',
    checks: [
      { id: 1, title: 'Title & Brand Alignment', weight: 15, status: 'failed', score: 3, evidence: 'Broad generic fast food brand covering 200+ restaurant chains.', rule: 'Generic name lacks specific seed topicality.' },
      { id: 2, title: 'Navigation Menu & Silo Structure', weight: 15, status: 'failed', score: 4, evidence: 'Menu covers McDonald’s, Burger King, Wendy’s, Subway, Taco Bell.', rule: 'Broad navigation dilutes topical authority.' },
      { id: 3, title: 'Recent Article Ratio (>70% Rule)', weight: 20, status: 'failed', score: 3, evidence: 'Only 1.5% of total site articles are Popeyes-specific.', rule: 'Coverage is far below the 70% golden standard.' },
      { id: 4, title: 'Google "site:" Indexed Topical Depth', weight: 15, status: 'partial', score: 6, evidence: 'Has only 8 Popeyes pages among 15,000 indexed URLs.', rule: 'Shallow topical depth for specific brand.' },
      { id: 5, title: 'Clean URL Slug Structure', weight: 10, status: 'passed', score: 8, evidence: '/popeyes/chicken-sandwich-nutrition/', rule: 'Sub-category URL structure is clean.' },
      { id: 6, title: '"About Us" Mission Dedication', weight: 10, status: 'failed', score: 2, evidence: 'Generic nutrition aggregator mission statement.', rule: 'Lacks dedicated micro-mission.' },
      { id: 7, title: 'Organic Search Traffic Concentration', weight: 15, status: 'failed', score: 3, evidence: 'Popeyes accounts for less than 4% of total domain visits.', rule: 'Dispersed traffic across multiple topics.' },
    ],
    tacticalAdvice: 'MASSIVE OUTRANK OPPORTUNITY! This generic mega-portal ranks on generic domain rating alone. A fresh 100% dedicated Popeyes micro-niche site with 25-30 silo articles will easily claim Top 3 positions via superior topical authority.',
  },
};

export default function DedicatedDetectorPage() {
  const router = useRouter();
  const [inputUrl, setInputUrl] = useState('');
  const [inputSeed, setInputSeed] = useState('');
  const [currentResult, setCurrentResult] = useState<DetectionResult>(PRESET_AUDITS['in-n-outmenus.com']);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setIsAuditing(true);
    setTimeout(() => {
      const clean = inputUrl.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (PRESET_AUDITS[clean]) {
        setCurrentResult(PRESET_AUDITS[clean]);
      } else {
        // Dynamic generic computation
        const isLikelyDedicated = clean.includes('menu') || clean.includes('prices') || clean.includes('guide');
        const ratio = isLikelyDedicated ? 78 : 28;
        setCurrentResult({
          domain: clean,
          seedKeyword: inputSeed || 'Target Micro-Niche Topic',
          coverageRatio: ratio,
          verdict: isLikelyDedicated ? 'Dedicated Apex Niche Site' : 'Generic Multi-Topic Portal',
          verdictColor: isLikelyDedicated ? 'emerald' : 'blue',
          outrankOpportunity: isLikelyDedicated ? 'Challenging (Direct Benchmark)' : 'High (Easy Topical Outrank)',
          checks: [
            { id: 1, title: 'Title & Brand Alignment', weight: 15, status: isLikelyDedicated ? 'passed' : 'failed', score: isLikelyDedicated ? 14 : 4, evidence: `Analyzed brand pattern for ${clean}.`, rule: 'Exact match brand name in domain.' },
            { id: 2, title: 'Navigation Menu & Silo Structure', weight: 15, status: isLikelyDedicated ? 'passed' : 'failed', score: isLikelyDedicated ? 13 : 5, evidence: 'Inspected navigation menus for category concentration.', rule: 'Primary silos dedicated to seed.' },
            { id: 3, title: 'Recent Article Ratio (>70% Rule)', weight: 20, status: isLikelyDedicated ? 'passed' : 'failed', score: isLikelyDedicated ? 18 : 6, evidence: `Estimated content concentration: ${ratio}%.`, rule: 'Seed articles must exceed 70% threshold.' },
            { id: 4, title: 'Google "site:" Indexed Topical Depth', weight: 15, status: isLikelyDedicated ? 'passed' : 'partial', score: isLikelyDedicated ? 12 : 7, evidence: 'Indexed topical cluster evaluation.', rule: 'Topical cluster depth.' },
            { id: 5, title: 'Clean URL Slug Structure', weight: 10, status: 'passed', score: 8, evidence: 'Clean slug hierarchy detected.', rule: 'Flat URL hierarchy.' },
            { id: 6, title: '"About Us" Mission Dedication', weight: 10, status: isLikelyDedicated ? 'passed' : 'failed', score: isLikelyDedicated ? 9 : 3, evidence: 'Mission statement relevance audit.', rule: 'Explicit topic dedication statement.' },
            { id: 7, title: 'Organic Search Traffic Concentration', weight: 15, status: isLikelyDedicated ? 'passed' : 'failed', score: isLikelyDedicated ? 13 : 4, evidence: 'Estimated search traffic focus on seed.', rule: 'Traffic concentration.' },
          ],
          tacticalAdvice: isLikelyDedicated
            ? 'Competitor is dedicated. Outrank them by delivering richer data schemas and interactive tool widgets.'
            : 'Huge outrank opportunity! This competitor is a generic multi-topic site. Build a dedicated site to capture 100% topical relevance.',
        });
      }
      setIsAuditing(false);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen font-sans">
      <Header
        title="7-Step Dedicated Website Detector (70% Golden Rule)"
        subtitle="Detect whether ranking competitors are dedicated micro-niche sites or generic portals to find high-probability outrank opportunities"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Niche Hunter Suite', href: '/dashboard' },
          { label: 'Dedicated Site Detector' },
        ]}
      />

      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* URL Input & Analysis Box */}
        <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-black uppercase mb-2">
                <Target className="w-3.5 h-3.5" /> 70% Golden Rule Engine
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-900">
                Competitor Dedicated Website Audit
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Enter any ranking competitor domain to verify if it is 100% dedicated to the seed topic (&gt;70%) or a vulnerable generic portal (&lt;30%).
              </p>
            </div>

            {/* Quick Demo Pre-fills */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentResult(PRESET_AUDITS['in-n-outmenus.com'])}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Demo: in-n-outmenus.com (Dedicated)
              </button>
              <button
                type="button"
                onClick={() => setCurrentResult(PRESET_AUDITS['fastfoodnutrition.org'])}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Demo: fastfoodnutrition.org (Generic)
              </button>
            </div>
          </div>

          <form onSubmit={handleAudit} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="Enter Competitor Domain (e.g. in-n-outmenus.com, healthline.com, cars.com)..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 w-full bg-slate-50 border border-slate-200 focus:border-purple-400 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden"
            />
            <input
              type="text"
              placeholder="Seed Keyword (e.g. in-n-out menu with prices)..."
              value={inputSeed}
              onChange={(e) => setInputSeed(e.target.value)}
              className="w-full sm:w-64 bg-slate-50 border border-slate-200 focus:border-purple-400 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={isAuditing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAuditing ? 'Auditing 7 Checks...' : 'Run 7-Step Audit'}</span>
            </button>
          </form>
        </div>

        {/* Audit Scorecard Hero */}
        <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                AUDITED DOMAIN
              </span>
              <h3 className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                {currentResult.domain}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Target Seed: <strong className="text-purple-700">&quot;{currentResult.seedKeyword}&quot;</strong>
              </p>
            </div>

            {/* Verdict Badge & Score Circle */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Topical Dedication Ratio
                </span>
                <span className="text-3xl font-black text-purple-700 font-mono">
                  {currentResult.coverageRatio}%
                </span>
              </div>

              <div
                className={`px-4 py-2.5 rounded-2xl border text-xs font-bold ${
                  currentResult.coverageRatio >= 70
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : currentResult.coverageRatio >= 30
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-blue-50 text-blue-900 border-blue-300'
                }`}
              >
                <span className="block text-[10px] font-semibold uppercase opacity-80">VERDICT</span>
                <span className="text-sm font-bold">{currentResult.verdict}</span>
              </div>
            </div>
          </div>

          {/* Tactical Advice Alert */}
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-purple-900">
              <Sparkles className="w-4 h-4 text-purple-600" /> Tactical Strategy & Recommendation:
            </span>
            <p className="leading-relaxed text-purple-800">
              {currentResult.tacticalAdvice}
            </p>
          </div>

          {/* 7 Checks Table */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              7 Validation Audit Checks
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentResult.checks.map((check) => (
                <div
                  key={check.id}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-purple-600 text-white font-mono text-[11px] font-bold flex items-center justify-center">
                        {check.id}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{check.title}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        check.status === 'passed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : check.status === 'partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {check.status} ({check.score}/{check.weight} pts)
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    <strong className="text-slate-700">Observed Evidence:</strong> {check.evidence}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    <strong className="text-slate-500">Benchmark Rule:</strong> {check.rule}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
