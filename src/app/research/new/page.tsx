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
import { MASTER_PATTERN_VAULT, PatternBucket, PatternModifier } from '@/lib/engine/pattern-vault';

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

  // Mode Selection: 'pattern-tunnel' vs 'direct' vs 'marketplace'
  const [activeMode, setActiveMode] = useState<'pattern-tunnel' | 'direct' | 'marketplace'>('pattern-tunnel');

  // --- Pattern Tunnel State ---
  const [selectedBucket, setSelectedBucket] = useState<PatternBucket>(MASTER_PATTERN_VAULT[0]);
  const [selectedModifier, setSelectedModifier] = useState<PatternModifier>(MASTER_PATTERN_VAULT[0].modifiers[0]);
  const [customPatternSeed, setCustomPatternSeed] = useState('');
  const [patternCountry, setPatternCountry] = useState('Canada');
  const [scanningPattern, setScanningPattern] = useState(false);
  const [patternScanResult, setPatternScanResult] = useState<any | null>(null);
  const [patternScanError, setPatternScanError] = useState<string | null>(null);

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
      setTargetCountry(country);
      setPatternCountry(country);
    }
    if (mode === 'marketplace') setActiveMode('marketplace');
    if (mode === 'direct') setActiveMode('direct');
  }, [searchParams]);

  // When bucket changes, update default modifier & seed
  const handleBucketSelect = (bucket: PatternBucket) => {
    setSelectedBucket(bucket);
    const firstMod = bucket.modifiers[0];
    setSelectedModifier(firstMod);
    setCustomPatternSeed(firstMod.exampleSeed);
    if (firstMod.suggestedCountries.length > 0 && !firstMod.suggestedCountries.includes(patternCountry)) {
      setPatternCountry(firstMod.suggestedCountries[0]);
    }
  };

  const handleModifierSelect = (modifier: PatternModifier) => {
    setSelectedModifier(modifier);
    setCustomPatternSeed(modifier.exampleSeed);
    if (modifier.suggestedCountries.length > 0 && !modifier.suggestedCountries.includes(patternCountry)) {
      setPatternCountry(modifier.suggestedCountries[0]);
    }
  };

  // Run Ahrefs Pattern Scan & Anomaly Detector
  const handleRunPatternScan = async () => {
    setScanningPattern(true);
    setPatternScanError(null);
    setPatternScanResult(null);

    try {
      const geoConfig = getCountryGeoConfig(patternCountry);
      const res = await fetch('/api/hunt/pattern-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucketId: selectedBucket.id,
          modifierId: selectedModifier.id,
          customSeed: customPatternSeed || selectedModifier.exampleSeed,
          targetCountry: patternCountry,
          language: geoConfig.defaultLanguage,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Pattern scan failed');
      }

      setPatternScanResult(json.data);
    } catch (err: any) {
      setPatternScanError(err.message || 'Error occurred during pattern scanning.');
    } finally {
      setScanningPattern(false);
    }
  };

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

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reverse engineer listing.');
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
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      if (data.success && data.ideas) {
        setAiIdeas(data.ideas);
      } else {
        alert(data.error || 'Failed to generate ideas.');
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
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      if (data.success && data.expansions) {
        setMultiCountryExpansions(data.expansions);
      } else {
        alert(data.error || 'Failed to generate multi-country expansions.');
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
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Server returned error status ${res.status}`);
      }
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Research failed');
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
  const patternGeo = getCountryGeoConfig(patternCountry);

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen">
      <Header
        title="Niche Hunter Studio (Pre-Process Module)"
        subtitle="Discover, reverse-engineer, and validate micro-niches before building websites"
      />

      <main className="flex-1 p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Mode Selector Tabs (Pattern Tunnel vs Direct Seed vs Flippa Marketplace) */}
        {!executing && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl max-w-3xl shadow-xs">
            <button
              onClick={() => setActiveMode('pattern-tunnel')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition ${
                activeMode === 'pattern-tunnel'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>⚡ Pattern Vault & Anomaly Hunter</span>
            </button>

            <button
              onClick={() => setActiveMode('direct')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition ${
                activeMode === 'direct'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Direct Seed Explorer</span>
            </button>

            <button
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Running 15-Phase Niche Validation</h3>
                  <p className="text-xs text-slate-500">Target: {seedKeyword} ({currentGeo.flag} {targetCountry} · gl={currentGeo.gl})</p>
                </div>
              </div>
              <span className="text-xl font-black text-purple-600">{progressPercent}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* 15 Phase Grid Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2">
              {PIPELINE_PHASES.map((p) => {
                const isDone = currentStep > p.step;
                const isCurrent = currentStep === p.step;
                return (
                  <div
                    key={p.step}
                    className={`p-2.5 rounded-2xl border text-left text-xs transition ${
                      isDone
                        ? 'bg-purple-50 border-purple-200 text-purple-800'
                        : isCurrent
                        ? 'bg-purple-600 border-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-3.5 h-3.5 text-white animate-spin flex-shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-[9px] flex items-center justify-center text-slate-600">
                          {p.step}
                        </span>
                      )}
                      <span className="truncate text-[11px]">{p.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Terminal Logs Feed */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 h-40 overflow-y-auto space-y-1.5">
              <div className="flex items-center gap-2 text-slate-400 pb-2 border-b border-slate-800 text-[11px]">
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                <span>SEBT-NEXT Live Execution Stream</span>
              </div>
              {logs.map((log, idx) => (
                <p key={idx} className="text-slate-300 leading-relaxed">
                  {log}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* MODE 1: PATTERN TUNNEL & ANOMALY HUNTER (PRIMARY) */}
        {!executing && activeMode === 'pattern-tunnel' && (
          <div className="space-y-8">
            {/* Header Description */}
            <div className="bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider">
                    <Flame className="w-3.5 h-3.5 text-purple-600" />
                    Automated Discovery Tunnel · Tanveer Nandla Methodology
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-slate-900">
                    Ahrefs SERP Anomaly &amp; Modifier Vault
                  </h2>
                  <p className="text-xs text-slate-500 max-w-2xl">
                    Discover hidden DR &lt; 20 ranking anomalies, zero-click immune specs, viral APK modifiers, and high-RPM Tier 1 multi-language arbitrage.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-2xl border border-purple-200">
                  <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-purple-900 block">Mandatory Filters Active</span>
                    <span className="text-purple-700">Lowest DR &lt; 20 in Top 10 · Exclude AI Overview</span>
                  </div>
                </div>
              </div>

              {/* Bucket Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {MASTER_PATTERN_VAULT.map((bucket) => {
                  const isSelected = selectedBucket.id === bucket.id;
                  return (
                    <button
                      key={bucket.id}
                      type="button"
                      onClick={() => handleBucketSelect(bucket)}
                      className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20'
                          : 'bg-slate-50/70 border-slate-200 hover:border-purple-300 hover:bg-white text-slate-800'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            isSelected ? 'bg-purple-700 text-purple-100' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {bucket.badge}
                          </span>
                          <span className={`text-[11px] font-bold ${isSelected ? 'text-purple-200' : 'text-slate-500'}`}>
                            {bucket.rpmRange}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm pt-1">{bucket.title}</h4>
                        <p className={`text-xs line-clamp-2 ${isSelected ? 'text-purple-100' : 'text-slate-500'}`}>
                          {bucket.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modifier & Country Selection Controls */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-600" />
                    Configure Anomaly Parameters: {selectedBucket.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select a proven pattern modifier or customize the seed query.
                  </p>
                </div>
              </div>

              {/* Modifier Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Proven Modifier Preset
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedBucket.modifiers.map((mod) => {
                    const isModSelected = selectedModifier.id === mod.id;
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => handleModifierSelect(mod)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                          isModSelected
                            ? 'bg-purple-100 border-purple-400 text-purple-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{mod.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isModSelected ? 'bg-purple-200 text-purple-800' : 'bg-slate-200 text-slate-500'
                        }`}>
                          SV: {mod.typicalSv}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seed & Target Country Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Seed Query / Modifier String
                  </label>
                  <input
                    type="text"
                    value={customPatternSeed}
                    onChange={(e) => setCustomPatternSeed(e.target.value)}
                    placeholder={selectedModifier.exampleSeed}
                    className="w-full px-4 py-3 bg-[#faf9f6] border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    💡 Modifer hint: <code className="font-mono text-purple-700 bg-purple-50 px-1 py-0.5 rounded">{selectedModifier.template}</code> ({selectedModifier.description})
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Target Country
                  </label>
                  <select
                    value={patternCountry}
                    onChange={(e) => setPatternCountry(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#faf9f6] border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {COUNTRIES.map((c) => {
                      const cfg = getCountryGeoConfig(c);
                      return (
                        <option key={c} value={c}>
                          {cfg.flag} {c} ({cfg.tier.includes('Tier 1') ? 'Tier 1' : 'Tier 2'}) · ${cfg.rpmRange[0]}-${cfg.rpmRange[1]} RPM
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-[11px] text-purple-700 font-bold">
                    Est. RPM: ${patternGeo.rpmRange[0]} - ${patternGeo.rpmRange[1]} / 1k visits
                  </p>
                </div>
              </div>

              {/* Scan Trigger Button */}
              <div className="pt-2 flex items-center justify-between">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>AI Overview Immunity: <strong>{selectedModifier.aiOverviewImmunity}</strong></span>
                </div>

                <button
                  type="button"
                  onClick={handleRunPatternScan}
                  disabled={scanningPattern}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-purple-600/20 disabled:opacity-50 transition"
                >
                  {scanningPattern ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Scanning Ahrefs SERP Anomaly...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>⚡ Run Ahrefs Anomaly Scan &amp; Vulnerability Check</span>
                    </>
                  )}
                </button>
              </div>

              {patternScanError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{patternScanError}</span>
                </div>
              )}
            </div>

            {/* SCAN RESULTS: LIVE ANOMALY DOSSIER */}
            {patternScanResult && (
              <div className="bg-white border border-purple-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {patternScanResult.verdict}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
                        Viability: {patternScanResult.viabilityScore}/100
                      </span>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-slate-900">
                      SERP Vulnerability Report: &quot;{patternScanResult.seed}&quot;
                    </h3>
                    <p className="text-xs text-slate-500">
                      {patternScanResult.country} ({patternScanResult.tier}) · {patternScanResult.strategicVerdict}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => launchResearchWithSeed(patternScanResult.seed, patternScanResult.country, 'ads')}
                    className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/20 shrink-0 transition"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>🚀 Launch Full 15-Phase Deep Analysis</span>
                  </button>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Search Volume</span>
                    <span className="text-xl font-black text-slate-900">{patternScanResult.searchVolume.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 block">TP: {patternScanResult.trafficPotential.toLocaleString()}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                    <span className="text-[11px] font-bold text-purple-700 uppercase block">DR &lt; 20 in Top 10</span>
                    <span className="text-xl font-black text-purple-900">{patternScanResult.weakDomainsCountInTop10} Weak Sites</span>
                    <span className="text-[10px] text-purple-600 block font-bold">Vulnerability: High</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase block">AI Overview</span>
                    <span className="text-sm font-black text-emerald-900 leading-tight block pt-1">
                      {patternScanResult.aiOverviewStatus}
                    </span>
                    <span className="text-[10px] text-emerald-700 block font-bold">100% Zero-Click Immune</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="text-[11px] font-bold text-amber-700 uppercase block">Est. Revenue (#1)</span>
                    <span className="text-xl font-black text-amber-900">
                      ${patternScanResult.monetization.estimatedMonthlyRevenuePos1.toLocaleString()}/mo
                    </span>
                    <span className="text-[10px] text-amber-700 block">RPM: {patternScanResult.monetization.rpmRange}</span>
                  </div>
                </div>

                {/* Standout Low DR Anomaly Competitor */}
                {patternScanResult.standoutAnomaly && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-purple-600" />
                        Standout Top 10 Low-DR Competitor Anomaly
                      </span>
                      <span className="text-xs font-extrabold text-purple-700 bg-white px-2.5 py-1 rounded-full border border-purple-200">
                        Topical Coverage: {patternScanResult.standoutAnomaly.coverageType}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                      <div className="bg-white p-3 rounded-xl border border-purple-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Target Domain</span>
                        <span className="text-xs font-black text-purple-900 truncate block">{patternScanResult.standoutAnomaly.targetDomain}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-purple-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Domain Rating (DR)</span>
                        <span className="text-sm font-black text-emerald-700">DR {patternScanResult.standoutAnomaly.domainRating}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-purple-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Monthly Traffic</span>
                        <span className="text-sm font-black text-slate-900">{patternScanResult.standoutAnomaly.monthlyTraffic.toLocaleString()} visits</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-purple-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Google Rank</span>
                        <span className="text-sm font-black text-purple-700">Position #{patternScanResult.standoutAnomaly.rankingPosition}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-purple-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Domain Age</span>
                        <span className="text-sm font-black text-indigo-700">{patternScanResult.standoutAnomaly.domainAgeYears} Years</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* What You Should Build & Hostinger Domains */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-purple-600" />
                      What You Should Build (Asset Blueprint)
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 font-bold block">Archetype:</span>
                        <span className="font-extrabold text-purple-900">{patternScanResult.whatYouShouldBuild.archetype}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block">Target Scope:</span>
                        <span className="text-slate-700">{patternScanResult.whatYouShouldBuild.targetPageCount} Pages / Components</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block">Recommended Stack:</span>
                        <code className="font-mono text-[11px] text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 block mt-0.5">
                          {patternScanResult.whatYouShouldBuild.recommendedTech}
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-purple-600" />
                      Suggested Hostinger Domains
                    </h4>
                    <div className="space-y-1.5">
                      {patternScanResult.whatYouShouldBuild.domainSuggestions.map((dom: string, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs">
                          <span className="font-mono font-bold text-purple-950">{dom}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Available via Hostinger MCP
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Estimated Earnings Tier Box */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-amber-950 block">Exit Valuation &amp; Revenue Projection:</span>
                    <span className="text-amber-800">
                      Rank #1: <strong>${patternScanResult.monetization.estimatedMonthlyRevenuePos1}/mo</strong> · Rank #2: <strong>${patternScanResult.monetization.estimatedMonthlyRevenuePos2}/mo</strong> · Rank #3: <strong>${patternScanResult.monetization.estimatedMonthlyRevenuePos3}/mo</strong>
                    </span>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl border border-amber-300 font-bold text-amber-950 shrink-0">
                    35x Asset Valuation: ${patternScanResult.monetization.exitValuation35x.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Niche Archetype</label>
                    <select
                      value={nicheType}
                      onChange={(e) => setNicheType(e.target.value)}
                      className="w-full bg-[#faf9f6] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      {NICHE_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Monetization Model</label>
                    <select
                      value={businessModel}
                      onChange={(e) => setBusinessModel(e.target.value)}
                      className="w-full bg-[#faf9f6] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      {BUSINESS_MODELS.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Country & Language */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-purple-600" /> Target Country & Google Region
                    </label>
                    <select
                      value={targetCountry}
                      onChange={(e) => {
                        const newCtry = e.target.value;
                        setTargetCountry(newCtry);
                        const cfg = getCountryGeoConfig(newCtry);
                        setLanguage(cfg.defaultLanguage);
                      }}
                      className="w-full bg-[#faf9f6] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                    >
                      {COUNTRIES.map((c) => {
                        const cfg = getCountryGeoConfig(c);
                        return (
                          <option key={c} value={c}>
                            {cfg.flag} {c} (gl={cfg.gl}) · {cfg.tier.includes('Tier 1') ? 'Tier 1' : 'Tier 2'}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Search Language (hl parameter)</label>
                    <input
                      type="text"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-[#faf9f6] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Search Volume & Max Competition Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-700">Min Search Volume</span>
                      <span className="font-bold text-purple-700">{minSv.toLocaleString()} SV</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="15000"
                      step="100"
                      value={minSv}
                      onChange={(e) => setMinSv(Number(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-700">Max Keyword Difficulty (KD)</span>
                      <span className="font-bold text-purple-700">{maxKd}/100</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="75"
                      step="5"
                      value={maxKd}
                      onChange={(e) => setMaxKd(Number(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>
                </div>

                {/* Optional Custom Keyword List */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Optional Seed Keywords / Modifiers (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={optionalKeywords}
                    onChange={(e) => setOptionalKeywords(e.target.value)}
                    placeholder="e.g. best, reviews, setup guide, cheap, for beginners"
                    className="w-full bg-[#faf9f6] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!seedKeyword.trim()}
                  className="w-full py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition active:scale-95 disabled:opacity-50"
                >
                  <Target className="w-4 h-4" />
                  <span>Start Complete 15-Phase Niche Validation ({currentGeo.flag} {targetCountry})</span>
                </button>
              </form>
            </div>

            {/* Right Col: AI Ideas & Multi-Country Expansions */}
            <div className="space-y-6">
              {/* Multi-Country Expansions Box (ChatGPT Pattern) */}
              {multiCountryExpansions.length > 0 && (
                <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Multi-Country Shortlist</span>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                      {multiCountryExpansions.length} Countries
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-slate-900">
                    International Localized Seeds
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Same search intent localized into domestic Tier-1 & Tier-2 languages with low DR anomalies:
                  </p>

                  <div className="space-y-2.5 pt-1">
                    {multiCountryExpansions.map((exp, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-[#faf9f6] border border-slate-200 hover:border-indigo-400 text-xs transition space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{exp.flag}</span>
                            <span className="font-bold text-slate-900">{exp.country}</span>
                            <span className="text-[10px] text-slate-400">({exp.language})</span>
                          </div>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                            {exp.estimatedRpm} RPM
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                          <span className="font-mono font-bold text-slate-900 text-xs block group-hover:text-indigo-600 transition">
                            {exp.seedKeyword}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            Meaning: {exp.englishMeaning}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-bold text-emerald-600">
                            ~{exp.estimatedMonthlySv.toLocaleString()} SV/mo
                          </span>

                          <div className="flex items-center gap-2">
                            <a
                              href={exp.googleLiveSerpUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-slate-500 hover:text-indigo-600 font-semibold flex items-center gap-1"
                            >
                              <span>Google ({exp.gl.toUpperCase()})</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            <button
                              onClick={() => {
                                handleSeedChange(exp.seedKeyword);
                                setTargetCountry(exp.country);
                                setLanguage(exp.language);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] transition"
                            >
                              Select
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Ideas Box */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Niche Ideation</span>
                </div>
                <h3 className="text-base font-serif font-bold text-slate-900">Need inspiration?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter any topic on the left and click "AI Suggestions" or "Multi-Country Expander" to find untapped low-DR gems across global markets.
                </p>

                {aiIdeas.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Suggested Niches:</span>
                    {aiIdeas.map((idea, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleSeedChange(idea.seedKeyword || idea.nicheName);
                          if (idea.suggestedCountry) setTargetCountry(idea.suggestedCountry);
                          if (idea.suggestedLanguage) setLanguage(idea.suggestedLanguage);
                        }}
                        className="w-full text-left p-3 rounded-2xl bg-[#faf9f6] border border-slate-200 hover:border-purple-400 text-xs transition space-y-1 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 group-hover:text-purple-700 block">
                            {idea.seedKeyword || idea.nicheName}
                          </span>
                          {idea.suggestedCountry && (
                            <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-bold">
                              {idea.suggestedCountry}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 block line-clamp-2">
                          {idea.problemSolved || idea.whyItIsUntapped}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* High RPM Fast Presets */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <h3 className="text-base font-serif font-bold text-slate-900">Popular High-RPM Seeds</h3>
                <div className="space-y-2">
                  {[
                    { seed: 'スタバ メニュー', country: 'Japan', language: 'Japanese', type: 'menu', model: 'ads' },
                    { seed: 'Starbucks Preise', country: 'Germany', language: 'German', type: 'menu', model: 'ads' },
                    { seed: 'Starbucks prijzen', country: 'Netherlands', language: 'Dutch', type: 'menu', model: 'ads' },
                    { seed: 'Tesla Rim Dimensions', country: 'United States', language: 'English', type: 'utility', model: 'ads' },
                    { seed: 'Inflatable Kayak Fishing', country: 'United States', language: 'English', type: 'affiliate', model: 'affiliate' },
                  ].map((preset, i) => {
                    const geo = getCountryGeoConfig(preset.country);
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          handleSeedChange(preset.seed);
                          setTargetCountry(preset.country);
                          setLanguage(preset.language || geo.defaultLanguage);
                          setNicheType(preset.type);
                          setBusinessModel(preset.model);
                        }}
                        className="w-full p-2.5 rounded-2xl bg-[#faf9f6] border border-slate-200 hover:border-purple-300 text-left text-xs flex items-center justify-between text-slate-700 hover:text-slate-900 transition"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{geo.flag}</span>
                          <span className="font-semibold">{preset.seed}</span>
                        </div>
                        <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 font-bold">
                          {preset.country} (gl={geo.gl})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: MARKETPLACE & FLIPPA REVERSE ENGINEER */}
        {!executing && activeMode === 'marketplace' && (
          <div className="space-y-8">
            {/* Input Box Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="space-y-1 pb-4 border-b border-slate-100">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase">
                  <Store className="w-3.5 h-3.5" /> Method 1: Marketplace Reverse Engineering
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                  Paste Flippa / Empire Flippers URL or Website Domain
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
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
                    className="flex-1 w-full px-4 py-3.5 bg-[#faf9f6] border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium font-mono shadow-xs"
                  />

                  <button
                    type="button"
                    onClick={handleReverseEngineerMarketplace}
                    disabled={parsingMarketplace || !marketplaceInput.trim()}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition active:scale-95 disabled:opacity-50 shrink-0"
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
                  <span className="text-[11px] font-bold text-slate-500">Quick Test Examples:</span>
                  {[
                    'https://flippa.com/1234567-starbuckspreise-de',
                    'rimsizing.com',
                    'fastingcalories.com',
                    'legoweightspecs.com',
                  ].map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setMarketplaceInput(ex)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 hover:text-slate-900 hover:border-purple-300 font-mono transition"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {marketplaceError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{marketplaceError}</span>
                </div>
              )}
            </div>

            {/* Extracted Intelligence Results Card */}
            {marketplaceData && (
              <div className="bg-white border-2 border-purple-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 block">
                      REVERSE-ENGINEERED MARKETPLACE INTELLIGENCE
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                      <span>{marketplaceData.detectedDomain}</span>
                      <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                        {marketplaceData.marketplaceName}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                      {marketplaceData.executiveSummary}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-right shrink-0">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Estimated 35x Exit Value</span>
                    <span className="text-2xl font-serif font-bold text-purple-700">
                      ${marketplaceData.exitValuation35x.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      ~${marketplaceData.estimatedMonthlyProfit.toLocaleString()}/mo profit
                    </span>
                  </div>
                </div>

                {/* 4 KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#faf9f6] border border-slate-200 p-4 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Core Seed Keyword</span>
                    <span className="text-base font-bold text-slate-900 block mt-1 truncate">
                      {marketplaceData.coreSeedKeyword}
                    </span>
                  </div>

                  <div className="bg-[#faf9f6] border border-slate-200 p-4 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Monetization Model</span>
                    <span className="text-base font-bold text-purple-700 block mt-1 truncate">
                      {marketplaceData.monetizationModel}
                    </span>
                  </div>

                  <div className="bg-[#faf9f6] border border-slate-200 p-4 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Organic Visits</span>
                    <span className="text-base font-bold text-emerald-600 block mt-1">
                      {marketplaceData.estimatedMonthlyTraffic.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-[#faf9f6] border border-slate-200 p-4 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Recommended Asset</span>
                    <span className="text-base font-bold text-indigo-700 block mt-1 truncate">
                      {marketplaceData.recommendedAssetType}
                    </span>
                  </div>
                </div>

                {/* Core Seed Pattern Formula Callout */}
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                      IDENTIFIED REPEATABLE SEED FORMULA:
                    </span>
                    <h4 className="text-base font-bold text-slate-900 font-mono mt-0.5">
                      {marketplaceData.seedPatternFormula}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-600 max-w-sm">
                    Replicate this formula across hundreds of entities to build high-barrier programmatic database assets.
                  </span>
                </div>

                {/* Expanded Multi-Country Tier 1 Opportunities */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-serif font-bold text-slate-900">
                        Multi-Country Tier 1 Seed Expansions
                      </h4>
                      <p className="text-xs text-slate-500">
                        High-RPM localized seeds ready for 1-click Niche Hunter validation:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {marketplaceData.expandedSeedsAcrossTiers.map((exp: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-[#faf9f6] border border-slate-200 hover:border-purple-400 rounded-2xl p-4 flex flex-col justify-between gap-3 transition group shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-purple-700 font-mono">
                              {exp.seedKeyword}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                              {exp.country} · {exp.rpmRange}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{exp.rationale}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                          <span className="text-[11px] text-slate-700 font-medium">
                            ~{exp.estimatedVolume.toLocaleString()} SV/mo
                          </span>
                          <button
                            onClick={() => launchResearchWithSeed(exp.seedKeyword, exp.country)}
                            className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
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
                <div className="space-y-3 pt-2">
                  <h4 className="text-base font-serif font-bold text-slate-900">
                    Low-Hanging Keywords Already Ranking (KD &lt; 20)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-[#faf9f6] uppercase text-[10px] tracking-wider text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Keyword</th>
                          <th className="py-2.5 px-3 text-right">Search Volume</th>
                          <th className="py-2.5 px-3 text-center">KD</th>
                          <th className="py-2.5 px-3 text-right">CPC</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {marketplaceData.rankingKeywordsLowKd.map((kw: any, i: number) => (
                          <tr key={i} className="hover:bg-purple-50/40 transition">
                            <td className="py-2.5 px-3 font-bold text-slate-900">{kw.keyword}</td>
                            <td className="py-2.5 px-3 text-right text-purple-700 font-bold">
                              {kw.searchVolume.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-100">
                                {kw.kd}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">${kw.cpc.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => launchResearchWithSeed(kw.keyword, targetCountry)}
                                className="text-xs font-bold text-purple-600 hover:text-purple-800 underline"
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
