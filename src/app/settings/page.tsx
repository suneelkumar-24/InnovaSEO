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

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings?.scoringWeights) {
        setWeights(data.settings.scoringWeights);
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
      <Header title="Settings & API Management" subtitle="Configure AI keys, SEO provider connections, and SEBT-NEXT scoring weights" />

      <main className="flex-1 p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-8 font-sans">
        {/* 1. API Integrations & Key Management */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase mb-2">
                <Key className="w-3.5 h-3.5" /> Provider Connections
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-900">Connected SEO & AI Providers</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Manage backend API keys and test live connections. Keys are stored server-side with zero frontend leakage.
              </p>
            </div>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="font-semibold">{testResult.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google Gemini */}
            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-slate-200 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">Google Gemini AI</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    100% Free Tier
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Gemini 2.0 Flash / Pro (Google AI Studio)</p>
              </div>
              <button
                onClick={() => handleTestProvider('gemini')}
                disabled={testingProvider === 'gemini'}
                className="px-4 py-2 rounded-full bg-white border border-slate-300 hover:border-purple-500 text-xs font-bold text-slate-700 hover:text-purple-700 flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
              >
                {testingProvider === 'gemini' ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" /> : <Zap className="w-3.5 h-3.5 text-purple-600" />}
                <span>Test</span>
              </button>
            </div>

            {/* Groq Cloud */}
            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-slate-200 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">Groq Cloud AI</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    100% Free & Fast
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Llama 3.3 70B / Mixtral (Fastest Inference)</p>
              </div>
              <button
                onClick={() => handleTestProvider('groq')}
                disabled={testingProvider === 'groq'}
                className="px-4 py-2 rounded-full bg-white border border-slate-300 hover:border-purple-500 text-xs font-bold text-slate-700 hover:text-purple-700 flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
              >
                {testingProvider === 'groq' ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" /> : <Zap className="w-3.5 h-3.5 text-amber-600" />}
                <span>Test</span>
              </button>
            </div>

            {/* OpenRouter */}
            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-slate-200 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">OpenRouter (Free Tier)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Free Hermes 3 & OpenChat
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Nous Hermes 3, Llama 3.3 Free, OpenChat</p>
              </div>
              <button
                onClick={() => handleTestProvider('openrouter')}
                disabled={testingProvider === 'openrouter'}
                className="px-4 py-2 rounded-full bg-white border border-slate-300 hover:border-purple-500 text-xs font-bold text-slate-700 hover:text-purple-700 flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
              >
                {testingProvider === 'openrouter' ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" /> : <Zap className="w-3.5 h-3.5 text-indigo-600" />}
                <span>Test</span>
              </button>
            </div>

            {/* Local AI / Ollama / LM Studio */}
            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-slate-200 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">Local AI (Ollama / LM Studio)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    100% Offline & Private
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">http://127.0.0.1:11434 (Hermes 3, Llama 3.2)</p>
              </div>
              <button
                onClick={() => handleTestProvider('ollama')}
                disabled={testingProvider === 'ollama'}
                className="px-4 py-2 rounded-full bg-white border border-slate-300 hover:border-purple-500 text-xs font-bold text-slate-700 hover:text-purple-700 flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
              >
                {testingProvider === 'ollama' ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" /> : <Zap className="w-3.5 h-3.5 text-purple-600" />}
                <span>Test</span>
              </button>
            </div>

            {/* Anthropic Claude */}
            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-slate-200 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">Anthropic Claude</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    Optional
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Claude 3.5 Sonnet / 3.7 Engine</p>
              </div>
              <button
                onClick={() => handleTestProvider('claude')}
                disabled={testingProvider === 'claude'}
                className="px-4 py-2 rounded-full bg-white border border-slate-300 hover:border-purple-500 text-xs font-bold text-slate-700 hover:text-purple-700 flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
              >
                {testingProvider === 'claude' ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" /> : <Zap className="w-3.5 h-3.5 text-purple-600" />}
                <span>Test</span>
              </button>
            </div>

            {/* SerpApi */}
            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-slate-200 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">SerpApi (Google SERP)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Live SERP
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Live search engine results & AI Overview extraction</p>
              </div>
              <button
                onClick={() => handleTestProvider('serpapi')}
                disabled={testingProvider === 'serpapi'}
                className="px-4 py-2 rounded-full bg-white border border-slate-300 hover:border-purple-500 text-xs font-bold text-slate-700 hover:text-purple-700 flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-purple-600" />
                <span>Test</span>
              </button>
            </div>
          </div>
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
