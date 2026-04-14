import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';
import { useAuth } from '../../../core/auth/AuthContext';

interface Project {
  id: string;
  name: string;
  status: string;
  type: string;
  country: string;
  region: string;
  estimatedCredits: number | null;
  vintageStartYear: number | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-stone-100 text-stone-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-600',
  VERIFIED: 'bg-teal-100 text-teal-700',
  CERTIFIED: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-green-100 text-green-700',
};

const STATUS_TO_STEP: Record<string, number> = {
  DRAFT: 0,
  SUBMITTED: 1,
  UNDER_REVIEW: 2,
  APPROVED: 2,
  VERIFIED: 3,
  CERTIFIED: 4,
  ACTIVE: 4,
  REJECTED: 1,
};

const LIFECYCLE_STEPS = ['Listing', 'Submission', 'Verification', 'Certification', 'Issuance'];

function Surface({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-stone-200 bg-white ${className}`}>{children}</div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <Surface className="p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent ?? 'text-slate-900'}`}>{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
    </Surface>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function ProjectLifecycleRow({ project }: { project: Project }) {
  const step = STATUS_TO_STEP[project.status] ?? 0;
  return (
    <div className="py-4 border-b border-stone-100 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{project.name}</p>
          <p className="text-xs text-stone-400">
            {project.type.replace(/_/g, ' ')} · {project.country}
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>
      {/* Mini stepper */}
      <div className="flex items-center gap-1 mt-2">
        {LIFECYCLE_STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < step
                  ? 'bg-slate-800'
                  : i === step
                  ? 'bg-green-500'
                  : 'bg-stone-200'
              }`}
            />
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {LIFECYCLE_STEPS.map((s, i) => (
          <span
            key={s}
            className={`text-[10px] ${
              i === step ? 'text-green-600 font-semibold' : 'text-stone-400'
            }`}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ProjectDeveloperDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/projects')
      .then((r) => setProjects(r.data))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const totalCredits = projects
    .filter((p) => ['CERTIFIED', 'ACTIVE', 'VERIFIED'].includes(p.status))
    .reduce((sum, p) => sum + Number(p.estimatedCredits ?? 0), 0);

  const activeProjects = projects.filter(
    (p) => !['DRAFT', 'REJECTED'].includes(p.status),
  );

  const pendingIssues = projects.filter((p) =>
    ['SUBMITTED', 'UNDER_REVIEW'].includes(p.status),
  ).length;

  const vintageGroups = Object.entries(
    projects.reduce(
      (acc, p) => {
        const yr = String(p.vintageStartYear ?? 'Unknown');
        acc[yr] = (acc[yr] ?? 0) + Number(p.estimatedCredits ?? 0);
        return acc;
      },
      {} as Record<string, number>,
    ),
  )
    .sort(([a], [b]) => Number(b) - Number(a))
    .slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={() => navigate('/projects/new')}
          className="btn-primary"
        >
          + Register New Project
        </button>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Projects" value={projects.length} />
        <MetricCard
          label="Carbon Credits"
          value={
            totalCredits > 0
              ? `${(totalCredits / 1000).toFixed(1)}k tCO₂`
              : '—'
          }
          sub="Verified & Certified"
          accent="text-green-600"
        />
        <MetricCard
          label="Active Pipeline"
          value={activeProjects.length}
          sub="Submitted or above"
        />
        <MetricCard
          label="Pending Review"
          value={pendingIssues}
          sub="Awaiting action"
          accent={pendingIssues > 0 ? 'text-amber-600' : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects lifecycle */}
        <div className="lg:col-span-2">
          <Surface className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Active Projects</h2>
              <button
                onClick={() => navigate('/projects')}
                className="text-xs text-stone-400 hover:text-slate-700 transition-colors"
              >
                View all →
              </button>
            </div>
            {activeProjects.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-sm">
                <p>No active projects yet.</p>
                <button
                  onClick={() => navigate('/projects/new')}
                  className="mt-2 text-slate-700 font-medium hover:underline"
                >
                  Register your first project →
                </button>
              </div>
            ) : (
              activeProjects.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="cursor-pointer hover:bg-stone-50 rounded-xl transition-colors -mx-2 px-2"
                >
                  <ProjectLifecycleRow project={p} />
                </div>
              ))
            )}
          </Surface>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Vintage distribution */}
          <Surface className="p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              Credits by Vintage
            </h2>
            {vintageGroups.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">
                No credit data yet
              </p>
            ) : (
              <div className="space-y-3">
                {vintageGroups.map(([year, credits]) => {
                  const maxCredits = Math.max(...vintageGroups.map(([, c]) => c));
                  const pct = maxCredits > 0 ? (credits / maxCredits) * 100 : 0;
                  return (
                    <div key={year}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-700 font-medium">{year}</span>
                        <span className="text-stone-400">
                          {credits.toLocaleString()} tCO₂
                        </span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Surface>

          {/* Transactions placeholder */}
          <Surface className="p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              Recent Transactions
            </h2>
            <p className="text-xs text-stone-400">Available in Phase 2</p>
          </Surface>
        </div>
      </div>

      {/* All projects quick list */}
      {projects.filter((p) => p.status === 'DRAFT').length > 0 && (
        <Surface className="p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Draft Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects
              .filter((p) => p.status === 'DRAFT')
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="text-left p-3 rounded-xl border border-stone-100 hover:border-stone-300 hover:bg-stone-50 transition-all"
                >
                  <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {p.type.replace(/_/g, ' ')} · {p.country}
                  </p>
                </button>
              ))}
          </div>
        </Surface>
      )}
    </div>
  );
}
