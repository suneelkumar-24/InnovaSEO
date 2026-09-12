'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/components/AuthProvider';
import {
  Users,
  UserPlus,
  Trash2,
  CheckCircle2,
  X,
  KeyRound,
  Copy,
  Search,
  Sparkles,
  ShieldAlert,
  Lock,
  Mail,
  User as UserIcon,
  Pencil,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  pendingApprovals: number;
  activeUsers: number;
  suspendedUsers: number;
  adminUsers: number;
  standardUsers: number;
}

export default function AdminPage() {
  const { user: currentUser, isAdmin, loading: authLoading } = useAuth();

  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    adminUsers: 0,
    standardUsers: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_approval' | 'active' | 'suspended'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');

  // Create User Modal State
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [newUserStatus, setNewUserStatus] = useState<'active' | 'suspended'>('active');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState<string | null>(null);

  // Edit User Modal State
  const [editModalUser, setEditModalUser] = useState<any | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState<'user' | 'admin'>('user');
  const [editUserStatus, setEditUserStatus] = useState<'active' | 'suspended'>('active');
  const [updatingUser, setUpdatingUser] = useState(false);
  const [editUserError, setEditUserError] = useState<string | null>(null);

  // Credentials Ready Card State (1-click clipboard copy for WhatsApp / Email)
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
        setStats(data.stats || {
          totalUsers: data.users?.length || 0,
          pendingApprovals: (data.users || []).filter((u: any) => u.status === 'pending_approval').length,
          activeUsers: (data.users || []).filter((u: any) => u.status === 'active' || !u.status).length,
          suspendedUsers: (data.users || []).filter((u: any) => u.status === 'suspended').length,
          adminUsers: (data.users || []).filter((u: any) => u.role === 'admin').length,
          standardUsers: (data.users || []).filter((u: any) => u.role === 'user').length,
        });
        setUsers(data.users || []);
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

  // Helper to generate a memorable strong password
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
          status: newUserStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create user');
      }

      // Store credentials to show copy modal immediately
      setCredentialsModal({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword,
        role: newUserRole,
      });

      setActionNotice(`User "${newUserName.trim()}" (${newUserEmail.trim()}) provisioned successfully.`);
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

  const openEditModal = (u: any) => {
    setEditModalUser(u);
    setEditUserName(u.name || '');
    setEditUserEmail(u.email || '');
    setEditUserRole(u.role || 'user');
    setEditUserStatus(u.status || 'active');
    setEditUserError(null);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalUser) return;
    setUpdatingUser(true);
    setEditUserError(null);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_user',
          userId: editModalUser.id,
          name: editUserName.trim(),
          email: editUserEmail.trim(),
          role: editUserRole,
          status: editUserStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update user account');
      }

      setActionNotice(`User account ${editUserEmail} updated successfully.`);
      setEditModalUser(null);
      fetchAdminData();
    } catch (err: any) {
      setEditUserError(err.message);
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string, email: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_status', userId }),
      });
      const data = await res.json();
      if (data.success) {
        const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
        setActionNotice(`Account ${email} is now ${nextStatus.toUpperCase()}.`);
        fetchAdminData();
      } else {
        alert(data.error || 'Failed to toggle status');
      }
    } catch (e: any) {
      alert(e?.message || 'Error updating status');
    }
  };

  const handleApproveUser = async (userId: string, email: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve_user', userId }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Account ${email} APPROVED! 50 credits (75 active mins/day) allocated.`);
        fetchAdminData();
      } else {
        alert(data.error || 'Failed to approve user account.');
      }
    } catch (e: any) {
      alert(e?.message || 'Error approving user account');
    }
  };

  const handleRejectUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to decline registration request for ${email}?`)) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject_user', userId }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Registration request for ${email} has been declined and deleted.`);
        fetchAdminData();
      } else {
        alert(data.error || 'Failed to decline user.');
      }
    } catch (e: any) {
      alert(e?.message || 'Error declining user');
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
    if (!confirm(`Are you sure you want to permanently delete user: ${email}?\n\nThis will also remove all researches and saved niches owned by this user.`)) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_user', userId }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`User ${email} and their isolated workspace data were deleted.`);
        fetchAdminData();
      } else {
        alert(data.error || 'Failed to delete user');
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
👤 *Role*: ${credentialsModal.role === 'admin' ? 'Administrator' : 'Standard Member'}
🛡️ *Data*: Private Isolated Workspace
--------------------------------------------
Please log in and keep your password secure.`;

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase().trim();
        const match =
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (statusFilter !== 'all' && (u.status || 'active') !== statusFilter) {
        return false;
      }
      if (roleFilter !== 'all' && u.role !== roleFilter) {
        return false;
      }
      return true;
    });
  }, [users, userSearchQuery, statusFilter, roleFilter]);

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
        title="Admin User Management"
        subtitle="Provision accounts with passwords, manage credentials, and administer user access"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Admin Control', href: '/admin' },
        ]}
      />

      <main className="flex-1 p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Top Metric Cards: User & Approval Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Accounts</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-serif font-bold text-slate-900">{stats.totalUsers}</span>
              <span className="text-xs font-semibold text-slate-500">Registered</span>
            </div>
          </div>

          <button
            onClick={() => setStatusFilter(statusFilter === 'pending_approval' ? 'all' : 'pending_approval')}
            className={`border rounded-3xl p-4 shadow-xs text-left transition ${
              stats.pendingApprovals > 0
                ? 'bg-amber-50/80 border-amber-300 hover:bg-amber-100/80'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className={`text-[10px] uppercase font-bold block ${stats.pendingApprovals > 0 ? 'text-amber-800 font-black' : 'text-slate-400'}`}>
              Pending Approvals
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-serif font-bold ${stats.pendingApprovals > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                {stats.pendingApprovals}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stats.pendingApprovals > 0 ? 'bg-amber-200/80 text-amber-900 font-bold animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                {stats.pendingApprovals > 0 ? 'Review Needed' : '0'}
              </span>
            </div>
          </button>

          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Users</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-serif font-bold text-emerald-600">{stats.activeUsers}</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Standard Members</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-serif font-bold text-purple-700">{stats.standardUsers}</span>
              <span className="text-xs font-semibold text-slate-500">75m Daily</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Workspace Admins</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-serif font-bold text-indigo-700">{stats.adminUsers}</span>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">Full Control</span>
            </div>
          </div>
        </div>

        {/* Urgent Pending Approvals Banner */}
        {stats.pendingApprovals > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 font-black text-sm">
                !
              </div>
              <div>
                <p className="font-bold text-xs text-amber-950">
                  {stats.pendingApprovals} Registration Request{stats.pendingApprovals > 1 ? 's' : ''} Awaiting Admin Approval
                </p>
                <p className="text-[11px] text-amber-800">
                  New users cannot log in until approved. Approving will automatically grant them 50 credits (75 active mins per day).
                </p>
              </div>
            </div>
            <button
              onClick={() => setStatusFilter('pending_approval')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs shrink-0 self-start sm:self-auto transition"
            >
              Filter Pending Requests
            </button>
          </div>
        )}

        {/* Global Action Notice Banner */}
        {actionNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main User Management Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm space-y-4">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span>User Accounts & Authentication Management</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin adds users with password. Each user gets 50 daily credits (75 active mins) and a private, isolated workspace.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setIsCreateUserOpen(true);
                  setNewUserPassword(generateStrongPassword());
                }}
                className="px-4 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition self-start sm:self-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Add User with Password</span>
              </button>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="px-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending_approval">Pending Approval ({stats.pendingApprovals})</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e: any) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Roles</option>
                <option value="user">Standard Users</option>
                <option value="admin">Administrators</option>
              </select>

              {(userSearchQuery || statusFilter !== 'all' || roleFilter !== 'all') && (
                <button
                  onClick={() => {
                    setUserSearchQuery('');
                    setStatusFilter('all');
                    setRoleFilter('all');
                  }}
                  className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-slate-50 uppercase text-[10px] tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-5">User Profile</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Daily Quota</th>
                  <th className="py-3.5 px-4 text-center">Researches</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map((u) => {
                  const isSuspended = u.status === 'suspended';
                  const isPending = u.status === 'pending_approval';
                  const isSelf = Boolean(currentUser && currentUser.id === u.id);

                  return (
                    <tr key={u.id} className={`transition ${isPending ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-purple-50/40'}`}>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs ${
                            isPending
                              ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                              : 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                          }`}>
                            {u.name ? u.name.slice(0, 1).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900">{u.name}</p>
                              {isSelf && (
                                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-slate-500 text-xs font-mono">{u.email}</p>
                            {u.requestReason && (
                              <p className="text-[11px] text-amber-800 bg-amber-100/70 border border-amber-200/80 px-2 py-0.5 rounded-md mt-1 max-w-sm">
                                <span className="font-bold">Note:</span> {u.requestReason}
                              </p>
                            )}
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
                          {u.role === 'admin' ? 'Administrator' : 'Standard User'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>Pending Review</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => !isSelf && handleToggleStatus(u.id, u.status || 'active', u.email)}
                            disabled={isSelf}
                            title={isSelf ? 'Cannot change own status' : 'Click to toggle status'}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                              isSuspended
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            } ${isSelf ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                            <span>{isSuspended ? 'Suspended' : 'Active'}</span>
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-700">
                        {u.role === 'admin' ? (
                          <span className="text-purple-700 font-bold">Unlimited</span>
                        ) : (
                          <span>
                            <strong className="text-purple-700 font-bold">{u.credits ?? 50} Cr</strong>
                            <span className="text-slate-400 text-[11px] block">{u.remainingMinutes ?? 75}m daily time</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-purple-700">
                        {u.apiUsageCount || 0}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApproveUser(u.id, u.email)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition active:scale-95"
                              title="Approve User Account (50 Credits / 75m active daily time)"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleRejectUser(u.id, u.email)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 transition"
                              title="Decline and Remove Request"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit User Account */}
                            <button
                              onClick={() => openEditModal(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition"
                              title="Edit User Details"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            {/* Reset Password Button */}
                            <button
                              onClick={() => {
                                setResetModalUser(u);
                                setNewResetPassword(generateStrongPassword());
                                setResetPasswordError(null);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition"
                              title="Reset / Set New Password"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            {/* Delete User Button */}
                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Delete User Account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                      No user accounts match the current filter or search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal 1: Provision New User with Password */}
        {isCreateUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-serif font-bold text-slate-900">Add User with Password</h4>
                    <p className="text-[11px] text-slate-500">Create login credentials for a client or user</p>
                  </div>
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
                    placeholder="user@domain.com"
                    className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Assign Password</label>
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e: any) => setNewUserRole(e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="user">Standard User</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Initial Status</label>
                    <select
                      value={newUserStatus}
                      onChange={(e: any) => setNewUserStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 text-[11px] text-purple-900 leading-relaxed">
                  💡 After creating the user, a 1-click button will copy the ready-to-share login credentials to your clipboard for WhatsApp or Email.
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
                    {creatingUser ? 'Provisioning...' : 'Provision Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Copy Credentials Card (Shown after adding user or resetting password) */}
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
                The account is active and isolated. Copy the pre-formatted credentials below to send to the client:
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
                  <span className="text-slate-500">Workspace:</span>{' '}
                  <span className="text-slate-300">Private & Isolated User Workspace</span>
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

        {/* Modal 3: Edit User Modal */}
        {editModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-purple-600" />
                  <h4 className="text-base font-serif font-bold text-slate-900">Edit User Account</h4>
                </div>
                <button
                  onClick={() => setEditModalUser(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editUserError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {editUserError}
                </div>
              )}

              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Role</label>
                    <select
                      value={editUserRole}
                      disabled={currentUser?.id === editModalUser.id}
                      onChange={(e: any) => setEditUserRole(e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      <option value="user">Standard User</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Status</label>
                    <select
                      value={editUserStatus}
                      disabled={currentUser?.id === editModalUser.id}
                      onChange={(e: any) => setEditUserStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf9f6] border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditModalUser(null)}
                    className="px-4 py-2 rounded-full border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingUser}
                    className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-md disabled:opacity-50"
                  >
                    {updatingUser ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 4: Reset Password Modal */}
        {resetModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-purple-600" />
                  <h4 className="text-base font-serif font-bold text-slate-900">Set New Password</h4>
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
      </main>
    </div>
  );
}
