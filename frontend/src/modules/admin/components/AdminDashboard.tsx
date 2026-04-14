import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';
import StatCard from '../../../components/StatCard';
import PageLoader from '../../../components/PageLoader';

interface PlatformStats {
  usersByStatus: Record<string, number>;
  projectsByStatus: Record<string, number>;
  totalCreditVolume: number;
  pendingUsers: PendingUser[];
}

interface PendingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleApprove(userId: string) {
    setApproving(userId);
    try {
      await api.patch(`/admin/users/${userId}/approve`);
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve user');
    } finally {
      setApproving(null);
    }
  }

  async function handleReject(userId: string) {
    setRejecting(userId);
    try {
      await api.patch(`/admin/users/${userId}/reject`, { note: 'Rejected by admin' });
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject user');
    } finally {
      setRejecting(null);
    }
  }

  if (loading) return <PageLoader />;

  const s = stats!;
  const totalUsers = Object.values(s.usersByStatus).reduce((a, b) => a + b, 0);
  const totalProjects = Object.values(s.projectsByStatus).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-stone-500 mt-0.5">Platform overview and controls</p>
      </div>

      {/* User stats */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Users</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={totalUsers} />
          <StatCard label="Pending Approval" value={s.usersByStatus['PENDING_APPROVAL'] ?? 0} />
          <StatCard label="Active" value={s.usersByStatus['ACTIVE'] ?? 0} />
          <StatCard label="Suspended" value={s.usersByStatus['SUSPENDED'] ?? 0} />
        </div>
      </div>

      {/* Project stats */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Projects</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total" value={totalProjects} />
          <StatCard label="Draft" value={s.projectsByStatus['DRAFT'] ?? 0} />
          <StatCard label="Under Review" value={(s.projectsByStatus['SUBMITTED'] ?? 0) + (s.projectsByStatus['UNDER_REVIEW'] ?? 0)} />
          <StatCard label="Approved" value={s.projectsByStatus['APPROVED'] ?? 0} />
          <StatCard label="Certified" value={s.projectsByStatus['CERTIFIED'] ?? 0} />
        </div>
      </div>

      {/* Credit Volume */}
      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-1">Total Credit Volume Issued</p>
        <p className="text-3xl font-bold text-teal-800">
          {s.totalCreditVolume > 0
            ? `${Number(s.totalCreditVolume).toLocaleString()} tCO₂`
            : '— tCO₂'}
        </p>
      </div>

      {/* Pending Approvals */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Pending User Approvals</h2>
          <button onClick={() => navigate('/admin/users')} className="text-xs text-stone-400 hover:text-slate-700">
            All users →
          </button>
        </div>
        {s.pendingUsers.length === 0 ? (
          <p className="text-sm text-stone-400 py-4 text-center">No pending approvals.</p>
        ) : (
          <div className="space-y-2">
            {s.pendingUsers.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-xl border border-stone-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-stone-400">{u.email} · {u.role.replace(/_/g, ' ')}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={approving === u.id}
                    onClick={() => handleApprove(u.id)}
                    className="text-xs font-medium text-white bg-emerald-600 rounded-lg px-3 py-1.5 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {approving === u.id ? '…' : 'Approve'}
                  </button>
                  <button
                    disabled={rejecting === u.id}
                    onClick={() => handleReject(u.id)}
                    className="text-xs font-medium text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    {rejecting === u.id ? '…' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/admin/users')}
          className="p-5 rounded-2xl border border-stone-200 bg-white text-left hover:border-stone-300 hover:shadow-sm transition-all"
        >
          <p className="text-sm font-semibold text-slate-900">User Management</p>
          <p className="text-xs text-stone-400 mt-1">Approve, suspend, and manage user roles</p>
        </button>
        <button
          onClick={() => navigate('/admin/audit')}
          className="p-5 rounded-2xl border border-stone-200 bg-white text-left hover:border-stone-300 hover:shadow-sm transition-all"
        >
          <p className="text-sm font-semibold text-slate-900">Audit Log</p>
          <p className="text-xs text-stone-400 mt-1">View all platform activity</p>
        </button>
      </div>
    </div>
  );
}
