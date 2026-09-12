'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertTriangle,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDevCredentials, setShowDevCredentials] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login(email.trim(), password);
    if (!result.success) {
      setError(result.error || 'Invalid email or password.');
      setLoading(false);
      return;
    }

    // Success: Redirect to target destination
    router.push(redirectTarget);
    router.refresh();
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setLoading(true);
    setError(null);

    const result = await login(quickEmail, quickPass);
    if (!result.success) {
      setError(result.error || 'Sign in failed.');
      setLoading(false);
      return;
    }

    router.push(redirectTarget);
    router.refresh();
  };

  return (
    <div className="max-w-md w-full space-y-6 relative z-10">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center justify-center group mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-700 to-indigo-700 p-0.5 shadow-xl shadow-purple-600/20 group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-purple-700 font-black text-xl">
              NH
            </div>
          </div>
        </Link>
        <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
          niche<span className="text-purple-600">hunter</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Sign in to your SEO & Micro-Niche Intelligence workspace
        </p>
      </div>

      {/* Early Access Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/70 to-purple-50 border border-purple-200/80 text-xs flex items-start gap-2.5 text-purple-900 shadow-xs">
        <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold text-purple-950">100% Free Early Access SaaS</p>
          <p className="text-[11px] text-purple-800/90 mt-0.5">
            Accounts are provisioned directly by the administrator with zero charges or credit cards required.
          </p>
        </div>
      </div>

      {/* Auth Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-slate-800">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-name@domain.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3 h-3" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 transition active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? 'Verifying Credentials...' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Provisioning Support Notice */}
        <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-slate-500 text-[11px]">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Need an account or password reset? Please contact your workspace administrator to provision your credentials.
          </p>
        </div>

        {/* 1-Click Demo Access */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              1-Click Instant Demo
            </span>
            <span className="text-[10px] text-slate-400 font-medium">No signup needed</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('admin@nichehunter.io', 'Admin@123456')}
              className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold transition shadow-sm shadow-purple-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Demo Admin</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('user@nichehunter.io', 'User@123456')}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 border border-slate-200"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Demo User</span>
            </button>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="text-xs text-slate-500 hover:text-purple-700 transition font-medium"
        >
          ← Back to Homepage
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#faf9f6] p-4 relative overflow-hidden font-sans">
      <Suspense fallback={<div className="text-xs text-slate-400">Loading portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
