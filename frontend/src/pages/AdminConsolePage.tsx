import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { ShieldAlert, Users, Building2, BookOpen, CheckCircle2, XCircle, Search, UserCheck, KeyRound, Plus, Sparkles } from 'lucide-react';

export const AdminConsolePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'COMPANIES' | 'FACULTY' | 'HOD_ASSIGN' | 'AUDIT_LOGS' | 'ANALYTICS'>('COMPANIES');
  const [users, setUsers] = useState<any[]>([]);
  const [pendingCompanies, setPendingCompanies] = useState<any[]>([]);
  const [pendingFaculty, setPendingFaculty] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // HOD Assignment Form State
  const [hodUserId, setHodUserId] = useState('');
  const [hodDepartment, setHodDepartment] = useState('Computer Science');
  const [hodMsg, setHodMsg] = useState<string | null>(null);

  // Admin Creation Form State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminMsg, setAdminMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingCompanies();
    fetchPendingFaculty();
    fetchUsers();
    fetchAnalytics();
  }, [search]);

  useEffect(() => {
    if (activeTab === 'AUDIT_LOGS') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const fetchPendingCompanies = async () => {
    try {
      const res = await apiClient.get('/company/pending');
      if (res.data?.success) {
        setPendingCompanies(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch pending companies:', e);
    }
  };

  const fetchPendingFaculty = async () => {
    try {
      const res = await apiClient.get('/admin/faculty/pending');
      if (res.data?.success) {
        setPendingFaculty(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch pending faculty:', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/admin/users', { params: { search } });
      if (res.data?.success) {
        setUsers(res.data.data.users);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await apiClient.get('/admin/audit-logs');
      if (res.data?.success) {
        setAuditLogs(res.data.data.logs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await apiClient.get('/analytics');
      if (res.data?.success) {
        setAnalytics(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCompany = async (companyId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await apiClient.patch(`/company/${companyId}/verification-status`, { status });
      if (res.data?.success) {
        setPendingCompanies((prev) => prev.filter((c) => c._id !== companyId));
        fetchUsers();
      }
    } catch (e) {
      alert('Failed to update company status.');
    }
  };

  const handleVerifyFaculty = async (facultyId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await apiClient.patch(`/admin/faculty/${facultyId}/verify`, { status });
      if (res.data?.success) {
        setPendingFaculty((prev) => prev.filter((f) => f._id !== facultyId));
        fetchUsers();
      }
    } catch (e) {
      alert('Failed to update faculty status.');
    }
  };

  const handleAssignHod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hodUserId) return;
    setHodMsg(null);
    try {
      const res = await apiClient.post('/admin/assign-hod', { userId: hodUserId, department: hodDepartment });
      if (res.data?.success) {
        setHodMsg(res.data.message || 'HOD assigned successfully.');
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign HOD.');
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminMsg(null);
    try {
      const res = await apiClient.post('/admin/create-admin', {
        name: newAdminName,
        email: newAdminEmail,
        password: newAdminPassword,
      });
      if (res.data?.success) {
        setAdminMsg('New Admin account provisioned successfully.');
        setNewAdminName('');
        setNewAdminEmail('');
        setNewAdminPassword('');
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create Admin account.');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await apiClient.put(`/admin/users/${userId}`, { isActive: !currentStatus });
      if (res.data?.success) {
        setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u)));
      }
    } catch (e) {
      alert('Failed to update user status.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070710] text-slate-100 p-4 lg:p-8 font-sans max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-violet-500/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Platform System Admin Console</h1>
            <p className="text-xs text-slate-400">Company Approvals, Institutional Verification, Role Management & Security Logs</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('COMPANIES')}
            className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'COMPANIES' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Pending Companies ({pendingCompanies.length})
          </button>
          <button
            onClick={() => setActiveTab('FACULTY')}
            className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'FACULTY' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Faculty Requests ({pendingFaculty.length})
          </button>
          <button
            onClick={() => setActiveTab('HOD_ASSIGN')}
            className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'HOD_ASSIGN' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Assign HOD
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'USERS' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            User Moderation
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'AUDIT_LOGS' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'ANALYTICS' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Overview
          </button>
        </div>
      </div>

      {/* PENDING COMPANY VERIFICATION TAB */}
      {activeTab === 'COMPANIES' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-emerald-400" />
              <span>Pending Company Registration Approvals</span>
            </h3>
            <span className="text-xs text-slate-400">Companies must be verified before posting jobs</span>
          </div>

          {pendingCompanies.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 text-slate-400 text-xs">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-60" />
              No pending company verification requests. All registered companies are verified.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingCompanies.map((c) => (
                <div key={c._id} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{c.companyName}</h4>
                      <p className="text-xs text-slate-400">{c.officialEmail || c.user?.email}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      PENDING VERIFICATION
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 bg-slate-900/60 p-3 rounded-xl font-mono text-[11px]">
                    <div><span className="text-slate-500">Industry:</span> {c.industry || 'IT / Tech'}</div>
                    <div><span className="text-slate-500">Reg #:</span> {c.registrationNumber || 'N/A'}</div>
                    <div><span className="text-slate-500">Location:</span> {c.location || 'India'}</div>
                    <div><span className="text-slate-500">HR Contact:</span> {c.hrContactName || 'N/A'} ({c.hrContactPhone || 'N/A'})</div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      onClick={() => handleVerifyCompany(c._id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center space-x-1"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleVerifyCompany(c._id, 'VERIFIED')}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approve & Verify</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PENDING FACULTY REQUESTS TAB */}
      {activeTab === 'FACULTY' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-violet-400" />
              <span>Pending Faculty Verification Requests</span>
            </h3>
            <span className="text-xs text-slate-400">Institutional / Admin approval required</span>
          </div>

          {pendingFaculty.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 text-slate-400 text-xs">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-60" />
              No pending faculty verification requests.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingFaculty.map((f) => (
                <div key={f._id} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{f.user?.name || 'Faculty Member'}</h4>
                      <p className="text-xs text-slate-400">{f.contactEmail || f.user?.email}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      PENDING VERIFICATION
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 bg-slate-900/60 p-3 rounded-xl font-mono text-[11px]">
                    <div><span className="text-slate-500">Institution:</span> {f.institution || 'SkillNexa Institution'}</div>
                    <div><span className="text-slate-500">Department:</span> {f.department || 'Computer Science'}</div>
                    <div><span className="text-slate-500">Designation:</span> {f.designation || 'Assistant Professor'}</div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      onClick={() => handleVerifyFaculty(f._id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center space-x-1"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleVerifyFaculty(f._id, 'VERIFIED')}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approve & Verify</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* HOD ASSIGNMENT & ADMIN PROVISIONING TAB */}
      {activeTab === 'HOD_ASSIGN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HOD Assignment */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-indigo-400" />
              <span>Assign Head of Department (HOD) Role</span>
            </h3>
            <p className="text-xs text-slate-400">Promote an institutional faculty user to HOD role with department authority.</p>

            {hodMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                {hodMsg}
              </div>
            )}

            <form onSubmit={handleAssignHod} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Select User to Promote *</label>
                <select
                  required
                  value={hodUserId}
                  onChange={(e) => setHodUserId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="">-- Choose User --</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email}) - {u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Department *</label>
                <input
                  type="text"
                  required
                  value={hodDepartment}
                  onChange={(e) => setHodDepartment(e.target.value)}
                  placeholder="Computer Science & Engineering"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl transition shadow-lg shadow-indigo-600/30"
              >
                Promote User to HOD
              </button>
            </form>
          </div>

          {/* Secure Admin Provisioning */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <KeyRound className="h-4 w-4 text-rose-400" />
              <span>Secure Admin Provisioning</span>
            </h3>
            <p className="text-xs text-slate-400">Admin accounts cannot be registered publicly. Create a new System Admin account securely.</p>

            {adminMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                {adminMsg}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Admin Full Name *</label>
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Platform Administrator"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Admin Email Address *</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@skillnexa.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Admin Password *</label>
                <input
                  type="password"
                  required
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-4 rounded-xl transition shadow-lg shadow-rose-600/30"
              >
                Provision Admin Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* USER MODERATION TAB */}
      {activeTab === 'USERS' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-white text-sm">Platform Users Management</h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user name or email..."
                className="pl-8 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-white">{u.name}</td>
                    <td className="p-3 text-slate-400">{u.email}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.companyVerificationStatus === 'VERIFIED' || u.companyVerificationStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        {u.companyVerificationStatus || 'VERIFIED'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {u.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold text-white transition ${u.isActive ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm">Security & System Event Audit Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Event Action</th>
                  <th className="p-3">Result</th>
                  <th className="p-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/50">
                    <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3 text-violet-300">{log.role}</td>
                    <td className="p-3 text-white font-bold">{log.action}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.result === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'ANALYTICS' && analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-slate-800 text-xs">
            <span className="text-slate-400">Total Registered Users</span>
            <p className="text-2xl font-bold text-white mt-1">{analytics.metrics?.totalUsers}</p>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-800 text-xs">
            <span className="text-slate-400">Total Students</span>
            <p className="text-2xl font-bold text-violet-400 mt-1">{analytics.metrics?.totalStudents}</p>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-800 text-xs">
            <span className="text-slate-400">Total Companies</span>
            <p className="text-2xl font-bold text-indigo-400 mt-1">{analytics.metrics?.totalCompanies}</p>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-800 text-xs">
            <span className="text-slate-400">Total Placements</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{analytics.metrics?.totalPlacements}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConsolePage;
