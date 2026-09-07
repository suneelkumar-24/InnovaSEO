'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Search, Sparkles, Shield, Bell, HelpCircle } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function Header({ title, subtitle, children }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-200/90 bg-white/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-4">
        <div>
          {title && <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{title}</h1>}
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {children}

        <Link
          href="/research/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Research</span>
        </Link>
      </div>
    </header>
  );
}
