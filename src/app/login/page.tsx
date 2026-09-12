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

  const { user, loading: authLoading, login } = useAuth();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  React.useEffect(() => {
    if (!authLoading && user) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTarget;
      } else {
        router.replace(redirectTarget);
      }
    }
  }, [user, authLoading, router, redirectTarget]);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register / Request Access state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regReason, setRegReason] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSuccess, setPendingSuccess] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPendingSuccess(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please provide your email and password.');
      return;
    }

    setLoading(true);

    try {
      const result = await login(cleanEmail, password);
      if (!result.success) {
        setError(result.error || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      // Hard redirect to target to ensure fresh session cookies are picked up by middleware and server components
      if (typeof window !== 'undefined') {
        window.location.href = redirectTarget;
      } else {
        router.replace(redirectTarget);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPendingSuccess(null);

    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail || !regPassword || !regName.trim()) {
      setError('Full name, email, and password are required.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name: regName.trim(),
          email: cleanEmail,
          password: regPassword,
          reason: regReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit registration request.');
      }

      setPendingSuccess(
        'Your registration request has been submitted! An administrator will review and approve your account before you can log in. You will receive 50 daily credits upon approval.'
      );
      setEmail(cleanEmail);
      setTab('login');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegReason('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit request.');
    } finally {
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
          SEO & Micro-Niche Discovery Platform · 50 Daily Credits
        </p>
      </div>

      {/* Auth Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-slate-800">
        {/* Switcher Tabs: Sign In vs Request Access */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`py-2 rounded-xl transition ${
              tab === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
              setPendingSuccess(null);
            }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
              tab === 'register'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Request Access</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
          </button>
        </div>

        {/* Success Alert */}
        {pendingSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{pendingSuccess}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
              error.toLowerCase().includes('pending')
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <AlertTriangle
              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                error.toLowerCase().includes('pending') ? 'text-amber-600' : 'text-rose-600'
              }`}
            />
            <div className="space-y-1">
              <span className="font-semibold">{error}</span>
              {error.toLowerCase().includes('pending') && (
                <p className="text-[11px] text-amber-800">
                  Admin approval is required for all new accounts. Please contact your workspace administrator for approval.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: SIGN IN */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                  placeholder=""
                  className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
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
                  placeholder=""
                  className="w-full pl-10 pr-10 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: REQUEST ACCESS (Awaits Admin Approval) */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 text-[11px] text-purple-950 leading-relaxed">
              🔒 <strong>Admin-Approval Required:</strong> Once you submit, your account will be placed in the admin review queue. Upon approval, you get <strong>50 free daily credits</strong> for your research.
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder=""
                  className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder=""
                  className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Desired Password (min 6 chars)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder=""
                  className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Intended Use / Note to Admin (Optional)
              </label>
              <input
                type="text"
                value={regReason}
                onChange={(e) => setRegReason(e.target.value)}
                placeholder=""
                className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <span>Submit Request for Approval</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Daily Quota Policy Notice */}
        <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100/80 text-[11px] text-purple-900 leading-relaxed space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-purple-950">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
            <span>Daily Free Quota: 50 Credits</span>
          </p>
          <p className="text-slate-600">
            Each approved user receives 50 credits per day. Credits decrease as you actively use the platform and reset daily.
          </p>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 font-medium">
        🔒 Protected Private Intelligence Suite · All access requires authorized login
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
