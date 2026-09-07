'use client';

import React, { useState } from 'react';
import { SavedNicheItem, SavedNicheStatus } from '@/lib/providers/types';
import { X, Tag, FileText, Check } from 'lucide-react';

interface NotesModalProps {
  niche: SavedNicheItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, status: SavedNicheStatus, notes: string, tags: string[]) => void;
}

export default function NotesModal({ niche, isOpen, onClose, onSave }: NotesModalProps) {
  const [status, setStatus] = useState<SavedNicheStatus>(niche.status);
  const [notes, setNotes] = useState(niche.notes || '');
  const [tagsInput, setTagsInput] = useState((niche.tags || []).join(', '));

  if (!isOpen) return null;

  const handleSave = () => {
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    onSave(niche.id, status, notes, parsedTags);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <h3 className="text-xl font-serif font-bold text-slate-900">Edit Niche Notes & Lifecycle</h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">{niche.nicheName}</p>
        </div>

        <div className="space-y-4">
          {/* Status Dropdown */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Lifecycle Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SavedNicheStatus)}
              className="w-full bg-[#faf9f6] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
            >
              <option value="researching">Researching</option>
              <option value="validated">Validated</option>
              <option value="strong_opportunity">Strong Opportunity</option>
              <option value="building">Building</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-purple-600" /> Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. affiliate, outdoors, low-dr, high-margin"
              className="w-full bg-[#faf9f6] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Custom Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" /> Research Notes & Strategy
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your execution thoughts, competitor angles, monetization ideas..."
              className="w-full bg-[#faf9f6] border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition"
          >
            <Check className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
