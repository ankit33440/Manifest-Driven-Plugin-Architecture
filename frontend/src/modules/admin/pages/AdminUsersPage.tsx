import React, { useCallback, useEffect, useState } from 'react';
import api from '../../../core/api/axios';
import PageHeader from '../../../components/PageHeader';
import PageLoader from '../../../components/PageLoader';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
}

const ALL_ROLES = ['SUPERADMIN', 'PROJECT_DEVELOPER', 'VERIFIER', 'CERTIFIER', 'BUYER'];
const ALL_STATUSES = ['PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED'];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
  SUSPENDED: 'bg-red-100 text-red-600',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (roleFilter) params.append('role', roleFilter);
    if (statusFilter) params.append('status', statusFilter);
    api
      .get(`/admin/users?${params.toString()}`)
      .then((r) => setUsers(r.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function doAction(userId: string, action: string, body?: Record<string, unknown>) {
    setActionLoading(`${userId}:${action}`);
    try {
      await api.patch(`/admin/users/${userId}/${action}`, body ?? {});
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRoleChange(userId: string, role: string) {
    setChangingRole(userId);
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Role change failed');
    } finally {
      setChangingRole(null);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="User Management" subtitle={`${users.length} users`} />

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select className="field text-sm max-w-[160px]" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select className="field text-sm max-w-[160px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        {(roleFilter || statusFilter) && (
          <button onClick={() => { setRoleFilter(''); setStatusFilter(''); }} className="text-xs text-stone-400 hover:text-slate-700">
            Clear
          </button>
        )}
      </div>

      {users.length === 0 ? (
        <div className="text-center py-16 text-stone-400">No users found.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-100">
              <thead className="bg-stone-50">
                <tr>
                  {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((u) => {
                  const busy = (action: string) => actionLoading === `${u.id}:${action}`;
                  return (
                    <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-900">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-stone-400">{u.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={changingRole === u.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="text-xs border border-stone-200 rounded-lg px-2 py-1 bg-white"
                        >
                          {ALL_ROLES.map((r) => (
                            <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[u.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {u.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.status === 'PENDING_APPROVAL' && (
                            <>
                              <button
                                disabled={busy('approve')}
                                onClick={() => doAction(u.id, 'approve')}
                                className="text-xs font-medium text-white bg-emerald-600 rounded px-2 py-1 hover:bg-emerald-700 disabled:opacity-50"
                              >
                                {busy('approve') ? '…' : 'Approve'}
                              </button>
                              <button
                                disabled={busy('reject')}
                                onClick={() => doAction(u.id, 'reject', { note: 'Rejected by admin' })}
                                className="text-xs font-medium text-red-600 border border-red-200 rounded px-2 py-1 hover:bg-red-50 disabled:opacity-50"
                              >
                                {busy('reject') ? '…' : 'Reject'}
                              </button>
                            </>
                          )}
                          {u.status === 'ACTIVE' && (
                            <button
                              disabled={busy('suspend')}
                              onClick={() => doAction(u.id, 'suspend')}
                              className="text-xs font-medium text-amber-700 bg-amber-100 rounded px-2 py-1 hover:bg-amber-200 disabled:opacity-50"
                            >
                              {busy('suspend') ? '…' : 'Suspend'}
                            </button>
                          )}
                          {u.status === 'SUSPENDED' && (
                            <button
                              disabled={busy('reactivate')}
                              onClick={() => doAction(u.id, 'reactivate')}
                              className="text-xs font-medium text-slate-700 border border-stone-200 rounded px-2 py-1 hover:bg-stone-50 disabled:opacity-50"
                            >
                              {busy('reactivate') ? '…' : 'Reactivate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
