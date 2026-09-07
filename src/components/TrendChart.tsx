'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { TrendPoint, RegionDemand, TrendClassification } from '@/lib/providers/types';
import { TrendingUp, Calendar, MapPin, Sparkles, Activity } from 'lucide-react';

interface TrendChartProps {
  points12m: TrendPoint[];
  currentInterest: number;
  averageInterest: number;
  minInterest: number;
  maxInterest: number;
  growthPercentage: number;
  classification: TrendClassification;
  seasonalityPattern: string;
  risingQueries: { query: string; growth: string }[];
  topRegions: RegionDemand[];
}

export default function TrendChart({
  points12m = [],
  currentInterest = 65,
  averageInterest = 60,
  minInterest = 35,
  maxInterest = 85,
  growthPercentage = 0,
  classification = 'Evergreen',
  seasonalityPattern = 'Stable seasonality with consistent interest.',
  risingQueries = [],
  topRegions = [],
}: TrendChartProps) {
  const getBadgeColor = (cls: string) => {
    switch (cls) {
      case 'Evergreen':
      case 'Growing':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Stable':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Seasonal':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Declining':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Main Trend Graph & KPI Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Google Trends 12-Month Search Interest
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${getBadgeColor(classification)}`}>
                {classification}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{seasonalityPattern}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">12M Growth</span>
              <span className={`text-base font-black ${growthPercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {growthPercentage >= 0 ? `+${growthPercentage}%` : `${growthPercentage}%`}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Interest</span>
              <span className="text-base font-black text-slate-900">{averageInterest}/100</span>
            </div>
          </div>
        </div>

        {/* Recharts Area Curve */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points12m} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="purpleTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#0f172a',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="interest"
                stroke="#7c3aed"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#purpleTrendGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 4 Stats Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-[#faf9f6] border border-slate-200 rounded-2xl p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Interest</span>
            <span className="text-xl font-bold text-purple-700 mt-0.5 block">{currentInterest}/100</span>
          </div>
          <div className="bg-[#faf9f6] border border-slate-200 rounded-2xl p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Average Interest</span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">{averageInterest}/100</span>
          </div>
          <div className="bg-[#faf9f6] border border-slate-200 rounded-2xl p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Lowest Valley</span>
            <span className="text-xl font-bold text-amber-700 mt-0.5 block">{minInterest}/100</span>
          </div>
          <div className="bg-[#faf9f6] border border-slate-200 rounded-2xl p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Peak Demand</span>
            <span className="text-xl font-bold text-indigo-700 mt-0.5 block">{maxInterest}/100</span>
          </div>
        </div>
      </div>

      {/* 2. Regional Analysis & Rising Queries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Demand Breakdown */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm text-slate-800">
          <h4 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-600" />
            Top Sub-Regions & State Demand
          </h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRegions} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                <YAxis dataKey="region" type="category" stroke="#475569" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#0f172a',
                  }}
                />
                <Bar dataKey="interest" fill="#7c3aed" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rising / Breakout Queries */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm text-slate-800">
          <h4 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Rising & Breakout Queries
          </h4>
          <div className="space-y-2.5">
            {risingQueries && risingQueries.length > 0 ? (
              risingQueries.map((rq, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#faf9f6] border border-slate-200 text-xs"
                >
                  <span className="font-semibold text-slate-800">{rq.query}</span>
                  <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-200">
                    {rq.growth}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No volatile breakouts. Query demonstrates steady evergreen search volume.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
