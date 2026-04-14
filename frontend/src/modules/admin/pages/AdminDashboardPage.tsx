import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';
import StatCard from '../../../components/StatCard';
import PageLoader from '../../../components/PageLoader';

const ALL_STATUSES = [
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'INFO_REQUESTED',
  'APPROVED', 'REJECTED', 'VERIFIED', 'CERTIFIED', 'ACTIVE',
];

interface PlatformStats {
  usersByStatus: Record<string, number>;
  projectsByStatus: Record<string, number>;
  totalCreditVolume: number;
  pendingUsers: { id: string; email: string; firstName: string; lastName: string; role: string }[];
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Force status form
  const [projectId, setProjectId] = useState('');
  const [toStatus, setToStatus] = useState('');
  const [forceNote, setForceNote] = useState('');
  const [forcing, setForcing] = useState(false);
  const [forceResult, setForceResult] = useState<{ success: boolean; msg: string } | null>(null);

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

  async function handleForceStatus() {
    if (!projectId.trim() || !toStatus) return;
    setForcing(true);
    setForceResult(null);
    try {
      await api.patch(`/admin/projects/${projectId.trim()}/force-status`, {
        status: toStatus,
        note: forceNote || `Forced to ${toStatus} by admin`,
      });
      setForceResult({ success: true, msg: `Status changed to ${toStatus}` });
      setProjectId('');
      setToStatus('');
      setForceNote('');
      await load();
    } catch (err: any) {
      setForceResult({
        success: false,
        msg: err.response?.data?.message || 'Force status failed',
      });
    } finally {
      setForcing(false);
    }
  }

  if (loading) return <PageLoader />;

  const s = stats!;
  const totalUsers = Object.values(s.usersByStatus).reduce((a, b) => a + b, 0);
  const totalProjects = Object.values(s.projectsByStatus).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
        <p className="text-sm text-stone-500 mt-0.5">Platform controls and overrides</p>
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
          <StatCard label="In Review" value={(s.projectsByStatus['SUBMITTED'] ?? 0) + (s.projectsByStatus['UNDER_REVIEW'] ?? 0)} />
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

      {/* Force Project Status */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Force Project Status</h2>
        <p className="text-xs text-stone-400 mb-4">Override a project's status. Use with caution — this bypasses normal workflow gates.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1">Project ID</label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="UUID or partial"
              className="field w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1">New Status</label>
            <select
              value={toStatus}
              onChange={(e) => setToStatus(e.target.value)}
              className="field w-full text-sm"
            >
              <option value="">Select status…</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1">Note (optional)</label>
            <input
              type="text"
              value={forceNote}
              onChange={(e) => setForceNote(e.target.value)}
              placeholder="Reason for override"
              className="field w-full text-sm"
            />
          </div>
        </div>
        <button
          disabled={!projectId.trim() || !toStatus || forcing}
          onClick={handleForceStatus}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {forcing ? 'Applying…' : 'Force Status Change'}
        </button>
        {forceResult && (
          <p className={`mt-3 text-sm font-medium ${forceResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
            {forceResult.msg}
          </p>
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
