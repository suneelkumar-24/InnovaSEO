'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please provide your email and password.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const result = await register(name.trim(), cleanEmail, password);
        if (!result.success) {
          setError(result.error || 'Registration failed.');
          setLoading(false);
          return;
        }
      } else {
        const result = await login(cleanEmail, password);
        if (!result.success) {
          setError(result.error || 'Invalid email or password.');
          setLoading(false);
          return;
        }
      }

      router.push(redirectTarget);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
      setLoading(false);
    }
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
          {mode === 'login'
            ? 'Sign in to your personal SEO intelligence workspace'
            : 'Create your personal workspace to discover & validate micro-niches'}
        </p>
      </div>

      {/* Auth Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-slate-800">
        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Hunter"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>
            </div>
          )}

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
                placeholder="name@example.com"
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
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••••••'}
                className="w-full pl-10 pr-10 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition disabled:opacity-50"
          >
            <span>
              {loading
                ? mode === 'register'
                  ? 'Creating Workspace...'
                  : 'Signing in...'
                : mode === 'register'
                ? 'Create Personal Workspace'
                : 'Sign In to Workspace'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Feature guarantee callout */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-slate-500 text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Each user gets a private workspace for searches, saved niches & scorecards.</span>
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
      <Suspense fallback={<div className="text-xs text-slate-400">Loading workspace...</div>}>
        <AuthForm />
      </Suspense>
    </div>
  );
}
