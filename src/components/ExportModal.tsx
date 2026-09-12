'use client';

import React, { useState } from 'react';
import { NicheViabilityReport } from '@/lib/providers/types';
import { FileText, FileSpreadsheet, FileCode, Download, X, Loader2 } from 'lucide-react';

interface ExportModalProps {
  report: NicheViabilityReport;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ report, isOpen, onClose }: ExportModalProps) {
  const [exportingType, setExportingType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async (type: 'pdf' | 'excel' | 'csv' | 'json' | 'mapping') => {
    try {
      setExportingType(type);
      const { ExportEngine } = await import('@/lib/export');
      if (type === 'pdf') {
        ExportEngine.generatePdf(report);
      } else if (type === 'excel') {
        ExportEngine.generateExcel(report);
      } else if (type === 'csv') {
        ExportEngine.generateCsv(report);
      } else if (type === 'json') {
        ExportEngine.generateJson(report);
      } else if (type === 'mapping') {
        ExportEngine.generateCompetitorMappingSheet(report);
      }
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase border border-purple-200">
            <Download className="w-3.5 h-3.5" /> Export Intelligence Dossier
          </div>
          <h3 className="text-2xl font-serif font-bold text-slate-900">Download Niche Analysis</h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Export comprehensive data for {report.nicheName} in your preferred format.
          </p>
        </div>

        {/* Featured: 90-Day Competitor Keyword Mapping Sheet */}
        <button
          onClick={() => handleExport('mapping')}
          disabled={exportingType !== null}
          className="w-full p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 hover:border-amber-500 text-left transition group space-y-2 shadow-xs disabled:opacity-50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-200/80 border border-amber-300 flex items-center justify-center text-amber-800 group-hover:scale-105 transition">
                {exportingType === 'mapping' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-amber-900">
                  ⚡ 90-Day Keyword Mapping Sheet (.xlsx)
                </p>
                <p className="text-[11px] text-slate-600">
                  Fast-Mover Schedule: Day 1–Day 60 Schedule, Slugs, Primary &amp; Backup Competitors
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
              Google Sheets Ready
            </span>
          </div>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* PDF Report */}
          <button
            onClick={() => handleExport('pdf')}
            disabled={exportingType !== null}
            className="p-4 rounded-2xl bg-[#faf9f6] border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 text-left transition group space-y-2.5 shadow-xs disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 group-hover:scale-105 transition">
              {exportingType === 'pdf' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-purple-700">Executive PDF Dossier</p>
              <p className="text-[11px] text-slate-500">Styled summary report with metrics & competitor tables</p>
            </div>
          </button>

          {/* Excel Workbook */}
          <button
            onClick={() => handleExport('excel')}
            disabled={exportingType !== null}
            className="p-4 rounded-2xl bg-[#faf9f6] border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 text-left transition group space-y-2.5 shadow-xs disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition">
              {exportingType === 'excel' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-purple-700">Excel Workbook (.xlsx)</p>
              <p className="text-[11px] text-slate-500">Multi-sheet workbook: Summary, Keywords, SERP & Silos</p>
            </div>
          </button>

          {/* CSV Keywords */}
          <button
            onClick={() => handleExport('csv')}
            disabled={exportingType !== null}
            className="p-4 rounded-2xl bg-[#faf9f6] border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 text-left transition group space-y-2.5 shadow-xs disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 group-hover:scale-105 transition">
              {exportingType === 'csv' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-purple-700">Keywords CSV</p>
              <p className="text-[11px] text-slate-500">All related keywords with SV, KD, CPC & clusters</p>
            </div>
          </button>

          {/* Raw JSON */}
          <button
            onClick={() => handleExport('json')}
            disabled={exportingType !== null}
            className="p-4 rounded-2xl bg-[#faf9f6] border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 text-left transition group space-y-2.5 shadow-xs disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition">
              {exportingType === 'json' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileCode className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-purple-700">Raw JSON Payload</p>
              <p className="text-[11px] text-slate-500">Complete JSON object for custom pipeline integrations</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
