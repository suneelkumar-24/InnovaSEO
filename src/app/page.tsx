'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Layers,
  Globe,
  DollarSign,
  Store,
  Zap,
  Target,
  FileText,
  HelpCircle,
  X,
  Star,
  ExternalLink,
  ChevronRight,
  Database,
} from 'lucide-react';

const FLOATING_BUBBLES = [
  { text: 'starbucks preise', type: 'Menu & Prices', top: '14%', left: '8%', delay: '0s' },
  { text: 'tesla rim dimensions', type: 'Specs & Data', top: '8%', right: '12%', delay: '0.5s' },
  { text: 'inflatable kayak fishing', type: 'Affiliate Review', top: '24%', left: '4%', delay: '1s' },
  { text: 'popeyes nutrition', type: 'Challenger Brand', top: '22%', right: '6%', delay: '1.5s' },
  { text: 'lego weight specs', type: 'Programmatic', top: '38%', left: '10%', delay: '0.8s' },
  { text: 'fasting calculator', type: 'Micro-SaaS Tool', top: '36%', right: '10%', delay: '1.2s' },
  { text: 'notion templates for realtors', type: 'Digital Product', top: '52%', left: '5%', delay: '0.3s' },
  { text: 'arby’s calories menu', type: 'Low DR Anomaly', top: '50%', right: '5%', delay: '1.8s' },
  { text: 'solar battery sizing', type: 'Utility Tool', top: '65%', left: '9%', delay: '0.6s' },
  { text: 'custom mechanical keyboards', type: 'E-Commerce', top: '64%', right: '8%', delay: '1.4s' },
];

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [seedKeyword, setSeedKeyword] = useState('');
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'direct' | 'marketplace' | 'checklist'>('checklist');

  const handleQuickHunt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedKeyword.trim()) return;
    const clean = seedKeyword.trim();
    if (user) {
      router.push(`/research/new?seed=${encodeURIComponent(clean)}`);
    } else {
      router.push(`/login?redirect=${encodeURIComponent(`/research/new?seed=${clean}`)}`);
    }
  };

  const handleSelectBubble = (kw: string) => {
    setSeedKeyword(kw);
    if (user) {
      router.push(`/research/new?seed=${encodeURIComponent(kw)}`);
    } else {
      router.push(`/login?redirect=${encodeURIComponent(`/research/new?seed=${kw}`)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-800 font-sans relative overflow-x-hidden selection:bg-purple-500 selection:text-white">
      {/* 1. TOP NOTIFICATION BAR */}
      <div className="bg-[#18181b] text-slate-300 text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-slate-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>🚀 100% Free Early Access Beta — 50 Free Daily Credits with zero charges.</span>
        <button
          onClick={() => setShowPricingModal(true)}
          className="text-purple-400 hover:text-purple-300 font-bold underline ml-1"
        >
          Early Access Details →
        </button>
      </div>

      {/* 2. NAVIGATION BAR */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between sticky top-0 bg-[#faf9f6]/90 backdrop-blur-md z-30">
        <div className="flex items-center gap-8">
          {/* Stylized Monogram Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-black text-lg shadow-md shadow-purple-600/30 group-hover:scale-105 transition">
              NH
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              niche<span className="text-purple-600">hunter</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link href="/dashboard" className="hover:text-purple-600 transition">
              Dashboard
            </Link>
            <Link href="/research/new" className="hover:text-purple-600 transition">
              Hunter Studio
            </Link>
            <Link href="/saved" className="hover:text-purple-600 transition">
              Saved Vault
            </Link>
            <Link href="/compare" className="hover:text-purple-600 transition">
              Compare Niches
            </Link>
            <button
              onClick={() => setShowPricingModal(true)}
              className="px-2.5 py-1 rounded-lg border border-dashed border-emerald-500/60 text-emerald-700 font-bold hover:bg-emerald-50 transition"
            >
              100% Free Beta
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs font-semibold text-slate-700">
                Hi, <strong className="text-purple-700">{user.name}</strong>
              </span>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5"
              >
                Go to Dashboard →
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs font-bold text-slate-700 hover:text-purple-600 px-3 py-2 transition hidden sm:inline-block"
              >
                Log in
              </Link>
              <Link
                href="/login?tab=register"
                className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5"
              >
                Request Access →
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* 3. HERO SECTION WITH FLOATING INTERACTIVE BUBBLES (Screenshot 2 Style) */}
      <section className="relative pt-12 pb-24 px-6 text-center max-w-5xl mx-auto min-h-[580px] flex flex-col items-center justify-center">
        {/* Floating Keyword Pills in Background */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          {FLOATING_BUBBLES.map((bubble, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectBubble(bubble.text)}
              style={{
                top: bubble.top,
                left: bubble.left,
                right: bubble.right,
              }}
              className="pointer-events-auto absolute px-4 py-2 rounded-full bg-white/90 border border-slate-200/80 shadow-md hover:shadow-xl hover:border-purple-400 hover:scale-110 text-xs font-medium text-slate-700 hover:text-purple-700 transition duration-300 backdrop-blur-sm group"
            >
              <span>{bubble.text}</span>
            </button>
          ))}
        </div>

        {/* Hero Tag */}
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-purple-600" />
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
            SEO & MICRO-NICHE TOOLKIT
          </span>
        </div>

        {/* Stylized Logo Monogram */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-serif font-black text-3xl shadow-xl shadow-purple-600/20 mb-6">
          R:
        </div>

        {/* Hero Title with Purple Dashed Outline Highlight */}
        <h1 className="text-4xl sm:text-6xl font-serif font-bold text-slate-900 tracking-tight max-w-3xl leading-[1.15]">
          <span className="inline-block border-2 border-dashed border-purple-500 rounded-3xl px-6 py-1.5 text-slate-900 bg-purple-50/40">
            Find what's ranking
          </span>
        </h1>

        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto mt-6 leading-relaxed">
          Research the keywords, weak competitors (<span className="font-bold text-purple-700">DR &lt; 20</span>), and
          monetization blueprints behind top-ranking micro-niche sites — real signals from live SERPs, in one toolkit.
        </p>

        {/* Hero CTA & Quick Search */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
          <form onSubmit={handleQuickHunt} className="w-full relative flex items-center">
            <input
              type="text"
              value={seedKeyword}
              onChange={(e) => setSeedKeyword(e.target.value)}
              placeholder="e.g. starbucks preise, tesla rim size..."
              className="w-full pl-5 pr-32 py-3.5 bg-white border border-slate-300 focus:border-purple-600 rounded-full shadow-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-100 font-medium"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-md"
            >
              Start free
            </button>
          </form>
        </div>

        <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
          <span>Try the keyword tool ↓ or paste a Flippa listing</span>
        </p>
      </section>

      {/* 4. EVERYTHING YOU NEED TO RANK HIGHER (6-Feature Grid - Screenshot 3 Style) */}
      <section className="py-20 px-6 max-w-6xl mx-auto border-t border-slate-200/80">
        <div className="text-left mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-purple-600">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            FEATURES
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
            Everything you need to find & validate untapped niches.
          </h2>
          <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
            From keyword research to competitor vulnerability tracking, Niche Hunter is your complete pre-process analytics toolkit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 01 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-purple-300 transition duration-300 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono font-bold text-purple-600 block">01</span>
            <h3 className="text-lg font-bold text-slate-900">Keyword & Seed Mining</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Find low-competition keywords worth targeting. Every figure is measured live from Google SERP APIs with Tier 1 volume thresholds.
            </p>
          </div>

          {/* Feature 02 */}
          <div className="bg-white rounded-3xl p-8 border-2 border-purple-500/40 shadow-lg shadow-purple-500/5 hover:shadow-xl transition duration-300 space-y-4 relative">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono font-bold text-purple-600 block">02</span>
            <h3 className="text-lg font-bold text-slate-900">70% Dedicated Site Audit</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              See the true count of dedicated apex sites vs generic multi-topic portals ranking in Google Top 10 to spot unbeatable authority gaps.
            </p>
          </div>

          {/* Feature 03 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-purple-300 transition duration-300 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono font-bold text-purple-600 block">03</span>
            <h3 className="text-lg font-bold text-slate-900">12-Point Master Checklist</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated 12-benchmark scorecard (DR &lt; 20 count, target low-DR winner, domain age &lt; 2 yrs, traffic proof, zero AI overview).
            </p>
          </div>

          {/* Feature 04 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-purple-300 transition duration-300 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono font-bold text-purple-600 block">04</span>
            <h3 className="text-lg font-bold text-slate-900">Flippa Reverse Engineering</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Reverse-engineer sold marketplace listings, extract their core seed formulas, and scale programmatically across 10+ Tier 1 countries.
            </p>
          </div>

          {/* Feature 05 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-purple-300 transition duration-300 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono font-bold text-purple-600 block">05</span>
            <h3 className="text-lg font-bold text-slate-900">Challenger Brands & DR 0-5</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Snipe low DR (0-5) ranking anomalies across secondary challenger brands (e.g. Popeyes, Arby's, Little Caesars) before saturated giants.
            </p>
          </div>

          {/* Feature 06 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-purple-300 transition duration-300 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono font-bold text-purple-600 block">06</span>
            <h3 className="text-lg font-bold text-slate-900">Zero-AI Overview Immunity</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bulletproof CTR preservation models for raw tables, dimensions, specifications, menu prices, and interactive calculators.
            </p>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE APP SHOWCASE / EXTENSION (Screenshot 5 Style in Royal Purple) */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 rounded-[2.5rem] p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-purple-200">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-300" />
                PRE-PROCESS SUITE
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif font-bold leading-tight">
                Niche research, right where you build
              </h2>

              <ul className="space-y-3 text-xs text-purple-100">
                <li className="flex items-center gap-2">
                  <span className="text-purple-300 font-bold">&gt;</span>
                  <span><strong>Seed keyword research:</strong> Search volume, competition & DR &lt; 20 count.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-300 font-bold">&gt;</span>
                  <span><strong>12-Point Checklist:</strong> Instant copyable scorecard for all niches.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-300 font-bold">&gt;</span>
                  <span><strong>Flippa Listing Analytics:</strong> Estimated profit, traffic, and 35x exit valuation.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-300 font-bold">&gt;</span>
                  <span><strong>Tier 1 Revenue Models:</strong> Dynamic $30–$52 RPM estimates for Rank #1–#3.</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  href={user ? "/research/new" : "/login?redirect=/research/new"}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-purple-900 font-bold text-xs shadow-xl hover:bg-purple-50 transition transform hover:-translate-y-0.5"
                >
                  <Target className="w-4 h-4 text-purple-600" />
                  <span>Launch Hunter Studio</span>
                </Link>
              </div>
            </div>

            {/* Right Interactive Mock Dashboard (Screenshot 5 Style) */}
            <div className="lg:col-span-7 bg-[#1e1b4b]/80 border border-purple-400/30 rounded-3xl p-6 backdrop-blur shadow-2xl space-y-4">
              {/* Tab Selector inside mock */}
              <div className="flex items-center justify-between pb-3 border-b border-purple-400/20">
                <div className="flex items-center gap-2 bg-purple-950/80 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveShowcaseTab('checklist')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      activeShowcaseTab === 'checklist'
                        ? 'bg-purple-600 text-white'
                        : 'text-purple-300 hover:text-white'
                    }`}
                  >
                    12-Point Checklist
                  </button>
                  <button
                    onClick={() => setActiveShowcaseTab('marketplace')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      activeShowcaseTab === 'marketplace'
                        ? 'bg-purple-600 text-white'
                        : 'text-purple-300 hover:text-white'
                    }`}
                  >
                    Flippa Parser
                  </button>
                  <button
                    onClick={() => setActiveShowcaseTab('direct')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      activeShowcaseTab === 'direct'
                        ? 'bg-purple-600 text-white'
                        : 'text-purple-300 hover:text-white'
                    }`}
                  >
                    Tier-1 Revenue
                  </button>
                </div>

                <span className="text-[10px] text-purple-300 font-mono bg-purple-900/60 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                  Live on every niche
                </span>
              </div>

              {/* Showcase Content */}
              {activeShowcaseTab === 'checklist' && (
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-purple-950/60 p-2.5 rounded-xl border border-purple-400/20">
                      <span className="text-[10px] text-purple-300 uppercase block">1. Seed Keyword</span>
                      <strong className="text-white text-xs font-mono">Starbucks Preise</strong>
                    </div>
                    <div className="bg-purple-950/60 p-2.5 rounded-xl border border-purple-400/20">
                      <span className="text-[10px] text-purple-300 uppercase block">3. Famous In</span>
                      <strong className="text-emerald-400 text-xs">Germany (Tier 1 Priority)</strong>
                    </div>
                    <div className="bg-purple-950/60 p-2.5 rounded-xl border border-purple-400/20">
                      <span className="text-[10px] text-purple-300 uppercase block">5. &lt;20 DR Sites in Top 10</span>
                      <strong className="text-emerald-400 text-xs">4 Beatable Sites</strong>
                    </div>
                    <div className="bg-purple-950/60 p-2.5 rounded-xl border border-purple-400/20">
                      <span className="text-[10px] text-purple-300 uppercase block">6. AI Overview</span>
                      <strong className="text-emerald-400 text-xs">NO (Zero-Click Immune)</strong>
                    </div>
                    <div className="bg-purple-950/60 p-2.5 rounded-xl border border-purple-400/20">
                      <span className="text-[10px] text-purple-300 uppercase block">7. Target Low-DR Winner</span>
                      <strong className="text-cyan-300 text-xs font-mono">kaffeepreise-de.com (DR 6)</strong>
                    </div>
                    <div className="bg-purple-950/60 p-2.5 rounded-xl border border-purple-400/20">
                      <span className="text-[10px] text-purple-300 uppercase block">11. Winner Traffic</span>
                      <strong className="text-white text-xs">48,200 visits/mo</strong>
                    </div>
                  </div>
                </div>
              )}

              {activeShowcaseTab === 'marketplace' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-purple-950/70 rounded-xl border border-purple-400/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-purple-300 uppercase block">Marketplace Listing</span>
                      <span className="font-bold text-white">starbuckspreise.de (Flippa Sold)</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      $1,450/mo profit · $50,750 exit value
                    </span>
                  </div>
                  <div className="p-2.5 bg-purple-900/40 rounded-xl text-purple-200 text-[11px] leading-relaxed">
                    <strong>Formula Identified:</strong> <code className="text-amber-300 font-mono">[Brand] + prices / preise</code> — Expandable across 10+ Tier 1 countries.
                  </div>
                </div>
              )}

              {activeShowcaseTab === 'direct' && (
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-400/20">
                    <span className="text-[10px] text-purple-300 uppercase block">Rank #1</span>
                    <span className="text-lg font-bold text-emerald-400 block">$780/mo</span>
                    <span className="text-[9px] text-purple-300">32% CTR</span>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-400/20">
                    <span className="text-[10px] text-purple-300 uppercase block">Rank #2</span>
                    <span className="text-lg font-bold text-teal-300 block">$535/mo</span>
                    <span className="text-[9px] text-purple-300">22% CTR</span>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-400/20">
                    <span className="text-[10px] text-purple-300 uppercase block">Rank #3</span>
                    <span className="text-lg font-bold text-cyan-300 block">$390/mo</span>
                    <span className="text-[9px] text-purple-300">16% CTR</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. REAL DATA REVIEWS CARDS (Screenshot 6 Style in Purple Palette) */}
      <section className="py-20 px-6 max-w-6xl mx-auto border-t border-slate-200/80">
        <div className="text-left mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-purple-600">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            REVIEWS
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
            Real data niche hunters actually trust
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Navy/Dark Slate */}
          <div className="bg-[#1e1b4b] text-white p-6 rounded-3xl flex flex-col justify-between space-y-4 shadow-md">
            <div className="space-y-2">
              <div className="flex items-center text-amber-400 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs leading-relaxed text-purple-100">
                “Finally an SEO tool that shows actual weak competitors (DR &lt; 20) — not made-up guesses. I trust the numbers.”
              </p>
            </div>
            <span className="text-[10px] text-purple-300 font-bold block">Maya R. · Niche Builder</span>
          </div>

          {/* Card 2: 100% Real Data Vibrant Purple */}
          <div className="bg-purple-600 text-white p-6 rounded-3xl flex flex-col justify-between space-y-4 shadow-lg shadow-purple-600/20">
            <div>
              <span className="text-3xl font-black block">100%</span>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200">Real Data</span>
            </div>
            <p className="text-[11px] text-purple-100 leading-relaxed">
              Every metric is measured live from Google SERPs & Moz APIs. If it isn’t available, you see a dash — never an invented number.
            </p>
          </div>

          {/* Card 3: Soft Lilac */}
          <div className="bg-purple-100 text-slate-900 p-6 rounded-3xl flex flex-col justify-between space-y-4 shadow-sm border border-purple-200">
            <div className="space-y-2">
              <div className="flex items-center text-amber-500 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs leading-relaxed text-slate-700">
                “The 12-point checklist and Flippa reverse-engineering helped me pick 3 profitable micro-niches I would have skipped.”
              </p>
            </div>
            <span className="text-[10px] text-purple-800 font-bold block">Daniel K. · Programmatic SEO</span>
          </div>

          {/* Card 4: 15 Phases Green/Teal */}
          <div className="bg-[#064e3b] text-white p-6 rounded-3xl flex flex-col justify-between space-y-4 shadow-md">
            <div>
              <span className="text-3xl font-black block">15</span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Validation Phases</span>
            </div>
            <p className="text-[11px] text-emerald-100 leading-relaxed">
              Keywords, competitors, trends, 70% dedicated site audit, and AI overview immunity — all in one pre-process suite.
            </p>
          </div>

          {/* Card 5: Indigo/Violet */}
          <div className="bg-indigo-900 text-white p-6 rounded-3xl flex flex-col justify-between space-y-4 shadow-md">
            <div className="space-y-2">
              <div className="flex items-center text-amber-400 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs leading-relaxed text-indigo-100">
                “The Tier-1 search volume rule ($30+ RPM) with zero AI overview immunity is a game changer. Built a $500/mo asset fast.”
              </p>
            </div>
            <span className="text-[10px] text-indigo-300 font-bold block">Priya S. · Digital Creator</span>
          </div>
        </div>
      </section>

      {/* 7. EARLY ACCESS STATUS (100% Free Beta Phase) */}
      <section className="py-20 px-6 max-w-6xl mx-auto border-t border-slate-200/80">
        <div className="text-center mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            100% FREE EARLY ACCESS BETA
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
            Full Pro Suite Unlocked — Zero Charges.
          </h2>
          <p className="text-slate-600 text-sm max-w-lg mx-auto">
            Currently in Private Early Access with zero fees. Admin directly provisions user accounts with email and password.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Feature 1: Core Research */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-xs font-bold uppercase text-purple-700">12-POINT CHECKLIST HUB</span>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900">$0</span>
                <span className="text-xs text-slate-500 font-bold"> / Free Early Access</span>
              </div>
              <p className="text-xs text-slate-600">Complete multi-signal viability scoring and master benchmarks.</p>
              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">✓ Full 15-Phase Research Engine</li>
                <li className="flex items-center gap-2">✓ 12-Point Master Checklist & Export</li>
                <li className="flex items-center gap-2">✓ Dedicated Site 70% Rule Detector</li>
              </ul>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-purple-700 text-white font-bold text-xs transition"
            >
              Sign In to Workspace →
            </button>
          </div>

          {/* Feature 2: Pro Suite (Highlighted) */}
          <div className="bg-[#18181b] text-white rounded-3xl p-6 border-2 border-purple-500 shadow-2xl flex flex-col justify-between space-y-6 relative transform md:-translate-y-2">
            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider">
              ALL UNLOCKED
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold uppercase text-emerald-400">PRO INTELLIGENCE SUITE</span>
              </div>
              <div>
                <span className="text-3xl font-black text-white">$0</span>
                <span className="text-xs text-slate-400 font-bold"> / All Features Free</span>
              </div>
              <p className="text-xs text-slate-300">Live SERP audits, DR 0-5 anomalies, and monetization blueprints.</p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">✓ DR 0-5 / 0-20 SERP Anomalies Hunter</li>
                <li className="flex items-center gap-2">✓ Flippa & Empire Flippers Reverse Blueprints</li>
                <li className="flex items-center gap-2">✓ Zero AI Overview Detector & RPM Models</li>
                <li className="flex items-center gap-2">✓ Programmatic DB & Silo Roadmap Builder</li>
              </ul>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition"
            >
              Access Pro Workspace →
            </button>
          </div>

          {/* Feature 3: Provisioned User Accounts */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-xs font-bold uppercase text-indigo-700">ADMIN-PROVISIONED SEATS</span>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900">Custom</span>
                <span className="text-xs text-slate-500"> / Admin Managed</span>
              </div>
              <p className="text-xs text-slate-600">Admin provisions unique login credentials for clients & team members.</p>
              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">✓ Admin assigns email & password</li>
                <li className="flex items-center gap-2">✓ 1-Click credentials sharing</li>
                <li className="flex items-center gap-2">✓ Password reset & quota tracking</li>
              </ul>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition"
            >
              Client Login Portal →
            </button>
          </div>
        </div>
      </section>

      {/* 8. MODAL FOR 100% FREE EARLY ACCESS STATUS */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPricingModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
              100% FREE EARLY ACCESS
            </span>

            <div>
              <h3 className="text-xl font-serif font-bold text-slate-900">
                All Pro Features Unlocked ($0)
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Niche Hunter is currently in private early access. Zero subscription fees, zero charges, and no credit card required. All 12-point checklists, live SERP vulnerability audits, and blueprints are completely unlocked.
              </p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-left space-y-2 text-xs text-emerald-950">
              <p className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero charges · No credit card required</span>
              </p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Accounts are provisioned directly by the workspace administrator with email and password. Contact your administrator to receive your login credentials.
              </p>
            </div>

            <button
              onClick={() => {
                setShowPricingModal(false);
                router.push('/login');
              }}
              className="w-full py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition"
            >
              Go to Workspace Login →
            </button>
          </div>
        </div>
      )}

      {/* 9. DARK MODERN FOOTER (Screenshot 8 Style) */}
      <footer className="bg-[#18181b] text-slate-400 text-xs pt-16 pb-12 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-base">
                NH
              </div>
              <span className="font-bold text-base text-white">nichehunter</span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              Data-driven micro-niche discovery and SERP vulnerability intelligence for serious SEO publishers. Grow smarter, not harder.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
              <span>💬 Direct Support Available</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-white uppercase tracking-wider block mb-3">NICHE TOOLS</span>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/research/new" className="hover:text-purple-400">Seed Keyword Tool</Link></li>
              <li><Link href="/research/new?mode=marketplace" className="hover:text-purple-400">Flippa Reverse Engineer</Link></li>
              <li><Link href="/dashboard" className="hover:text-purple-400">12-Point Checklist</Link></li>
              <li><Link href="/compare" className="hover:text-purple-400">Niche Comparison</Link></li>
            </ul>
          </div>

          <div>
            <span className="text-[11px] font-bold text-white uppercase tracking-wider block mb-3">PRE-PROCESS SUITE</span>
            <ul className="space-y-2 text-slate-400">
              <li><span className="hover:text-purple-400">70% Dedicated Site Audit</span></li>
              <li><span className="hover:text-purple-400">Zero AI Overview Detector</span></li>
              <li><span className="hover:text-purple-400">Tier-1 RPM Projections</span></li>
              <li><span className="hover:text-purple-400">Available .com Ideas</span></li>
            </ul>
          </div>

          <div>
            <span className="text-[11px] font-bold text-white uppercase tracking-wider block mb-3">FUTURE MODULES</span>
            <ul className="space-y-2 text-slate-400">
              <li><span className="text-slate-500">Module 2: Website Builder</span></li>
              <li><span className="text-slate-500">Module 3: Content Writer</span></li>
              <li><span className="text-slate-500">Module 4: SEO Automator</span></li>
              <li><span className="text-slate-500">Programmatic Tables</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <span>© 2026 Niche Hunter Suite. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-400">Privacy</Link>
            <Link href="/" className="hover:text-slate-400">Terms</Link>
            <Link href="/" className="hover:text-slate-400">Methodology</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
