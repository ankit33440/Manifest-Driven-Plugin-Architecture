import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';
import { useAuth } from '../../../core/auth/AuthContext';
import StatCard from '../../../components/StatCard';
import PageLoader from '../../../components/PageLoader';
import ReviewChecklist from './ReviewChecklist';

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  country: string;
  createdAt: string;
}

interface ProjectReview {
  methodologyCheck: boolean;
  boundaryCheck: boolean;
  additionalityCheck: boolean;
  permanenceCheck: boolean;
}

interface DashboardStats {
  queueTotal: number;
  claimedByMe: number;
  approvedTotal: number;
  rejectedTotal: number;
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  INFO_REQUESTED: 'bg-orange-100 text-orange-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-600',
};

export default function VerifierDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [queue, setQueue] = useState<Project[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [reviews, setReviews] = useState<Record<string, ProjectReview>>({});
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, queueRes, myRes] = await Promise.all([
        api.get('/verifier/dashboard'),
        api.get('/verifier/queue'),
        api.get('/verifier/my-projects'),
      ]);
      setStats(statsRes.data);
      setQueue(queueRes.data);
      setMyProjects(myRes.data);

      // Fetch reviews for claimed projects
      const reviewMap: Record<string, ProjectReview> = {};
      await Promise.all(
        (myRes.data as Project[]).map(async (p) => {
          try {
            const r = await api.get(`/verifier/projects/${p.id}/review`);
            if (r.data) reviewMap[p.id] = r.data;
          } catch {
            // ignore
          }
        }),
      );
      setReviews(reviewMap);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleClaim(projectId: string) {
    setClaiming(projectId);
    try {
      await api.patch(`/verifier/projects/${projectId}/claim`);
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not claim project');
    } finally {
      setClaiming(null);
    }
  }

  if (loading) return <PageLoader />;

  const pendingQueue = queue.filter((p) => p.status === 'SUBMITTED');

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
        <StatCard label="Queue Total" value={stats?.queueTotal ?? 0} trend="Submitted + Under Review" />
        <StatCard label="Claimed by Me" value={stats?.claimedByMe ?? 0} />
        <StatCard label="Approved" value={stats?.approvedTotal ?? 0} trend="All time" />
        <StatCard label="Rejected" value={stats?.rejectedTotal ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Claimed Projects */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">My Claimed Projects</h2>
          {myProjects.length === 0 ? (
            <p className="text-sm text-stone-400 py-6 text-center">No projects claimed yet.</p>
          ) : (
            <div className="space-y-3">
              {myProjects.slice(0, 5).map((p) => {
                const review = reviews[p.id];
                const checkedCount = review
                  ? [review.methodologyCheck, review.boundaryCheck, review.additionalityCheck, review.permanenceCheck].filter(Boolean).length
                  : 0;
                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-stone-100 hover:border-stone-300 hover:bg-stone-50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900 truncate max-w-[180px]">{p.name}</p>
                        <p className="text-xs text-stone-400">{p.country}</p>
                      </div>
                      <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {p.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${(checkedCount / 4) * 100}%` }} />
                      </div>
                      <span className="text-xs text-stone-400">{checkedCount}/4</span>
                      <button
                        onClick={() => navigate(`/verifier/projects/${p.id}`)}
                        className="text-xs text-blue-600 hover:underline ml-1"
                      >
                        Open →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Queue */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Pending Queue</h2>
            <button
              onClick={() => navigate('/verifier/queue')}
              className="text-xs text-stone-400 hover:text-slate-700"
            >
              View all →
            </button>
          </div>
          {pendingQueue.length === 0 ? (
            <p className="text-sm text-stone-400 py-6 text-center">No projects awaiting claim.</p>
          ) : (
            <div className="space-y-2">
              {pendingQueue.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-stone-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{p.name}</p>
                    <p className="text-xs text-stone-400">
                      {p.type.replace(/_/g, ' ')} · {p.country}
                    </p>
                  </div>
                  <button
                    disabled={claiming === p.id}
                    onClick={() => handleClaim(p.id)}
                    className="text-xs font-medium text-white bg-slate-800 rounded-lg px-3 py-1.5 hover:bg-slate-700 disabled:opacity-50 transition-colors"
                  >
                    {claiming === p.id ? '…' : 'Claim'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
