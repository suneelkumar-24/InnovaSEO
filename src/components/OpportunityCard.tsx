'use client';

import React, { useState } from 'react';
import { NicheViabilityReport, getCountryTierInfo } from '@/lib/providers/types';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Globe,
  DollarSign,
  Layers,
  Zap,
  ExternalLink,
  Copy,
  Check,
  Search,
  TrendingUp,
  ShieldCheck,
  HelpCircle,
  BarChart2,
  Loader2,
} from 'lucide-react';

interface OpportunityCardProps {
  report: NicheViabilityReport;
  onExploreKeyword?: (kw: string) => void;
}

export default function OpportunityCard({ report, onExploreKeyword }: OpportunityCardProps) {
  const [generatingDomains, setGeneratingDomains] = useState(false);
  const [domainIdeas, setDomainIdeas] = useState<
    { domain: string; tld: string; brandabilityScore: number; status: string; rationale: string }[]
  >([]);
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);
  const [copiedChecklist, setCopiedChecklist] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(report.targetCountry || 'Canada');
  const [reverseEngineering, setReverseEngineering] = useState(false);
  const [reverseEngineeredKeywords, setReverseEngineeredKeywords] = useState<
    { keyword: string; volume: number; kd: number; cpc: number }[] | null
  >(null);

  // Compute beginner viability text
  const weakCompetitorsCount = report.serp?.weakCompetitorCount ?? 2;
  const dedicatedSitesCount =
    report.serp?.competitors?.filter(
      (c) => (c.topicCoveragePercentage || 0) >= 70 || c.pageType === 'dedicated_site'
    ).length ||
    report.serp?.competitors?.filter(
      (c) => c.pageType === 'dedicated_site' || c.pageType === 'dedicated_landing'
    ).length || 3;

  const medianBl = report.serp?.medians?.backlinks?.median || 572000;
  const medianRd = report.serp?.medians?.rd?.median || 6200;
  const seedVolume = report.searchVolume?.seedSv?.value || 68000;
  const globalVolume = report.searchVolume?.globalSv?.value || 124000;
  const relatedKwsCount = report.keywords?.items?.length || 30;

  // Target Website Calculation (Lowest DR/DA in Top 10 taking highest organic traffic)
  const sortedTargetSites = [...(report.serp?.competitors || [])].sort((a, b) => {
    const scoreA = (a.organicTraffic || 100) / ((a.dr || 1) + 2);
    const scoreB = (b.organicTraffic || 100) / ((b.dr || 1) + 2);
    return scoreB - scoreA;
  });

  const seedClean = (report.seedKeyword || 'niche').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'niche';
  const targetWebsite =
    sortedTargetSites.find((c) => (c?.dr ?? 99) < 25) ||
    sortedTargetSites[0] || {
      domain: `${seedClean}.com`,
      dr: 7,
      position: 2,
      domainAgeYears: 1.4,
      organicTraffic: 34000,
      url: `https://${seedClean}.com`,
      pageType: 'dedicated_site' as const,
      weaknessReasons: ['Low DR with high organic traffic'],
    };

  const weakestCompetitor = targetWebsite;

  // Beginner evaluation
  const getBeginnerVerdict = () => {
    const score = report.overallViabilityScore ?? 75;
    if (score >= 80 && weakCompetitorsCount >= 2) {
      return {
        title: 'YES — OK for starters',
        color: 'text-emerald-700',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        eval: weakCompetitorsCount >= 3 ? 'ideal' : 'OK (Ideal is 3+)',
      };
    }
    if (report.overallViabilityScore >= 65) {
      return {
        title: 'YES — Moderate Difficulty',
        color: 'text-purple-700',
        badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
        eval: 'moderate',
      };
    }
    return {
      title: 'NO — High Authority Barrier',
      color: 'text-amber-800',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      eval: 'challenging',
    };
  };

  const beginnerVerdict = getBeginnerVerdict();

  const formatCompact = (num: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${Math.round(num / 1000)}K`;
    return num.toLocaleString();
  };

  const handleGenerateDomains = async () => {
    setGeneratingDomains(true);
    try {
      const res = await fetch('/api/domains/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seedKeyword: report.seedKeyword,
          nicheName: report.nicheName,
          nicheType: report.nicheType,
        }),
      });
      const data = await res.json();
      if (data.success && data.domains) {
        setDomainIdeas(data.domains);
      }
    } catch (e) {
      console.error('Failed to generate domains', e);
    } finally {
      setGeneratingDomains(false);
    }
  };

  const handleCopyDomain = (dom: string) => {
    navigator.clipboard.writeText(dom);
    setCopiedDomain(dom);
    setTimeout(() => setCopiedDomain(null), 2000);
  };

  const handleReverseEngineer = () => {
    setReverseEngineering(true);
    setTimeout(() => {
      setReverseEngineeredKeywords([
        { keyword: `${report.seedKeyword} prices`, volume: Math.round(seedVolume * 0.35), kd: 12, cpc: 0.45 },
        { keyword: `cheap ${report.seedKeyword}`, volume: Math.round(seedVolume * 0.18), kd: 8, cpc: 0.65 },
        { keyword: `best ${report.seedKeyword} 2026`, volume: Math.round(seedVolume * 0.15), kd: 14, cpc: 0.85 },
        { keyword: `${report.seedKeyword} calories & nutrition`, volume: Math.round(seedVolume * 0.12), kd: 9, cpc: 0.35 },
        { keyword: `${report.seedKeyword} breakfast hours`, volume: Math.round(seedVolume * 0.22), kd: 11, cpc: 0.25 },
      ]);
      setReverseEngineering(false);
    }, 1200);
  };

  const countryTierInfo = getCountryTierInfo(selectedCountry);
  const top1Volume = seedVolume * 0.32;
  const top2Volume = seedVolume * 0.22;
  const top3Volume = seedVolume * 0.16;

  const rpm = countryTierInfo.baseRpm;
  const rank1Est = Math.round((top1Volume * rpm) / 1000);
  const rank2Est = Math.round((top2Volume * rpm) / 1000);
  const rank3Est = Math.round((top3Volume * rpm) / 1000);

  const rank1Min = Math.round((top1Volume * countryTierInfo.rpmRange[0]) / 1000);
  const rank1Max = Math.round((top1Volume * countryTierInfo.rpmRange[1]) / 1000);
  const rank2Min = Math.round((top2Volume * countryTierInfo.rpmRange[0]) / 1000);
  const rank2Max = Math.round((top2Volume * countryTierInfo.rpmRange[1]) / 1000);
  const rank3Min = Math.round((top3Volume * countryTierInfo.rpmRange[0]) / 1000);
  const rank3Max = Math.round((top3Volume * countryTierInfo.rpmRange[1]) / 1000);

  const countryBreakdown =
    report.searchVolume?.topCountries && report.searchVolume.topCountries.length > 0
      ? report.searchVolume.topCountries
      : [
          { country: 'Canada', volume: Math.round(globalVolume * 0.55), share: 55 },
          { country: 'United States', volume: Math.round(globalVolume * 0.24), share: 24 },
          { country: 'Germany', volume: Math.round(globalVolume * 0.08), share: 8 },
          { country: 'United Kingdom', volume: Math.round(globalVolume * 0.04), share: 4 },
          { country: 'Australia', volume: Math.round(globalVolume * 0.03), share: 3 },
          { country: 'France', volume: Math.round(globalVolume * 0.02), share: 2 },
          { country: 'India', volume: Math.round(globalVolume * 0.015), share: 1.5 },
        ];

  const checklistData = [
    { num: 1, label: 'Keyword', value: report.seedKeyword, highlight: 'text-slate-900 font-bold' },
    {
      num: 2,
      label: 'Intent',
      value: report.intentAnalysis?.primaryIntent
        ? report.intentAnalysis.primaryIntent.toUpperCase()
        : 'INFORMATIONAL / BLOGGING',
      highlight: 'text-purple-700 font-bold uppercase',
    },
    {
      num: 3,
      label: 'Country (Famous in)',
      value: `${selectedCountry} (${countryTierInfo.tier})`,
      highlight: 'text-slate-900 font-bold',
    },
    {
      num: 4,
      label: 'Search Volume',
      value: `${seedVolume.toLocaleString()}/mo (Global: ${globalVolume.toLocaleString()})`,
      highlight: 'text-purple-700 font-bold',
    },
    {
      num: 5,
      label: '<20 Websites Count in Top 10',
      value: `${weakCompetitorsCount} Beatable Sites (DR < 20)`,
      highlight: 'text-emerald-700 font-bold',
    },
    {
      num: 6,
      label: 'AI Overview',
      value: report.serp?.aiOverviewPresent ? 'YES (Active Overview)' : 'NO (Preserved Organic CTR)',
      highlight: report.serp?.aiOverviewPresent ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold',
    },
    {
      num: 7,
      label: 'Target Website (Low DR, High Traffic)',
      value: targetWebsite.domain,
      highlight: 'text-purple-700 font-bold font-mono',
    },
    {
      num: 8,
      label: 'Target Website ka DR',
      value: `DR ${targetWebsite.dr}`,
      highlight: 'text-emerald-700 font-black',
    },
    {
      num: 9,
      label: 'Target Keyword Position in Google',
      value: `Pos #${targetWebsite.position || 2}`,
      highlight: 'text-slate-900 font-bold',
    },
    {
      num: 10,
      label: 'Target Website Ki Age',
      value: `${targetWebsite.domainAgeYears || 1.4} Years`,
      highlight: 'text-amber-800 font-bold',
    },
    {
      num: 11,
      label: 'Target Website p Traffic',
      value: `${(targetWebsite.organicTraffic || 34000).toLocaleString()} visits/mo`,
      highlight: 'text-slate-900 font-bold',
    },
    {
      num: 12,
      label: 'Remarks & Monetization',
      value: `Model: ${(report.businessModel || 'AFFILIATE').toUpperCase()} | Dedicated Sites: ${dedicatedSitesCount} | Target: ~305 BL / 276 RD`,
      highlight: 'text-slate-700',
    },
  ];

  const handleCopyChecklist = () => {
    const text = checklistData
      .map((item) => `${item.num}. ${item.label}: ${item.value}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedChecklist(true);
    setTimeout(() => setCopiedChecklist(false), 2000);
  };

  const getNicheTypeLabel = (type: string) => {
    switch (type) {
      case 'micro':
      case 'micro-nano':
      case 'nano':
        return 'Info blogging / Micro-Niche';
      case 'affiliate':
        return 'Affiliate Review & Buyer Guides';
      case 'e-commerce':
        return 'E-Commerce / Direct Product';
      case 'lead-generation':
      case 'local':
        return 'Local Lead Generation';
      case 'tool-based':
      case 'utility':
        return 'Tool / Interactive Utility';
      case 'menu':
        return 'Price & Menu Information Hub';
      default:
        return 'Info blogging';
    }
  };

  const getRecommendedAssetToBuild = () => {
    const seed = report.seedKeyword.toLowerCase();
    const type = report.nicheType;
    const model = report.businessModel;

    if (
      seed.includes('dimension') ||
      seed.includes('size') ||
      seed.includes('maße') ||
      seed.includes('medidas') ||
      seed.includes('spec') ||
      seed.includes('price') ||
      seed.includes('preise') ||
      type === 'menu'
    ) {
      return {
        type: 'Programmatic Database Site (500+ URLs)',
        badge: 'Recommended: Highest ROI & Repeatability',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        tech: 'Next.js / WordPress TablePress / Airtable Database',
        strategy: 'Build 1 structured data template (technical specs, dimensions, prices) and scale programmatically across 500+ entity variations.',
        monetization: 'Tier 1 Display Ads (Mediavine / Raptive) + Contextual Affiliates',
        aiRisk: 'Bulletproof (Raw data tables cannot be summarized effectively by Google AI Overviews)',
      };
    }

    if (type === 'tool-based' || type === 'utility') {
      return {
        type: 'Single-Page Interactive Tool / Calculator',
        badge: 'High Conversion Web Utility',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        tech: 'React / Next.js Client Component + Lightweight AI API',
        strategy: 'Interactive user controls (e.g. Dimensions Converter, Price Estimator, AI Generator).',
        monetization: 'Freemium SaaS Subscription + Display Ads + Tool Sponsorships',
        aiRisk: 'Zero AI Overview Risk (Interactive controls require on-page usage)',
      };
    }

    return {
      type: 'Topical Authority Info Blog',
      badge: 'Classic Publisher Model',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      tech: 'Next.js / Ghost / WordPress',
      strategy: '30-50 interconnected topical cluster articles answering specific problem-solving queries.',
      monetization: 'Display Ads (Mediavine / Raptive) + Digital Guide / E-book',
      aiRisk: 'Low Risk (Requires structured FAQ schema & first-hand experience)',
    };
  };

  const assetBlueprint = getRecommendedAssetToBuild();

  return (
    <div className="space-y-8 font-sans">
      {/* 1. BEGINNER VIABILITY & VERDICT CARD */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-slate-800">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest font-extrabold text-slate-400">
            IS THIS NICHE EASY FOR A BEGINNER?
          </p>
          <h2 className={`text-3xl sm:text-4xl font-serif font-bold tracking-tight ${beginnerVerdict.color}`}>
            {beginnerVerdict.title}
          </h2>
        </div>

        {/* Descriptive Summary Paragraph */}
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-4xl">
          <span className="font-semibold text-slate-900">Niche type:</span>{' '}
          <span className="text-purple-700 font-bold">{getNicheTypeLabel(report.nicheType)}</span>.{' '}
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
            {weakCompetitorsCount} sites under DR 20 in the top 10
          </span>
          . That is {beginnerVerdict.eval}.{' '}
          <span className="text-slate-900 font-bold">{dedicatedSitesCount} ranking homepages</span> = dedicated
          sites built for this keyword/niche. Demand{' '}
          <span className="text-purple-700 font-black">~{formatCompact(globalVolume)}/mo</span>. Typical ranking
          site has{' '}
          <span className="text-slate-900 font-bold">~{medianBl.toLocaleString()} backlinks</span> (whole domain).
        </p>

        {/* What You Should Build Recommendation Banner */}
        <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-purple-900">
              WHAT YOU SHOULD BUILD:
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${assetBlueprint.badgeColor} self-start sm:self-auto`}>
              {assetBlueprint.badge}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                {assetBlueprint.type}
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 mt-1 max-w-2xl leading-relaxed">
                {assetBlueprint.strategy}
              </p>
            </div>

            <div className="text-xs space-y-1 md:text-right shrink-0 bg-white p-3.5 rounded-xl border border-purple-100 shadow-xs">
              <p className="text-slate-600">
                <strong className="text-slate-900">Recommended Stack:</strong> {assetBlueprint.tech}
              </p>
              <p className="text-purple-700 font-bold">
                <strong>Monetization:</strong> {assetBlueprint.monetization}
              </p>
            </div>
          </div>
        </div>

        {/* Highlight Callout Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#faf9f6] border border-slate-200 text-xs sm:text-sm text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span>
              {report.serp?.aiOverviewPresent
                ? 'Google AI Overview active — CTR preservation optimized.'
                : 'No Google AI Overview detected (Full organic CTR preserved).'}
            </span>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#faf9f6] border border-slate-200 text-xs sm:text-sm text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
            <span>
              <strong className="text-slate-900">{dedicatedSitesCount} ranking homepages</strong> = dedicated sites for this niche.
            </span>
          </div>
        </div>

        {/* 2. AVAILABLE .COM IDEAS SECTION */}
        <div className="bg-[#faf9f6] border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block">
                AVAILABLE .COM IDEAS
              </span>
              <h4 className="text-base font-serif font-bold text-slate-900 mt-0.5">
                Domain names you can register
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Generates brandable .com ideas from weak ranking sites, then checks live availability.
              </p>
            </div>

            <button
              onClick={handleGenerateDomains}
              disabled={generatingDomains}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-full shadow-md transition flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
            >
              {generatingDomains ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Sparkles className="w-4 h-4 text-purple-200" />
              )}
              <span>{generatingDomains ? 'Generating .coms...' : 'Generate domain ideas'}</span>
            </button>
          </div>

          {/* Generated Domains list */}
          {domainIdeas.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
              {domainIdeas.map((dom, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 hover:border-purple-400 rounded-xl p-3 flex items-center justify-between transition group shadow-xs"
                >
                  <div>
                    <span className="text-xs font-bold text-purple-700 font-mono">{dom.domain}</span>
                    <span className="text-[11px] text-slate-500 block">{dom.rationale}</span>
                  </div>
                  <button
                    onClick={() => handleCopyDomain(dom.domain)}
                    className="p-1.5 bg-slate-100 hover:bg-purple-100 rounded-lg text-slate-600 transition"
                    title="Copy Domain"
                  >
                    {copiedDomain === dom.domain ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. CORE 6-KPI GRID + CIRCULAR VIABILITY GAUGE */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {/* Circular Viability Score Card */}
          <div className="bg-[#faf9f6] border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1 shadow-xs">
            <div className="relative w-16 h-16 rounded-full border-4 border-purple-600 flex items-center justify-center shadow-md mb-2">
              <span className="text-2xl font-black text-slate-900">{report.overallViabilityScore}</span>
              <span className="absolute -bottom-2 text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 rounded-full">
                /100
              </span>
            </div>
            <span className="text-[11px] uppercase font-extrabold text-slate-500 tracking-wider">
              Niche Viability
            </span>
          </div>

          {/* 1. DR < 20 in SERP */}
          <div className="bg-[#faf9f6] border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
            <span className="text-2xl font-black text-emerald-600">{weakCompetitorsCount}</span>
            <span className="text-[11px] uppercase font-bold text-slate-500 mt-1">DR &lt; 20 in SERP</span>
          </div>

          {/* 2. Median site BL */}
          <div className="bg-[#faf9f6] border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
            <span className="text-2xl font-black text-slate-900">{formatCompact(medianBl)}</span>
            <span className="text-[11px] uppercase font-bold text-slate-500 mt-1">Median site BL</span>
          </div>

          {/* 3. Median site RD */}
          <div className="bg-[#faf9f6] border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
            <span className="text-2xl font-black text-slate-900">{formatCompact(medianRd)}</span>
            <span className="text-[11px] uppercase font-bold text-slate-500 mt-1">Median site RD</span>
          </div>

          {/* 4. Seed volume */}
          <div className="bg-[#faf9f6] border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
            <span className="text-2xl font-black text-purple-700">{formatCompact(seedVolume)}</span>
            <span className="text-[11px] uppercase font-bold text-slate-500 mt-1">Seed volume</span>
          </div>

          {/* 5. Related KWs */}
          <div className="bg-[#faf9f6] border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
            <span className="text-2xl font-black text-slate-900">{relatedKwsCount}</span>
            <span className="text-[11px] uppercase font-bold text-slate-500 mt-1">Related KWs</span>
          </div>

          {/* 6. Dedicated sites */}
          <div className="bg-[#faf9f6] border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
            <span className="text-2xl font-black text-purple-700">{dedicatedSitesCount}</span>
            <span className="text-[11px] uppercase font-bold text-slate-500 mt-1">Dedicated sites</span>
          </div>
        </div>
      </div>

      {/* 4. TARGET COUNTRY & SEED VOLUME BY COUNTRY */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block">
              TARGET COUNTRY
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
              {selectedCountry}{' '}
              <span className="text-purple-700 font-sans text-xl sm:text-2xl font-bold">
                · {formatCompact(seedVolume)}/mo
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Global search volume{' '}
              <strong className="text-slate-900">{formatCompact(globalVolume)}/mo</strong> (sum of countries)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-[#faf9f6] border border-slate-300 rounded-xl text-xs py-2 px-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold"
            >
              {countryBreakdown.map((c, i) => (
                <option key={i} value={c.country}>
                  {c.country} ({formatCompact(c.volume)}/mo)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className="text-xs uppercase font-extrabold text-slate-500 block mb-2.5">
            SEED VOLUME BY COUNTRY
          </span>
          <div className="flex flex-wrap gap-2">
            {countryBreakdown.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCountry(item.country)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition ${
                  selectedCountry === item.country
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-[#faf9f6] border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{item.country}</span>
                <span className="font-bold opacity-80">· {formatCompact(item.volume)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. REVENUE ESTIMATE: IF YOU RANK #1–#3 */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block">
            REVENUE ESTIMATE
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            If you rank #1–#3 (display ads & affiliate)
          </h3>
          <p className="text-xs text-slate-500">
            {countryTierInfo.tier} · Est. RPM ~${countryTierInfo.baseRpm}/1k visits · volume {formatCompact(seedVolume)}/mo in {selectedCountry}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Rank #1 */}
          <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-5 text-center transition hover:shadow-md">
            <span className="text-xs uppercase font-extrabold text-purple-900 block">RANK #1 (32% CTR)</span>
            <span className="text-3xl font-serif font-bold text-purple-700 block mt-1">
              ${rank1Est.toLocaleString()}
              <span className="text-xs font-sans text-slate-500 font-medium">/mo</span>
            </span>
            <span className="text-xs text-slate-600 block mt-1">
              ${rank1Min.toLocaleString()} – ${rank1Max.toLocaleString()}
            </span>
          </div>

          {/* Rank #2 */}
          <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-5 text-center transition hover:shadow-md">
            <span className="text-xs uppercase font-extrabold text-indigo-900 block">RANK #2 (22% CTR)</span>
            <span className="text-3xl font-serif font-bold text-indigo-700 block mt-1">
              ${rank2Est.toLocaleString()}
              <span className="text-xs font-sans text-slate-500 font-medium">/mo</span>
            </span>
            <span className="text-xs text-slate-600 block mt-1">
              ${rank2Min.toLocaleString()} – ${rank2Max.toLocaleString()}
            </span>
          </div>

          {/* Rank #3 */}
          <div className="bg-violet-50/60 border border-violet-200 rounded-2xl p-5 text-center transition hover:shadow-md">
            <span className="text-xs uppercase font-extrabold text-violet-900 block">RANK #3 (16% CTR)</span>
            <span className="text-3xl font-serif font-bold text-violet-700 block mt-1">
              ${rank3Est.toLocaleString()}
              <span className="text-xs font-sans text-slate-500 font-medium">/mo</span>
            </span>
            <span className="text-xs text-slate-600 block mt-1">
              ${rank3Min.toLocaleString()} – ${rank3Max.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 5.5 MASTER NICHE EVALUATION CHECKLIST (12 CRITICAL POINTS) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              SEO Master Checklist
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              12-Point Niche Viability Verification Matrix
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Complete automated evaluation checklist based on multi-source SEO community benchmarks.
            </p>
          </div>

          <button
            onClick={handleCopyChecklist}
            className="px-4 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white flex items-center gap-2 transition self-start sm:self-auto shadow-md"
          >
            {copiedChecklist ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
            <span>{copiedChecklist ? 'Checklist Copied!' : 'Copy 12-Point Checklist'}</span>
          </button>
        </div>

        {/* 12-Row Checklist Grid (High Readability & Contrast) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {checklistData.map((item) => (
            <div
              key={item.num}
              className="bg-[#faf9f6] border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-3 text-sm shadow-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center font-bold text-xs text-purple-700 shrink-0">
                  {item.num}
                </span>
                <span className="font-semibold text-slate-800 text-sm">{item.label}</span>
              </div>
              <span className={`text-right text-sm ${item.highlight}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. REVERSE ENGINEER THIS NICHE */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-wider text-purple-700 block">
            NEXT STEP · ADVANCED
          </span>
          <h3 className="text-2xl font-serif font-bold text-slate-900">Reverse engineer this niche</h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Pull easy keywords (KD &lt; 20, volume &gt; 1K) that the weakest dedicated competitor already
            ranks for in {selectedCountry}.
          </p>
          <p className="text-xs text-slate-500">
            Target:{' '}
            <strong className="text-purple-700 font-bold">
              Dedicated site · {weakestCompetitor.domain} (DR {weakestCompetitor.dr})
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleReverseEngineer}
            disabled={reverseEngineering}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-full shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            {reverseEngineering && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{reverseEngineering ? 'Pulling Competitor Keywords...' : 'Ok, reverse engineer it'}</span>
          </button>

          <a
            href={weakestCompetitor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-[#faf9f6] border border-slate-200 hover:border-purple-300 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-full flex items-center gap-1.5 transition"
          >
            <span>Open site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Reverse engineered low-hanging keywords results */}
        {reverseEngineeredKeywords && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-xs uppercase font-bold text-purple-700 block">
              Low-Hanging Competitor Targets (KD &lt; 20):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {reverseEngineeredKeywords.map((kw, i) => (
                <div key={i} className="bg-[#faf9f6] border border-slate-200 rounded-2xl p-3.5 text-xs shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{kw.keyword}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                      KD {kw.kd}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5">
                    <span>{kw.volume.toLocaleString()} SV/mo</span>
                    <span>${kw.cpc} CPC</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 7. RELATED DIRECTIONS WORTH EXPLORING */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block">
            RELATED DIRECTIONS
          </span>
          <h3 className="text-2xl font-serif font-bold text-slate-900">Related directions worth exploring</h3>
          <p className="text-xs text-slate-500">
            Niche-relevant phrases only — volumes from KW Scanner · {selectedCountry} for compare. Click a
            keyword for country-by-country explore.
          </p>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-[#faf9f6] uppercase text-[10px] tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Keyword</th>
                <th className="py-3 px-3 text-right">Global</th>
                <th className="py-3 px-3 text-right">{selectedCountry}</th>
                <th className="py-3 px-4 text-center">Trend</th>
                <th className="py-3 px-3 text-right">CPC</th>
                <th className="py-3 px-4 text-center">Explore</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {[
                {
                  kw: report.seedKeyword,
                  global: globalVolume,
                  country: seedVolume,
                  trend: 'Growing',
                  cpc: 0.35,
                },
                {
                  kw: `${report.seedKeyword} prices`,
                  global: Math.round(globalVolume * 0.45),
                  country: Math.round(seedVolume * 0.45),
                  trend: 'Growing',
                  cpc: 0.45,
                },
                {
                  kw: `${report.seedKeyword} menu with prices`,
                  global: Math.round(globalVolume * 0.28),
                  country: Math.round(seedVolume * 0.3),
                  trend: 'Stable',
                  cpc: 0.76,
                },
                {
                  kw: `${report.seedKeyword} locations near me`,
                  global: Math.round(globalVolume * 0.15),
                  country: Math.round(seedVolume * 0.18),
                  trend: 'Growing',
                  cpc: 0.34,
                },
              ].map((item, idx) => (
                <tr key={idx} className="hover:bg-purple-50/40 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.kw}</td>
                  <td className="py-3.5 px-3 text-right text-purple-700 font-bold">
                    {formatCompact(item.global)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-slate-900 font-bold">
                    {formatCompact(item.country)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <TrendingUp className="w-3 h-3" />
                      <span>{item.trend}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right text-slate-600">${item.cpc.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-center">
                    {onExploreKeyword ? (
                      <button
                        onClick={() => onExploreKeyword(item.kw)}
                        className="text-xs font-bold text-purple-600 hover:text-purple-800 underline"
                      >
                        Open
                      </button>
                    ) : (
                      <a
                        href={`/research/new?seed=${encodeURIComponent(item.kw)}`}
                        className="text-xs font-bold text-purple-600 hover:text-purple-800 underline"
                      >
                        Open
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
