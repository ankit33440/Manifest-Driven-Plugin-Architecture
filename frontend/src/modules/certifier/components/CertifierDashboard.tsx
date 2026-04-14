import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';
import { useAuth } from '../../../core/auth/AuthContext';
import StatCard from '../../../components/StatCard';
import PageLoader from '../../../components/PageLoader';

interface Project {
  id: string;
  name: string;
  type: string;
  standard: string;
  status: string;
  country: string;
  estimatedCredits: number | null;
  updatedAt: string;
}

interface DashboardStats {
  pendingQueue: number;
  certifiedTotal: number;
  totalVolumeIssued: number;
  avgCreditsPerProject: number;
}

export default function CertifierDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [queue, setQueue] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, queueRes] = await Promise.all([
        api.get('/certifier/dashboard'),
        api.get('/certifier/queue'),
      ]);
      setStats(statsRes.data);
      setQueue(queueRes.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageLoader />;

  const formatVolume = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(1)}k tCO₂` : `${v.toLocaleString()} tCO₂`;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-stone-500 mt-0.5">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Queue" value={stats?.pendingQueue ?? 0} trend="Approved projects" />
        <StatCard label="Certified" value={stats?.certifiedTotal ?? 0} trend="All time" />
        <StatCard
          label="Volume Issued"
          value={stats?.totalVolumeIssued ? formatVolume(stats.totalVolumeIssued) : '—'}
          trend="Total credits issued"
        />
        <StatCard
          label="Avg Credits"
          value={stats?.avgCreditsPerProject ? `${Math.round(stats.avgCreditsPerProject).toLocaleString()} tCO₂` : '—'}
          trend="Per project"
        />
      </div>

      {/* Pending Certification Queue */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Pending Certification</h2>
          <button
            onClick={() => navigate('/certifier/queue')}
            className="text-xs text-stone-400 hover:text-slate-700"
          >
            View all →
          </button>
        </div>
        {queue.length === 0 ? (
          <p className="text-sm text-stone-400 py-6 text-center">No projects awaiting certification.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-100">
              <thead>
                <tr>
                  {['Project', 'Standard', 'Country', 'Est. Credits', ''].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-stone-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {queue.slice(0, 6).map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-3 py-3">
                      <p className="text-sm font-medium text-slate-900 truncate max-w-[180px]">{p.name}</p>
                      <p className="text-xs text-stone-400">{p.type.replace(/_/g, ' ')}</p>
                    </td>
                    <td className="px-3 py-3 text-sm text-stone-600">{p.standard}</td>
                    <td className="px-3 py-3 text-sm text-stone-600">{p.country}</td>
                    <td className="px-3 py-3 text-sm text-stone-600">
                      {p.estimatedCredits ? `${Number(p.estimatedCredits).toLocaleString()} tCO₂` : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => navigate(`/certifier/projects/${p.id}`)}
                        className="text-xs font-medium text-white bg-teal-600 rounded-lg px-3 py-1.5 hover:bg-teal-700 transition-colors"
                      >
                        Certify →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
