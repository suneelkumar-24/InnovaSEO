'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import {
  Target,
  Sparkles,
  Zap,
  Sliders,
  Globe,
  DollarSign,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Terminal,
  Store,
  ShoppingCart,
  TrendingUp,
  ExternalLink,
  Copy,
  Check,
  Compass,
  Flame,
  Activity,
  Rocket,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import {
  getCountryGeoConfig,
  detectGeoFromKeyword,
  getGoogleSearchUrl,
  COUNTRY_GEO_REGISTRY,
  DetectedGeoResult,
} from '@/lib/geo';

const NICHE_TYPES = [
  { id: 'micro', name: 'Micro Niche (Recommended)' },
  { id: 'nano', name: 'Nano Niche' },
  { id: 'micro-nano', name: 'Micro-Nano Niche' },
  { id: 'affiliate', name: 'Affiliate Niche' },
  { id: 'e-commerce', name: 'E-Commerce Niche' },
  { id: 'utility', name: 'Utility / Guide Niche' },
  { id: 'menu', name: 'Menu / Price Niche' },
  { id: 'information', name: 'Information Niche' },
  { id: 'local', name: 'Local Lead Niche' },
  { id: 'lead-generation', name: 'Lead Generation' },
  { id: 'tool-based', name: 'Tool-Based Niche' },
  { id: 'directory', name: 'Directory Niche' },
  { id: 'traditional-seo', name: 'Traditional SEO Niche' },
];

const BUSINESS_MODELS = [
  { id: 'affiliate', name: 'Affiliate Marketing' },
  { id: 'ecommerce', name: 'E-Commerce / Physical' },
  { id: 'digital_product', name: 'Digital Products / Templates' },
  { id: 'lead_gen', name: 'Lead Generation' },
  { id: 'ads', name: 'Display Ads (Mediavine/AdSense)' },
  { id: 'saas_tool', name: 'Micro-SaaS / Calculator Tool' },
  { id: 'directory', name: 'Directory / Listings' },
  { id: 'services', name: 'Agency / High-Ticket Services' },
  { id: 'subscription', name: 'Subscription / Membership' },
];

const COUNTRIES = Object.keys(COUNTRY_GEO_REGISTRY);

const PIPELINE_PHASES = [
  { step: 1, title: 'Niche Discovery & Seed Formulation' },
  { step: 2, title: 'Keyword Expansion & Search Volume' },
  { step: 3, title: 'Demand Validation & Regional Geo' },
  { step: 4, title: 'Google Trends & 12M/5Y Trajectory' },
  { step: 5, title: 'Live SERP Crawling & Index Inspection' },
  { step: 6, title: 'Competitor Authority & Weak Competitor Audit' },
  { step: 7, title: 'Domain Age & Sitemap / Page Count Analysis' },
  { step: 8, title: 'Search Intent Gap & Content Mismatch Radar' },
  { step: 9, title: 'Dedicated Website & Landing Page Audit' },
  { step: 10, title: 'AI Overview Presence & CTR Curve Modeling' },
  { step: 11, title: 'Monetization Blueprint & Revenue Potential' },
  { step: 12, title: 'Scalability & 20+ Article Topical Silos' },
  { step: 13, title: 'Policy, YMYL & AI/LLM Risk Classification' },
  { step: 14, title: 'SEBT-NEXT Multi-Signal Viability Scoring' },
  { step: 15, title: 'Final Report Assembly & Opportunity Card' },
];

function HunterStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode Selection: 'direct' vs 'marketplace'
  const [activeMode, setActiveMode] = useState<'direct' | 'marketplace'>('direct');

  // Direct Seed Form State
  const [seedKeyword, setSeedKeyword] = useState('');
  const [nicheType, setNicheType] = useState('micro');
  const [businessModel, setBusinessModel] = useState('ads');
  const [targetCountry, setTargetCountry] = useState('United States');
  const [language, setLanguage] = useState('English');
  const [minSv, setMinSv] = useState(500);
  const [maxKd, setMaxKd] = useState(40);
  const [optionalKeywords, setOptionalKeywords] = useState('');

  // Auto-detection state
  const [detectedGeo, setDetectedGeo] = useState<DetectedGeoResult | null>(null);

  // Marketplace Parser State (Flippa / Empire Flippers / Direct Site)
  const [marketplaceInput, setMarketplaceInput] = useState('');
  const [parsingMarketplace, setParsingMarketplace] = useState(false);
  const [marketplaceData, setMarketplaceData] = useState<any | null>(null);
  const [marketplaceError, setMarketplaceError] = useState<string | null>(null);

  // AI Ideation & Multi-Country Expansion state
  const [ideating, setIdeating] = useState(false);
  const [aiIdeas, setAiIdeas] = useState<any[]>([]);
  const [expandingMultiCountry, setExpandingMultiCountry] = useState(false);
  const [multiCountryExpansions, setMultiCountryExpansions] = useState<any[]>([]);

  // Execution runner state
  const [executing, setExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [progressPercent, setProgressPercent] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSeedChange = (val: string) => {
    setSeedKeyword(val);
    if (val.trim().length >= 2) {
      const detected = detectGeoFromKeyword(val);
      if (detected.detected) {
        setDetectedGeo(detected);
        setTargetCountry(detected.country);
        setLanguage(detected.language);
      } else {
        setDetectedGeo(null);
      }
    } else {
      setDetectedGeo(null);
    }
  };

  useEffect(() => {
    const seed = searchParams.get('seed');
    const type = searchParams.get('type');
    const country = searchParams.get('country');
    const mode = searchParams.get('mode');

    if (seed) handleSeedChange(seed);
    if (type) setNicheType(type);

    if (country) {
      const countryMap: Record<string, string> = {
        US: 'United States',
        UK: 'United Kingdom',
        GB: 'United Kingdom',
        CA: 'Canada',
        AU: 'Australia',
        DE: 'Germany',
      };
      setTargetCountry(countryMap[country] || country);
    }

    if (mode === 'marketplace') setActiveMode('marketplace');
    if (mode === 'direct') setActiveMode('direct');
    if (mode === 'checklist') {
      setBusinessModel('ads');
    }
    if (mode === 'anomaly') {
      setNicheType('micro');
      setMaxKd(25);
    }
    if (mode === 'programmatic') {
      setNicheType('menu');
      setBusinessModel('ads');
    }
    if (mode === 'rpm') {
      setTargetCountry('United States');
      setBusinessModel('ads');
    }
  }, [searchParams]);

  // Handle Marketplace Reverse Engineering
  const handleReverseEngineerMarketplace = async () => {
    if (!marketplaceInput.trim()) {
      alert('Please enter a Flippa URL, Empire Flippers listing, or website domain.');
      return;
    }

    setParsingMarketplace(true);
    setMarketplaceError(null);
    setMarketplaceData(null);

    try {
      const res = await fetch('/api/marketplace/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urlOrText: marketplaceInput.trim(),
          targetCountry,
        }),
      });

      const rawText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(rawText.slice(0, 120) || `Server error (${res.status})`);
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to reverse engineer listing.');
      }

      setMarketplaceData(data.data);
    } catch (e: any) {
      setMarketplaceError(e.message || 'An error occurred during marketplace parsing.');
    } finally {
      setParsingMarketplace(false);
    }
  };

  const launchResearchWithSeed = (seed: string, country: string, model: string = 'ads') => {
    setSeedKeyword(seed);
    setTargetCountry(country);
    setBusinessModel(model);
    executePipeline(seed, country, model);
  };

  const handleFetchAiIdeas = async () => {
    if (!seedKeyword.trim()) {
      alert('Please enter a seed topic or industry first.');
      return;
    }
    setIdeating(true);
    setAiIdeas([]);
    try {
      const res = await fetch('/api/research/ideate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: seedKeyword,
          nicheType,
          businessModel,
          mode: 'niche_ideas',
        }),
      });
      const rawText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(rawText.slice(0, 120) || `Server error (${res.status})`);
      }

      if (data?.success && data?.ideas) {
        setAiIdeas(data.ideas);
      } else {
        alert(data?.error || 'Failed to generate ideas.');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIdeating(false);
    }
  };

  const handleFetchMultiCountryExpansions = async () => {
    if (!seedKeyword.trim()) {
      alert('Please enter a seed topic first (e.g. Starbucks Menu, Tesla Rim Dimensions, Coffee Prices).');
      return;
    }
    setExpandingMultiCountry(true);
    setMultiCountryExpansions([]);
    try {
      const res = await fetch('/api/research/ideate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: seedKeyword,
          nicheType,
          businessModel,
          mode: 'multi_country_expansion',
        }),
      });
      const rawText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(rawText.slice(0, 120) || `Server error (${res.status})`);
      }

      if (data?.success && data?.expansions) {
        setMultiCountryExpansions(data.expansions);
      } else {
        alert(data?.error || 'Failed to generate multi-country expansions.');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setExpandingMultiCountry(false);
    }
  };

  const executePipeline = async (
    targetSeed: string,
    targetCtry: string,
    bModel: string,
    targetLang?: string
  ) => {
    setExecuting(true);
    setError(null);
    setCurrentStep(1);
    setProgressPercent(5);
    setLogs([`[0.0s] Initializing SEBT-NEXT 15-phase pipeline for: "${targetSeed.trim()}" (${targetCtry})`]);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = Math.min(14, prev + 1);
        setProgressPercent(Math.min(92, Math.round((next / 15) * 100)));
        const phaseName = PIPELINE_PHASES[next - 1]?.title || 'Processing';
        setLogs((l) => [...l, `[Phase ${next}] ${phaseName}...`]);
        return next;
      });
    }, 1200);

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seedKeyword: targetSeed.trim(),
          nicheType,
          businessModel: bModel,
          targetCountry: targetCtry,
          language: targetLang || language,
          minSv,
          maxKd,
          optionalKeywords: optionalKeywords.split(',').map((k) => k.trim()).filter(Boolean),
        }),
      });

      clearInterval(stepInterval);
      const rawText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(rawText.slice(0, 120) || `Server returned error (${res.status})`);
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Research failed');
      }

      setCurrentStep(15);
      setProgressPercent(100);
      setLogs((l) => [
        ...l,
        `[Phase 15] Research completed with score: ${data.report.overallViabilityScore}/100 (${data.report.verdict})`,
        `Redirecting to full intelligence dossier...`,
      ]);

      setTimeout(() => {
        router.push(`/research/${data.researchId}`);
      }, 1000);
    } catch (err: any) {
      clearInterval(stepInterval);
      setExecuting(false);
      setError(err.message || 'An error occurred during analysis.');
      setLogs((l) => [...l, `[ERROR] ${err.message}`]);
    }
  };

  const handleStartResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedKeyword.trim()) return;
    executePipeline(seedKeyword, targetCountry, businessModel, language);
  };

  const currentGeo = getCountryGeoConfig(targetCountry);

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen">
      <Header
        title="Niche Hunter Studio (Pre-Process Module)"
        subtitle="Discover, reverse-engineer, and validate micro-niches before building websites"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'SEO & Niche Hunter', href: '/dashboard' },
          { label: 'Hunter Studio' },
        ]}
      />

      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-10">
        {/* Mode Selector Tabs (Direct Seed vs Marketplace Reverse) */}
        {!executing && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl max-w-md shadow-xs">
            <button
              type="button"
              onClick={() => setActiveMode('direct')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition ${
                activeMode === 'direct'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Direct Seed Explorer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('marketplace')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition ${
                activeMode === 'marketplace'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Marketplace Reverse</span>
            </button>
          </div>
        )}

        {/* Execution Runner Modal/Overlay if Running */}
        {executing && (
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-slate-900">Running 15-Phase Niche Validation</h3>
                  <p className="text-sm text-slate-600">Target: <strong className="text-purple-700">{seedKeyword}</strong> ({currentGeo.flag} {targetCountry} · gl={currentGeo.gl})</p>
                </div>
              </div>
              <span className="text-2xl font-black text-purple-600">{progressPercent}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* 15 Phase Grid Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2">
              {PIPELINE_PHASES.map((p) => {
                const isDone = currentStep > p.step;
                const isCurrent = currentStep === p.step;
                return (
                  <div
                    key={p.step}
                    className={`p-3 rounded-2xl border text-left text-xs transition ${
                      isDone
                        ? 'bg-purple-50 border-purple-200 text-purple-900 font-medium'
                        : isCurrent
                        ? 'bg-purple-600 border-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin flex-shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center text-slate-700">
                          {p.step}
                        </span>
                      )}
                      <span className="truncate text-xs font-semibold">{p.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Terminal Logs Feed */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 font-mono text-xs text-slate-200 h-48 overflow-y-auto space-y-2 shadow-inner">
              <div className="flex items-center gap-2 text-purple-400 pb-2 border-b border-slate-800 text-xs font-bold uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span>SEBT-NEXT Live Execution Stream</span>
              </div>
              {logs.map((log, idx) => (
                <p key={idx} className="text-slate-300 leading-relaxed font-mono">
                  {log}
                </p>
              ))}
            </div>
          </div>
        )}



        {/* MODE 2: DIRECT SEED / TOPIC EXPLORER */}
        {!executing && activeMode === 'direct' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Main Parameters */}
            <div className="lg:col-span-2 space-y-6">
              <form
                onSubmit={handleStartResearch}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm"
              >
                <div className="space-y-1 pb-4 border-b border-slate-100">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase">
                    <Target className="w-3.5 h-3.5" /> Direct Seed Input
                  </div>
                  <h2 className="text-xl font-serif font-bold text-slate-900">Target Seed & Scope</h2>
                  <p className="text-xs text-slate-500">
                    Define the topic seed, parameters, and market filters for the 15-phase pipeline.
                  </p>
                </div>

                {/* Seed Keyword Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Seed Keyword / Core Niche Topic *
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleFetchMultiCountryExpansions}
                        disabled={expandingMultiCountry || !seedKeyword.trim()}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 disabled:opacity-50 transition"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{expandingMultiCountry ? 'Expanding...' : 'Multi-Country Expander'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleFetchAiIdeas}
                        disabled={ideating || !seedKeyword.trim()}
                        className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1.5 disabled:opacity-50 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{ideating ? 'Ideating...' : 'AI Suggestions'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={seedKeyword}
                      onChange={(e) => handleSeedChange(e.target.value)}
                      placeholder="e.g. スタバ メニュー, Starbucks Preise, Tesla Rim Size, Inflatable Kayak Fishing..."
                      className="w-full px-4 py-3.5 bg-[#faf9f6] border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium shadow-xs"
                      required
                    />
                  </div>

                  {/* Auto-Detection Banner */}
                  {detectedGeo && (
                    <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{detectedGeo.flag}</span>
                        <div>
                          <span className="font-bold block text-slate-900">
                            Auto-Detected: {detectedGeo.country} ({detectedGeo.language})
                          </span>
                          <span className="text-[11px] text-purple-700 block">
                            Google Region: <code className="font-mono bg-purple-100 px-1 py-0.5 rounded font-bold">gl={detectedGeo.gl}</code>, Language: <code className="font-mono bg-purple-100 px-1 py-0.5 rounded font-bold">hl={detectedGeo.hl}</code> · {detectedGeo.reason}
                          </span>
                        </div>
                      </div>

                      <a
                        href={getGoogleSearchUrl(seedKeyword, targetCountry, language)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-purple-300 text-purple-700 hover:bg-purple-100 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition shadow-xs"
                      >
                        <span>Test Live SERP ({detectedGeo.gl.toUpperCase()})</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Niche Type & Business Model */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                      Niche Archetype
                    </label>
                    <select
                      value={nicheType}
                      onChange={(e) => setNicheType(e.target.value)}
                      className="w-full bg-[#faf9f6] border-2 border-slate-200 focus:border-purple-600 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-100 transition shadow-xs cursor-pointer"
                    >
                      {NICHE_TYPES.map((t) => (
                        <option key={t.id} value={t.id} className="py-2 text-slate-900 font-semibold">{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                      Monetization Model
                    </label>
                    <select
                      value={businessModel}
                      onChange={(e) => setBusinessModel(e.target.value)}
                      className="w-full bg-[#faf9f6] border-2 border-slate-200 focus:border-purple-600 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-100 transition shadow-xs cursor-pointer"
                    >
                      {BUSINESS_MODELS.map((b) => (
                        <option key={b.id} value={b.id} className="py-2 text-slate-900 font-semibold">{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Country & Language */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-purple-600" /> Target Country & Google Region
                    </label>
                    <select
                      value={targetCountry}
                      onChange={(e) => {
                        const newCtry = e.target.value;
                        setTargetCountry(newCtry);
                        const cfg = getCountryGeoConfig(newCtry);
                        setLanguage(cfg.defaultLanguage);
                      }}
                      className="w-full bg-[#faf9f6] border-2 border-slate-200 focus:border-purple-600 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-100 transition shadow-xs cursor-pointer"
                    >
                      {COUNTRIES.map((c) => {
                        const cfg = getCountryGeoConfig(c);
                        return (
                          <option key={c} value={c} className="py-2 text-slate-900 font-semibold">
                            {cfg.flag} {c} (gl={cfg.gl}) · {cfg.tier.includes('Tier 1') ? 'Tier 1' : 'Tier 2'}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                      Search Language (hl parameter)
                    </label>
                    <input
                      type="text"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-[#faf9f6] border-2 border-slate-200 focus:border-purple-600 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-100 transition shadow-xs"
                    />
                  </div>
                </div>

                {/* Search Volume & Max Competition Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
                  <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 uppercase tracking-wider">Min Search Volume</span>
                      <span className="font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full text-xs">{minSv.toLocaleString()} SV</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="15000"
                      step="100"
                      value={minSv}
                      onChange={(e) => setMinSv(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>

                  <div className="bg-[#faf9f6] p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 uppercase tracking-wider">Max Keyword Difficulty (KD)</span>
                      <span className="font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full text-xs">{maxKd}/100</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="75"
                      step="5"
                      value={maxKd}
                      onChange={(e) => setMaxKd(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Optional Custom Keyword List */}
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                    Optional Seed Modifiers (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={optionalKeywords}
                    onChange={(e) => setOptionalKeywords(e.target.value)}
                    placeholder="e.g. best, reviews, setup guide, cheap, for beginners"
                    className="w-full bg-[#faf9f6] border-2 border-slate-200 focus:border-purple-600 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-100 transition shadow-xs"
                  />
                </div>

                {error && (
                  <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!seedKeyword.trim()}
                  className="w-full py-4 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Target className="w-5 h-5" />
                  <span>Start Complete 15-Phase Niche Validation ({currentGeo.flag} {targetCountry})</span>
                </button>
              </form>
            </div>

            {/* Right Col: AI Ideas & Multi-Country Expansions */}
            <div className="space-y-6">
              {/* Multi-Country Expansions Box (ChatGPT Pattern) */}
              {multiCountryExpansions.length > 0 && (
                <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-700 text-xs font-black uppercase tracking-wider">
                      <Globe className="w-4 h-4" />
                      <span>Multi-Country Shortlist</span>
                    </div>
                    <span className="text-xs bg-indigo-50 text-indigo-800 font-extrabold px-3 py-1 rounded-full border border-indigo-200">
                      {multiCountryExpansions.length} Countries
                    </span>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-slate-900">
                    International Localized Seeds
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Same search intent localized into domestic Tier-1 & Tier-2 languages with low DR anomalies:
                  </p>

                  <div className="space-y-3 pt-1">
                    {multiCountryExpansions.map((exp, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#faf9f6] border-2 border-slate-200 hover:border-indigo-500 text-sm transition space-y-2.5 group shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{exp.flag}</span>
                            <span className="font-bold text-slate-900 text-sm">{exp.country}</span>
                            <span className="text-xs font-semibold text-slate-500">({exp.language})</span>
                          </div>
                          <span className="text-xs font-extrabold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
                            {exp.estimatedRpm} RPM
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                          <span className="font-mono font-bold text-slate-900 text-sm block group-hover:text-indigo-600 transition">
                            {exp.seedKeyword}
                          </span>
                          <span className="text-xs text-slate-600 font-medium block">
                            Meaning: {exp.englishMeaning}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            ~{exp.estimatedMonthlySv.toLocaleString()} SV/mo
                          </span>

                          <div className="flex items-center gap-2">
                            <a
                              href={exp.googleLiveSerpUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-slate-600 hover:text-indigo-600 font-bold flex items-center gap-1 transition"
                            >
                              <span>SERP ({exp.gl.toUpperCase()})</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => {
                                handleSeedChange(exp.seedKeyword);
                                setTargetCountry(exp.country);
                                setLanguage(exp.language);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                            >
                              Select Seed
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Ideas Box */}
              <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-purple-700 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Niche Ideation</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900">Need inspiration?</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Enter any topic on the left and click <strong>"AI Suggestions"</strong> or <strong>"Multi-Country Expander"</strong> to find untapped low-DR gems across global markets.
                </p>

                {aiIdeas.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">Suggested Niches:</span>
                    {aiIdeas.map((idea, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleSeedChange(idea.seedKeyword || idea.nicheName);
                          if (idea.suggestedCountry) setTargetCountry(idea.suggestedCountry);
                          if (idea.suggestedLanguage) setLanguage(idea.suggestedLanguage);
                        }}
                        className="w-full text-left p-4 rounded-2xl bg-[#faf9f6] border-2 border-slate-200 hover:border-purple-500 transition space-y-1.5 group cursor-pointer shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 group-hover:text-purple-700 text-sm block">
                            {idea.seedKeyword || idea.nicheName}
                          </span>
                          {idea.suggestedCountry && (
                            <span className="text-xs text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full font-bold border border-purple-200">
                              {idea.suggestedCountry}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-600 block line-clamp-2 leading-relaxed">
                          {idea.problemSolved || idea.whyItIsUntapped}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 12-Point Master Methodology Heuristics Card */}
              <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-purple-700 text-xs font-black uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Validation Heuristics</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900">
                  Key Evaluation Benchmarks
                </h3>
                <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed divide-y divide-slate-100">
                  <div className="pt-1 space-y-1">
                    <strong className="text-slate-900 block font-bold">1. DR &lt; 20 in Top 10:</strong>
                    <span>At least 2+ low authority websites ranking on Page 1 proves fresh sites can rank.</span>
                  </div>
                  <div className="pt-3 space-y-1">
                    <strong className="text-slate-900 block font-bold">2. Zero AI Overview Immunity:</strong>
                    <span>Raw tables, dimensions, specifications, menu prices, and calculators preserve high CTR.</span>
                  </div>
                  <div className="pt-3 space-y-1">
                    <strong className="text-slate-900 block font-bold">3. Tier 1 Geo RPM Rule:</strong>
                    <span>In US, UK, Germany, Canada ($30–$52 RPM), ~15k/mo search volume easily generates $500+/mo.</span>
                  </div>
                  <div className="pt-3 space-y-1">
                    <strong className="text-slate-900 block font-bold">4. Challenger Brands:</strong>
                    <span>Target secondary chains and niche tools rather than saturated mega-giants.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: MARKETPLACE & FLIPPA REVERSE ENGINEER */}
        {!executing && activeMode === 'marketplace' && (
          <div className="space-y-8">
            {/* Input Box Card */}
            <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="space-y-2 pb-5 border-b border-slate-100">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-xs font-black uppercase tracking-wider">
                  <Store className="w-4 h-4" /> Method 1: Marketplace Reverse Engineering
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                  Paste Flippa / Empire Flippers URL or Website Domain
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                  Reverse engineer existing monetized sites selling on Flippa, uncover their core seed formula, extract low-KD ranking keywords, and expand into multi-country Tier 1 opportunities.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={marketplaceInput}
                    onChange={(e) => setMarketplaceInput(e.target.value)}
                    placeholder="e.g. https://flippa.com/11223344-coffee-prices or starbuckspreise.de or fastingcalories.com"
                    className="flex-1 w-full px-5 py-4 bg-[#faf9f6] border-2 border-slate-200 focus:border-purple-600 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-100 text-sm font-semibold font-mono shadow-xs transition"
                  />

                  <button
                    type="button"
                    onClick={handleReverseEngineerMarketplace}
                    disabled={parsingMarketplace || !marketplaceInput.trim()}
                    className="w-full sm:w-auto px-7 py-4 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    {parsingMarketplace ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-white" />
                    )}
                    <span>{parsingMarketplace ? 'Reverse Engineering...' : 'Reverse Engineer Listing'}</span>
                  </button>
                </div>

                {/* Quick Examples Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Test Examples:</span>
                  {[
                    'https://flippa.com/1234567-starbuckspreise-de',
                    'rimsizing.com',
                    'fastingcalories.com',
                    'legoweightspecs.com',
                  ].map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setMarketplaceInput(ex)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 hover:text-purple-700 hover:border-purple-400 font-mono transition cursor-pointer"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {marketplaceError && (
                <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                  <span>{marketplaceError}</span>
                </div>
              )}
            </div>

            {/* Extracted Intelligence Results Card */}
            {marketplaceData && (
              <div className="bg-white border-2 border-purple-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div>
                    <span className="text-xs uppercase font-black tracking-wider text-purple-700 block">
                      REVERSE-ENGINEERED MARKETPLACE INTELLIGENCE
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1 flex items-center gap-2.5">
                      <span>{marketplaceData.detectedDomain}</span>
                      <span className="text-xs font-sans px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 font-extrabold">
                        {marketplaceData.marketplaceName}
                      </span>
                    </h3>
                    <p className="text-sm text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
                      {marketplaceData.executiveSummary}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-5 rounded-2xl border border-purple-200 text-right shrink-0">
                    <span className="text-xs text-slate-500 uppercase font-extrabold block">Estimated 35x Exit Value</span>
                    <span className="text-3xl font-serif font-bold text-purple-700">
                      ${marketplaceData.exitValuation35x.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-600 block mt-1 font-medium">
                      ~${marketplaceData.estimatedMonthlyProfit.toLocaleString()}/mo profit
                    </span>
                  </div>
                </div>

                {/* 4 KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[#faf9f6] border-2 border-slate-200/90 p-5 rounded-2xl">
                    <span className="text-xs uppercase font-bold text-slate-500 block">Core Seed Keyword</span>
                    <span className="text-base sm:text-lg font-black text-slate-900 block mt-1 truncate">
                      {marketplaceData.coreSeedKeyword}
                    </span>
                  </div>

                  <div className="bg-[#faf9f6] border-2 border-slate-200/90 p-5 rounded-2xl">
                    <span className="text-xs uppercase font-bold text-slate-500 block">Monetization Model</span>
                    <span className="text-base sm:text-lg font-black text-purple-700 block mt-1 truncate">
                      {marketplaceData.monetizationModel}
                    </span>
                  </div>

                  <div className="bg-[#faf9f6] border-2 border-slate-200/90 p-5 rounded-2xl">
                    <span className="text-xs uppercase font-bold text-slate-500 block">Monthly Organic Visits</span>
                    <span className="text-base sm:text-lg font-black text-emerald-700 block mt-1">
                      {marketplaceData.estimatedMonthlyTraffic.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-[#faf9f6] border-2 border-slate-200/90 p-5 rounded-2xl">
                    <span className="text-xs uppercase font-bold text-slate-500 block">Recommended Asset</span>
                    <span className="text-base sm:text-lg font-black text-indigo-700 block mt-1 truncate">
                      {marketplaceData.recommendedAssetType}
                    </span>
                  </div>
                </div>

                {/* Core Seed Pattern Formula Callout */}
                <div className="p-5 rounded-2xl bg-purple-50 border-2 border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-black text-purple-800 uppercase tracking-wider block">
                      IDENTIFIED REPEATABLE SEED FORMULA:
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 font-mono mt-1">
                      {marketplaceData.seedPatternFormula}
                    </h4>
                  </div>
                  <span className="text-xs sm:text-sm text-slate-700 max-w-md leading-relaxed">
                    Replicate this formula across hundreds of entities to build high-barrier programmatic database assets.
                  </span>
                </div>

                {/* Expanded Multi-Country Tier 1 Opportunities */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-serif font-bold text-slate-900">
                      Multi-Country Tier 1 Seed Expansions
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600">
                      High-RPM localized seeds ready for 1-click Niche Hunter validation:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {marketplaceData.expandedSeedsAcrossTiers.map((exp: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-[#faf9f6] border-2 border-slate-200 hover:border-purple-400 rounded-2xl p-5 flex flex-col justify-between gap-4 transition group shadow-xs"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900 group-hover:text-purple-700 font-mono">
                              {exp.seedKeyword}
                            </span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 font-bold">
                              {exp.country} · {exp.rpmRange}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{exp.rationale}</p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            ~{exp.estimatedVolume.toLocaleString()} SV/mo
                          </span>
                          <button
                            onClick={() => launchResearchWithSeed(exp.seedKeyword, exp.country)}
                            className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                          >
                            <span>Launch 15-Phase Research</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ranking Low KD Keywords Table */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-lg font-serif font-bold text-slate-900">
                    Low-Hanging Keywords Already Ranking (KD &lt; 20)
                  </h4>
                  <div className="overflow-x-auto border-2 border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-100 uppercase text-xs tracking-wider text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Keyword</th>
                          <th className="py-3 px-4 text-right">Search Volume</th>
                          <th className="py-3 px-4 text-center">KD</th>
                          <th className="py-3 px-4 text-right">CPC</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {marketplaceData.rankingKeywordsLowKd.map((kw: any, i: number) => (
                          <tr key={i} className="hover:bg-purple-50/50 transition">
                            <td className="py-3 px-4 font-bold text-slate-900">{kw.keyword}</td>
                            <td className="py-3 px-4 text-right text-purple-700 font-bold">
                              {kw.searchVolume.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200">
                                {kw.kd}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">${kw.cpc.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => launchResearchWithSeed(kw.keyword, targetCountry)}
                                className="text-xs font-bold text-purple-600 hover:text-purple-800 underline cursor-pointer"
                              >
                                Analyze Niche
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function HunterStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-[#faf9f6] text-slate-500 text-xs">
          Loading Hunter Studio...
        </div>
      }
    >
      <HunterStudioContent />
    </Suspense>
  );
}
