'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/components/AuthProvider';
import {
  ShieldCheck,
  Users,
  Activity,
  Terminal,
  AlertOctagon,
  Trash2,
  Plus,
  CheckCircle2,
  X,
  RefreshCw,
  Clock,
  KeyRound,
  Copy,
  Search,
  Sparkles,
  ShieldAlert,
  Lock,
  Mail,
  User as UserIcon,
} from 'lucide-react';

export default function AdminPage() {
  const { user: currentUser, isAdmin, loading: authLoading } = useAuth();

  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalResearches: 0,
    totalSavedNiches: 0,
    strongOpportunities: 0,
    averageViabilityScore: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [avoidList, setAvoidList] = useState<string[]>([]);
  const [newAvoidItem, setNewAvoidItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'avoid_list'>('users');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Create User Modal State
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState<string | null>(null);

  // Success Credentials Card State (for 1-click clipboard copy)
  const [credentialsModal, setCredentialsModal] = useState<{
    name: string;
    email: string;
    password: string;
    role: string;
  } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Reset Password Modal State
  const [resetModalUser, setResetModalUser] = useState<any | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setUsers(data.users || []);
        setLogs(data.logs || []);
        setAvoidList(data.avoidList || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Helper to generate strong passwords
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'NH-';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setCreateUserError(null);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_user',
          name: newUserName.trim(),
          email: newUserEmail.trim(),
          password: newUserPassword,
          role: newUserRole,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create user');
      }

      // Store credentials to show copy modal
      setCredentialsModal({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword,
        role: newUserRole,
      });

      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setIsCreateUserOpen(false);
      fetchAdminData();
    } catch (err: any) {
      setCreateUserError(err.message);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !newResetPassword) return;
    setResettingPassword(true);
    setResetPasswordError(null);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          userId: resetModalUser.id,
          newPassword: newResetPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset password');
      }

      // Open credentials modal so admin can copy the new password
      setCredentialsModal({
        name: resetModalUser.name,
        email: resetModalUser.email,
        password: newResetPassword,
        role: resetModalUser.role,
      });

      setResetModalUser(null);
      setNewResetPassword('');
      setActionNotice(`Password reset successfully for ${resetModalUser.email}!`);
      fetchAdminData();
    } catch (err: any) {
      setResetPasswordError(err.message);
    } finally {
      setResettingPassword(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user: ${email}?`)) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_user', userId }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`User ${email} deleted.`);
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyCredentialsText = () => {
    if (!credentialsModal) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nichehunter.io';
    const text = `🚀 *Niche Hunter Workspace Access*
--------------------------------------------
🔗 *Login Portal*: ${origin}/login
📧 *Email*: ${credentialsModal.email}
🔑 *Password*: ${credentialsModal.password}
💎 *Plan*: 100% Free Early Access (Pro Unlocked)
--------------------------------------------
Welcome aboard! Please keep your login credentials secure.`;

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const handleAddAvoidItem = async () => {
    if (!newAvoidItem.trim()) return;
    const updated = [...avoidList, newAvoidItem.trim().toLowerCase()];
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_avoid_list', avoidList: updated }),
      });
      const data = await res.json();
      if (data.success) {
        setAvoidList(updated);
        setNewAvoidItem('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveAvoidItem = async (item: string) => {
    const updated = avoidList.filter((i) => i !== item);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_avoid_list', avoidList: updated }),
      });
      const data = await res.json();
      if (data.success) {
        setAvoidList(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Clear all system activity logs?')) return;
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_logs' }),
      });
      fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered users list
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return users;
    const q = userSearchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, userSearchQuery]);

  // Role Protection Check
  if (!authLoading && currentUser && !isAdmin) {
    return (
      <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen font-sans">
        <Header title="Access Restricted" />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border border-rose-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-serif font-bold text-slate-900">Administrator Access Required</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              The Admin Control Center is restricted to workspace administrators. Your current account has standard client permissions.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition"
            >
              ← Return to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen font-sans">
      <Header
        title="Admin Control Center"
        subtitle="User account provisioning, access credentials, and system management"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Admin Control', href: '/admin' },
        ]}
      />

      <main className="flex-1 p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Users</span>
            <span className="text-2xl font-serif font-bold text-slate-900 mt-1 block">{stats.totalUsers}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Researches Run</span>
            <span className="text-2xl font-serif font-bold text-purple-700 mt-1 block">{stats.totalResearches}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Saved in Vaults</span>
            <span className="text-2xl font-serif font-bold text-indigo-700 mt-1 block">{stats.totalSavedNiches}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pricing Phase</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-block mt-2">
              100% Free Early Access
            </span>
          </div>
        </div>

        {/* Global Action Notice Banner */}
        {actionNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Management ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('avoid_list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition ${
              activeTab === 'avoid_list'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Avoid Niches Blacklist ({avoidList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition ${
              activeTab === 'logs'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>System Activity Logs ({logs.length})</span>
          </button>
        </div>

        {/* Tab 1: User Management */}
        {activeTab === 'users' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm space-y-4">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-serif font-bold text-slate-900">Registered SaaS Users & Quotas</h3>
                <p className="text-xs text-slate-500">
                  Provision client accounts with email & password. Accounts have 100% Free Early Access.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setIsCreateUserOpen(true);
                    setNewUserPassword(generateStrongPassword());
                  }}
                  className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Provision New User</span>
                </button>
              </div>
            </div>

            {/* Filter Search Bar */}
            <div className="px-6 flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user by name, email, or role..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              {userSearchQuery && (
                <button
                  onClick={() => setUserSearchQuery('')}
                  className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-50 uppercase text-[10px] tracking-wider text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-5">Name & Email</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Plan Status</th>
                    <th className="py-3.5 px-4 text-center">Research Runs</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-purple-50/40 transition">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {u.name ? u.name.slice(0, 1).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-slate-500 text-xs font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          100% Free Early Access
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-purple-700">
                        {u.apiUsageCount || 0} Runs
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reset Password Button */}
                          <button
                            onClick={() => {
                              setResetModalUser(u);
                              setNewResetPassword(generateStrongPassword());
                              setResetPasswordError(null);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition"
                            title="Reset / Change Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User Button */}
                          {u.email !== 'admin@nichehunter.io' && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                        No user accounts match your search filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal 1: Provision New User */}
            {isCreateUserOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border border-slate-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="text-base font-serif font-bold text-slate-900">Provision User Account</h4>
                      <p className="text-[11px] text-slate-500">Create login credentials for a client or team member</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsCreateUserOpen(false);
                        setCreateUserError(null);
                      }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {createUserError && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                      {createUserError}
                    </div>
                  )}

                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins / Client Name"
                        className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="client@company.com"
                        className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">Assigned Password</label>
                        <button
                          type="button"
                          onClick={() => setNewUserPassword(generateStrongPassword())}
                          className="text-[11px] text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Generate Strong</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        minLength={6}
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="Assign password (min 6 characters)"
                        className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Role Permission</label>
                      <select
                        value={newUserRole}
                        onChange={(e: any) => setNewUserRole(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="user">Standard User (100% Free Pro Early Access)</option>
                        <option value="admin">Administrator (Full Access & User Control)</option>
                      </select>
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 text-[11px] text-purple-900 leading-relaxed">
                      💡 Upon creation, you will get a 1-click button to copy pre-formatted credentials ready to send to the user via WhatsApp or Email.
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreateUserOpen(false);
                          setCreateUserError(null);
                        }}
                        className="px-4 py-2 rounded-full border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={creatingUser}
                        className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-md disabled:opacity-50"
                      >
                        {creatingUser ? 'Creating...' : 'Provision Account'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal 2: Copy Credentials Card (Shown after creating user or resetting password) */}
            {credentialsModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border border-slate-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <h4 className="text-base font-serif font-bold text-slate-900">Credentials Ready to Share</h4>
                    </div>
                    <button
                      onClick={() => setCredentialsModal(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    User account is active! You can copy the credentials below to send to the client:
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs space-y-2 border border-slate-800 select-all">
                    <div>
                      <span className="text-slate-500">Portal:</span>{' '}
                      <span className="text-purple-300 font-bold">
                        {typeof window !== 'undefined' ? window.location.origin : ''}/login
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Email:</span>{' '}
                      <span className="text-emerald-300 font-bold">{credentialsModal.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Password:</span>{' '}
                      <span className="text-amber-300 font-bold">{credentialsModal.password}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Plan:</span>{' '}
                      <span className="text-slate-300">100% Free Early Access (Pro Unlocked)</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={copyCredentialsText}
                      className="w-full py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 transition"
                    >
                      <Copy className="w-4 h-4" />
                      <span>{copySuccess ? '✓ Copied to Clipboard!' : 'Copy Credentials (WhatsApp/Email)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCredentialsModal(null)}
                      className="w-full sm:w-auto px-5 py-3 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal 3: Reset Password Modal */}
            {resetModalUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border border-slate-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-purple-600" />
                      <h4 className="text-base font-serif font-bold text-slate-900">Reset User Password</h4>
                    </div>
                    <button
                      onClick={() => setResetModalUser(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <p className="font-bold text-slate-900">{resetModalUser.name}</p>
                    <p className="text-slate-500 font-mono text-[11px]">{resetModalUser.email}</p>
                  </div>

                  {resetPasswordError && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                      {resetPasswordError}
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">New Password</label>
                        <button
                          type="button"
                          onClick={() => setNewResetPassword(generateStrongPassword())}
                          className="text-[11px] text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Generate Strong</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        minLength={6}
                        value={newResetPassword}
                        onChange={(e) => setNewResetPassword(e.target.value)}
                        placeholder="Enter new password (min 6 characters)"
                        className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setResetModalUser(null)}
                        className="px-4 py-2 rounded-full border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={resettingPassword}
                        className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-md disabled:opacity-50"
                      >
                        {resettingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Avoid Niches Blacklist */}
        {activeTab === 'avoid_list' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-slate-800">
            <div>
              <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-600" />
                Restricted / Avoid Niches Blacklist
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Any research query matching these keywords is automatically flagged with an AVOID verdict and high policy risk.
              </p>
            </div>

            {/* Add Input */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Enter restricted term to blacklist (e.g. pirated games, predatory loans)..."
                value={newAvoidItem}
                onChange={(e) => setNewAvoidItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAvoidItem()}
                className="flex-1 w-full bg-[#faf9f6] border border-slate-300 rounded-full px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleAddAvoidItem}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Keyword</span>
              </button>
            </div>

            {/* Avoid Items Chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              {avoidList.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => handleRemoveAvoidItem(item)}
                    className="p-0.5 hover:text-rose-950 rounded transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: System Activity Logs */}
        {activeTab === 'logs' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-600" />
                  Real-Time Telemetry & Execution Logs
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Stream of recent background operations and API calls</p>
              </div>
              <button
                onClick={handleClearLogs}
                className="px-3.5 py-1.5 rounded-full bg-[#faf9f6] border border-slate-200 text-xs font-semibold text-slate-600 hover:text-rose-600 transition"
              >
                Clear Logs
              </button>
            </div>

            <div className="bg-[#18181b] rounded-2xl border border-slate-800 p-4 font-mono text-xs text-slate-300 space-y-2 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 py-1 border-b border-slate-800 last:border-0">
                  <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                      log.level === 'error'
                        ? 'bg-rose-500/20 text-rose-400'
                        : log.level === 'warn'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-purple-400 font-bold">[{log.module}]</span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
