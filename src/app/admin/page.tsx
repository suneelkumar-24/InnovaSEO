'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
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
} from 'lucide-react';

export default function AdminPage() {
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

  // Create User Modal State
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState<string | null>(null);
  const [createdUserNotice, setCreatedUserNotice] = useState<string | null>(null);

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
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create user');
      }
      setCreatedUserNotice(`User ${newUserEmail} created successfully! Credentials ready.`);
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
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

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

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f6] min-h-screen font-sans">
      <Header
        title="Admin Control Center"
        subtitle="System administration, user management, and policy compliance"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Admin Control', href: '/admin' },
        ]}
      />

      <main className="flex-1 p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Users</span>
            <span className="text-2xl font-serif font-bold text-slate-900 mt-1 block">{stats.totalUsers}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Researches Run</span>
            <span className="text-2xl font-serif font-bold text-purple-700 mt-1 block">{stats.totalResearches}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Saved in Vaults</span>
            <span className="text-2xl font-serif font-bold text-indigo-700 mt-1 block">{stats.totalSavedNiches}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Viability Score</span>
            <span className="text-2xl font-serif font-bold text-amber-700 mt-1 block">{stats.averageViabilityScore}/100</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-sm'
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
                ? 'bg-purple-600 text-white shadow-sm'
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
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>System Activity Logs ({logs.length})</span>
          </button>
        </div>

        {/* Tab 1: User Management */}
        {activeTab === 'users' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-serif font-bold text-slate-900">Registered Users & Quotas</h3>
                <p className="text-xs text-slate-500">Manage user authorization roles and track research API volume</p>
              </div>

              <button
                onClick={() => setIsCreateUserOpen(true)}
                className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create New User</span>
              </button>
            </div>

            {createdUserNotice && (
              <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{createdUserNotice}</span>
                </div>
                <button onClick={() => setCreatedUserNotice(null)} className="text-emerald-700 hover:text-emerald-900">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-50 uppercase text-[10px] tracking-wider text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-5">Name & Email</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4 text-center">API Usage Runs</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-purple-50/40 transition">
                      <td className="py-3.5 px-5">
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-slate-500 text-xs">{u.email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-purple-700">
                        {u.apiUsageCount || 0} Runs
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {u.email !== 'admin@nichehunter.io' && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal: Create User */}
            {isCreateUserOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border border-slate-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="text-base font-serif font-bold text-slate-900">Create New User Account</h4>
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
                        placeholder="e.g. John Doe / Client Name"
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
                        placeholder="user@example.com"
                        className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Password (min. 6 characters)</label>
                      <input
                        type="text"
                        required
                        minLength={6}
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="Assign password (e.g. Client@12345)"
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
                        <option value="user">Standard User (Research, Scans, Blueprints)</option>
                        <option value="admin">Administrator (Full Access & User Control)</option>
                      </select>
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
                        {creatingUser ? 'Creating...' : 'Create Account'}
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
                  <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                    log.level === 'error' ? 'bg-rose-500/20 text-rose-400' : log.level === 'warn' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
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
