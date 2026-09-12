'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { ScoringWeights } from '@/lib/providers/types';
import {
  Settings,
  Key,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Save,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function SettingsPage() {
  const [weights, setWeights] = useState<ScoringWeights>({
    demand: 15,
    searchVolume: 10,
    trend: 10,
    serpWeakness: 15,
    competition: 10,
    intentOpportunity: 10,
    dedicatedPage: 10,
    monetization: 10,
    scalability: 5,
    aiOverviewCtr: 5,
  });

  const [loading, setLoading] = useState(true);
  const [savingWeights, setSavingWeights] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [savingKeys, setSavingKeys] = useState(false);
  const [keysSavedSuccess, setKeysSavedSuccess] = useState(false);
  const [defaultProvider, setDefaultProvider] = useState<string>('auto');
  const [apiKeys, setApiKeys] = useState({
    anthropic: '',
    gemini: '',
    groq: '',
    openrouter: '',
    serpapi: '',
    moz: '',
    openpagerank: '',
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        if (data.settings?.scoringWeights) {
          setWeights(data.settings.scoringWeights);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveApiKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingKeys(true);
    setKeysSavedSuccess(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_api_keys',
          keys: apiKeys,
          defaultProvider,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setKeysSavedSuccess(true);
        setTimeout(() => setKeysSavedSuccess(false), 3500);
      } else {
        alert(data.error || 'Failed to update API keys.');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingKeys(false);
    }
  };

  const handleSaveWeights = async () => {
    setSavingWeights(true);
    setSavedSuccess(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_weights', weights }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingWeights(false);
    }
  };

  const handleTestProvider = async (provider: string) => {
    setTestingProvider(provider);
    setTestResult(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_provider', provider }),
      });
      const data = await res.json();
      setTestResult({
        provider,
        success: data.success,
        message: data.success ? data.message : data.error || 'Connection failed',
      });
    } catch (e: any) {
      setTestResult({
        provider,
        success: false,
        message: e.message || 'Connection failed',
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + Number(b), 0);

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen">
      <Header
        title="Settings & API Management"
        subtitle="Configure AI keys, SEO provider connections, and SEBT-NEXT scoring weights"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Settings & APIs', href: '/settings' },
        ]}
      />

      <main className="flex-1 p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-8 font-sans">
        {/* 1. API Integrations & Key Management */}
        <section className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-xs font-black uppercase mb-2">
                <Key className="w-3.5 h-3.5" /> Provider Connections & API Keys
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-900">Configure AI & SEO Data Providers</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Connect your Anthropic Claude, Google Gemini, Groq, OpenRouter, and SerpApi keys. Keys are stored server-side for accurate low-competition niche discovery.
              </p>
            </div>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-2xl border-2 text-sm flex items-center gap-3 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                  : 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {keysSavedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>API Configuration updated & active in live engine!</span>
            </div>
          )}

          {/* Primary AI Engine Selector */}
          <div className="p-5 rounded-2xl bg-[#faf9f6] border-2 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-bold text-slate-900 text-sm block">Primary AI Discovery Engine</span>
              <span className="text-xs text-slate-500">Choose which AI handles search intent gap analysis & monetization blueprints</span>
            </div>
            <select
              value={defaultProvider}
              onChange={(e) => setDefaultProvider(e.target.value)}
              className="bg-white border-2 border-slate-300 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600 cursor-pointer shadow-xs"
            >
              <option value="auto">Auto Waterfall (Gemini / Groq / OpenRouter)</option>
              <option value="claude">Anthropic Claude (claude-3-5-sonnet)</option>
              <option value="gemini">Google Gemini (gemini-2.0-flash)</option>
              <option value="groq">Groq Cloud (llama-3.3-70b)</option>
              <option value="openrouter">OpenRouter (Multi-Model Consensus)</option>
            </select>
          </div>

          <form onSubmit={handleSaveApiKeys} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Anthropic Claude */}
              <div className="p-5 rounded-2xl bg-[#faf9f6] border-2 border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Anthropic Claude</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      Elite Reasoning
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTestProvider('claude')}
                    disabled={testingProvider === 'claude'}
                    className="px-3 py-1.5 rounded-full bg-white border border-slate-300 hover:border-purple-500 text-xs font-bold text-slate-700 hover:text-purple-700 flex items-center gap-1 transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {testingProvider === 'claude' ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" /> : <Zap className="w-3.5 h-3.5 text-purple-600" />}
                    <span>Test</span>
                  </button>
                </div>
                <input
                  type="password"
                  value={apiKeys.anthropic}
                  onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
                  placeholder="sk-ant-api03-xxxx... (Anthropic Claude API Key)"
                  className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600 shadow-xs"
                />
              </div>

              {/* Google Gemini */}
              <div className="p-5 rounded-2xl bg-[#faf9f6] border-2 border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Google Gemini AI</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      Free Tier
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTestProvider('gemini')}
                    disabled={testingProvider === 'gemini'}
                    className="px-3 py-1.5 rounded-full bg-white border border-slate-300 hover:border-purple-500 text-xs font-bold text-slate-700 hover:text-purple-700 flex items-center gap-1 transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {testingProvider === 'gemini' ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" /> : <Zap className="w-3.5 h-3.5 text-purple-600" />}
                    <span>Test</span>
                  </button>
                </div>
                <input
                  type="password"
                  value={apiKeys.gemini}
                  onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                  placeholder="AIzaSy... (Google AI Studio Gemini Key)"
                  className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600 shadow-xs"
                />
              </div>

              {/* Groq Cloud */}
              <div className="p-5 rounded-2xl bg-[#faf9f6] border-2 border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Groq Cloud AI</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Fastest
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTestProvider('groq')}
                    disabled={testingProvider === 'groq'}
                    className="px-3 py-1.5 rounded-full bg-white border border-slate-300 hover:border-purple-500 text-xs font-bold text-slate-700 hover:text-purple-700 flex items-center gap-1 transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {testingProvider === 'groq' ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" /> : <Zap className="w-3.5 h-3.5 text-amber-600" />}
                    <span>Test</span>
                  </button>
                </div>
                <input
                  type="password"
                  value={apiKeys.groq}
                  onChange={(e) => setApiKeys({ ...apiKeys, groq: e.target.value })}
                  placeholder="gsk_... (Groq Free Cloud API Key)"
                  className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600 shadow-xs"
                />
              </div>

              {/* OpenRouter */}
              <div className="p-5 rounded-2xl bg-[#faf9f6] border-2 border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">OpenRouter AI</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Open Source
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTestProvider('openrouter')}
                    disabled={testingProvider === 'openrouter'}
                    className="px-3 py-1.5 rounded-full bg-white border border-slate-300 hover:border-purple-500 text-xs font-bold text-slate-700 hover:text-purple-700 flex items-center gap-1 transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {testingProvider === 'openrouter' ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" /> : <Zap className="w-3.5 h-3.5 text-indigo-600" />}
                    <span>Test</span>
                  </button>
                </div>
                <input
                  type="password"
                  value={apiKeys.openrouter}
                  onChange={(e) => setApiKeys({ ...apiKeys, openrouter: e.target.value })}
                  placeholder="sk-or-... (OpenRouter API Key)"
                  className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600 shadow-xs"
                />
              </div>

              {/* SerpApi */}
              <div className="p-5 rounded-2xl bg-[#faf9f6] border-2 border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">SerpApi (Live Google Index)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Live SERP
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTestProvider('serpapi')}
                    disabled={testingProvider === 'serpapi'}
                    className="px-3 py-1.5 rounded-full bg-white border border-slate-300 hover:border-purple-500 text-xs font-bold text-slate-700 hover:text-purple-700 flex items-center gap-1 transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-purple-600" />
                    <span>Test</span>
                  </button>
                </div>
                <input
                  type="password"
                  value={apiKeys.serpapi}
                  onChange={(e) => setApiKeys({ ...apiKeys, serpapi: e.target.value })}
                  placeholder="SerpApi Private Key for live Google results"
                  className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600 shadow-xs"
                />
              </div>

              {/* Moz / OpenPageRank */}
              <div className="p-5 rounded-2xl bg-[#faf9f6] border-2 border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Moz / OpenPageRank</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      Authority (DA/DR)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTestProvider('moz')}
                    disabled={testingProvider === 'moz'}
                    className="px-3 py-1.5 rounded-full bg-white border border-slate-300 hover:border-purple-500 text-xs font-bold text-slate-700 hover:text-purple-700 flex items-center gap-1 transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-purple-600" />
                    <span>Test</span>
                  </button>
                </div>
                <input
                  type="password"
                  value={apiKeys.moz}
                  onChange={(e) => setApiKeys({ ...apiKeys, moz: e.target.value })}
                  placeholder="Moz Access ID / API Key"
                  className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600 shadow-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingKeys}
                className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingKeys ? 'Saving API Keys...' : 'Save & Activate All API Keys'}</span>
              </button>
            </div>
          </form>
        </section>

        {/* 2. Configurable SEBT-NEXT Scoring Weights */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase mb-2">
                <Sliders className="w-3.5 h-3.5" /> Viability Formula Weights
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-900">Custom SEBT-NEXT Scoring Weights</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Adjust factor weightings to align the viability engine with your business priorities.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Weight</span>
                <span className={`text-base font-black ${totalWeight === 100 ? 'text-purple-700' : 'text-amber-600'}`}>
                  {totalWeight}%
                </span>
              </div>
              <button
                onClick={handleSaveWeights}
                disabled={savingWeights}
                className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-600/20 transition active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingWeights ? 'Saving...' : 'Save Weights'}</span>
              </button>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Scoring weights updated successfully. Future research runs will use this configuration.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Demand */}
            <div className="space-y-2 bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Search Demand Adequacy</span>
                <span className="font-bold text-purple-700">{weights.demand}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={weights.demand}
                onChange={(e) => setWeights({ ...weights, demand: Number(e.target.value) })}
                className="w-full accent-purple-600"
              />
            </div>

            {/* SERP Weakness */}
            <div className="space-y-2 bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">SERP Weakness (Beatable Competitors)</span>
                <span className="font-bold text-purple-700">{weights.serpWeakness}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={weights.serpWeakness}
                onChange={(e) => setWeights({ ...weights, serpWeakness: Number(e.target.value) })}
                className="w-full accent-purple-600"
              />
            </div>

            {/* Search Volume */}
            <div className="space-y-2 bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Search Volume Fit</span>
                <span className="font-bold text-indigo-700">{weights.searchVolume}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={weights.searchVolume}
                onChange={(e) => setWeights({ ...weights, searchVolume: Number(e.target.value) })}
                className="w-full accent-purple-600"
              />
            </div>

            {/* Trend Stability */}
            <div className="space-y-2 bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Google Trends & Seasonality</span>
                <span className="font-bold text-indigo-700">{weights.trend}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={weights.trend}
                onChange={(e) => setWeights({ ...weights, trend: Number(e.target.value) })}
                className="w-full accent-purple-600"
              />
            </div>

            {/* Competition DR/RD */}
            <div className="space-y-2 bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Competition & Median DR/RD</span>
                <span className="font-bold text-purple-700">{weights.competition}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={weights.competition}
                onChange={(e) => setWeights({ ...weights, competition: Number(e.target.value) })}
                className="w-full accent-purple-600"
              />
            </div>

            {/* Intent Gap */}
            <div className="space-y-2 bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Search Intent Mismatch Opportunity</span>
                <span className="font-bold text-purple-700">{weights.intentOpportunity}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={weights.intentOpportunity}
                onChange={(e) => setWeights({ ...weights, intentOpportunity: Number(e.target.value) })}
                className="w-full accent-purple-600"
              />
            </div>

            {/* Dedicated Page Opportunity */}
            <div className="space-y-2 bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Dedicated Page Opportunity</span>
                <span className="font-bold text-purple-700">{weights.dedicatedPage}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={weights.dedicatedPage}
                onChange={(e) => setWeights({ ...weights, dedicatedPage: Number(e.target.value) })}
                className="w-full accent-purple-600"
              />
            </div>

            {/* Monetization */}
            <div className="space-y-2 bg-[#faf9f6] p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Monetization Potential</span>
                <span className="font-bold text-amber-700">{weights.monetization}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={weights.monetization}
                onChange={(e) => setWeights({ ...weights, monetization: Number(e.target.value) })}
                className="w-full accent-purple-600"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
