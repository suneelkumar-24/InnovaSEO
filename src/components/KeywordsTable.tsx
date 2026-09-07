'use client';

import React, { useState } from 'react';
import { KeywordItem, SearchIntent } from '@/lib/providers/types';
import { Search, Copy, Check, Filter, Layers, Download } from 'lucide-react';

interface KeywordsTableProps {
  items: KeywordItem[];
  clusters: { name: string; intent: SearchIntent; totalVolume: number; count: number }[];
  onExportCsv?: () => void;
}

export default function KeywordsTable({ items = [], clusters = [], onExportCsv }: KeywordsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [selectedIntent, setSelectedIntent] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const safeItems = items || [];
  const filteredItems = safeItems.filter((item) => {
    if (!item) return false;
    if (searchTerm && !item.keyword?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedCluster !== 'all' && item.cluster !== selectedCluster) {
      return false;
    }
    if (selectedIntent !== 'all' && item.intent !== selectedIntent) {
      return false;
    }
    return true;
  });

  const handleCopyKeywords = () => {
    const list = filteredItems.map((k) => k.keyword).join('\n');
    navigator.clipboard.writeText(list);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIntentStyle = (intent: string) => {
    switch (intent) {
      case 'commercial':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'transactional':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'informational':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'navigational':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Keyword Clusters Summary */}
      {clusters.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {clusters.map((cluster, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCluster(selectedCluster === cluster.name ? 'all' : cluster.name)}
              className={`p-4 rounded-2xl border text-left transition shadow-xs ${
                selectedCluster === cluster.name
                  ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-white border-slate-200 hover:border-purple-300 text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold truncate">{cluster.name}</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  selectedCluster === cluster.name ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700'
                }`}>
                  {cluster.count} KWs
                </span>
              </div>
              <p className={`text-[11px] mt-1.5 ${selectedCluster === cluster.name ? 'text-purple-100' : 'text-slate-500'}`}>
                {cluster.totalVolume.toLocaleString()} total SV • <span className="capitalize">{cluster.intent}</span>
              </p>
            </button>
          ))}
        </div>
      )}

      {/* 2. Controls & Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#faf9f6] border border-slate-300 rounded-full text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Intent filter */}
          <select
            value={selectedIntent}
            onChange={(e) => setSelectedIntent(e.target.value)}
            className="bg-[#faf9f6] border border-slate-300 rounded-xl text-xs py-2 px-3 text-slate-800 focus:outline-none font-medium"
          >
            <option value="all">All Intents</option>
            <option value="commercial">Commercial</option>
            <option value="informational">Informational</option>
            <option value="transactional">Transactional</option>
            <option value="navigational">Navigational</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyKeywords}
            className="px-4 py-2 rounded-full bg-white border border-slate-200 hover:border-purple-300 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy All'}</span>
          </button>

          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="px-4 py-2 rounded-full bg-purple-50 border border-purple-200 hover:bg-purple-100 text-xs font-bold text-purple-700 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Keyword</th>
                <th className="py-3.5 px-3 text-right">Search Volume</th>
                <th className="py-3.5 px-3 text-right">KD</th>
                <th className="py-3.5 px-3 text-right">CPC ($)</th>
                <th className="py-3.5 px-3 text-center">Intent</th>
                <th className="py-3.5 px-3">SERP Features</th>
                <th className="py-3.5 px-4 text-center">Opportunity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No keywords found matching your criteria.
                  </td>
                </tr>
              ) : filteredItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-purple-50/40 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {item.keyword}
                  </td>
                  <td className="py-3.5 px-3 text-right text-purple-700 font-bold">
                    {item.searchVolume.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                      item.kd < 25
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : item.kd < 45
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {item.kd}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right text-slate-700 font-semibold">
                    ${item.cpc.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getIntentStyle(item.intent)}`}>
                      {item.intent}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      {item.serpFeatures.slice(0, 2).map((feat, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-slate-600">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.opportunity === 'High'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.opportunity}
                    </span>
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
