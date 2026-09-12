'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, ShieldCheck, ArrowRight, Lock, Mail, User as UserIcon, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isRegister ? 'register' : 'login',
          email,
          password,
          name: isRegister ? name : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: demoEmail,
          password: demoPass,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Demo login failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#faf9f6] p-4 relative overflow-hidden font-sans">
      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-700 to-indigo-700 p-0.5 shadow-xl shadow-purple-600/20 mb-2">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-purple-700 font-black text-xl">
              NH
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
            niche<span className="text-purple-600">hunter</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isRegister ? 'Create an account to start validating micro-niches' : 'Sign in to access your intelligence dashboard'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-slate-800">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Prominent Instant Demo Access Section */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50/50 to-purple-50 border-2 border-purple-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                  Instant Live Demo Mode
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-purple-200/70 text-[10px] font-bold text-purple-800">
                1-Click · No Signup
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Explore the full system instantly with pre-seeded 12-Point Checklists, live SERP vulnerability data, and DR 0-5 anomaly reports.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('admin@nichehunter.io', 'Admin@123456')}
                className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold transition shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Demo Admin</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('user@nichehunter.io', 'User@123456')}
                className="py-2.5 px-3 rounded-xl bg-white border border-purple-300 hover:bg-purple-50 active:scale-95 text-purple-800 text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs"
              >
                <UserIcon className="w-3.5 h-3.5 text-purple-600" />
                <span>Demo User</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">
              or sign in with credentials
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Hunter"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nichehunter.io"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 transition active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <Link
              href="/"
              className="text-slate-500 hover:text-purple-700 transition font-medium"
            >
              ← Back to Homepage
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-slate-500 hover:text-purple-700 transition font-medium"
            >
              {isRegister ? 'Already have an account? Sign in' : "Create an account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
