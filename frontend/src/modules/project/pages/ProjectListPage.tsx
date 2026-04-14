import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';
import { useAuth } from '../../../core/auth/AuthContext';
import { getPagesFor } from '../../../core/plugin-loader';
import PageLoader from '../../../components/PageLoader';

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  country: string;
  region: string;
  estimatedCredits: number | null;
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

const TYPE_GRADIENTS: Record<string, string> = {
  REFORESTATION: 'from-green-400 to-emerald-600',
  SOLAR: 'from-yellow-400 to-orange-500',
  WIND: 'from-sky-400 to-blue-600',
  METHANE: 'from-purple-400 to-violet-600',
  REDD_PLUS: 'from-lime-400 to-green-600',
  OTHER: 'from-stone-300 to-stone-500',
};

const ALL_STATUSES = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'VERIFIED', 'CERTIFIED', 'ACTIVE'];
const ALL_TYPES = ['REFORESTATION', 'SOLAR', 'WIND', 'METHANE', 'REDD_PLUS', 'OTHER'];

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function ProjectCard({
  project,
  onClick,
  onEdit,
}: {
  project: Project;
  onClick: () => void;
  onEdit?: () => void;
}) {
  const gradient = TYPE_GRADIENTS[project.type] ?? TYPE_GRADIENTS.OTHER;
  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden hover:border-stone-300 hover:shadow-md transition-all group">
      {/* Visual band */}
      <div className={`h-2 w-full bg-gradient-to-r ${gradient}`} />
      <button onClick={onClick} className="w-full text-left p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-slate-700 leading-tight line-clamp-2">
            {project.name}
          </h3>
          <StatusBadge status={project.status} />
        </div>
        <p className="text-xs text-stone-400 mb-3">
          {project.type.replace(/_/g, ' ')} · {project.country}, {project.region}
        </p>
        <div className="flex items-center justify-between text-xs text-stone-400 pt-3 border-t border-stone-100">
          <span>
            {project.estimatedCredits
              ? `${Number(project.estimatedCredits).toLocaleString()} tCO₂`
              : '—'}
          </span>
          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
        </div>
      </button>
      {onEdit && (
        <div className="px-5 pb-4 pt-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="w-full text-xs font-medium text-slate-600 border border-stone-200 rounded-lg py-1.5 hover:bg-stone-50 transition-colors"
          >
            Edit Draft
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProjectListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const canCreate = user
    ? getPagesFor(user.role).some((p) => p.path === '/projects/new')
    : false;

  const isAdmin = user?.role === 'SUPERADMIN';

  useEffect(() => {
    api
      .get('/projects')
      .then((r) => setProjects(r.data))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (!statusFilter || p.status === statusFilter) &&
          (!typeFilter || p.type === typeFilter),
      ),
    [projects, statusFilter, typeFilter],
  );

  // Stats derived from all projects (unfiltered)
  const stats = useMemo(() => ({
    total: projects.length,
    draft: projects.filter((p) => p.status === 'DRAFT').length,
    active: projects.filter((p) => ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'VERIFIED', 'ACTIVE'].includes(p.status)).length,
    certified: projects.filter((p) => p.status === 'CERTIFIED').length,
  }), [projects]);

  if (loading) return <PageLoader />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isAdmin ? 'All Projects' : 'My Projects'}
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">{projects.length} total</p>
        </div>
        {canCreate && (
          <button onClick={() => navigate('/projects/new')} className="btn-primary">
            + Register New Project
          </button>
        )}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Draft', value: stats.draft },
          { label: 'Active', value: stats.active },
          { label: 'Certified', value: stats.certified },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-center"
          >
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-stone-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          className="field text-sm max-w-[160px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <select
          className="field text-sm max-w-[160px]"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          {ALL_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        {(statusFilter || typeFilter) && (
          <button
            onClick={() => { setStatusFilter(''); setTypeFilter(''); }}
            className="text-xs text-stone-400 hover:text-slate-700 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <p className="text-base font-medium">No projects found</p>
          {canCreate && (
            <button
              onClick={() => navigate('/projects/new')}
              className="mt-3 text-slate-700 font-medium text-sm hover:underline"
            >
              Register your first project →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onClick={() => navigate(`/projects/${p.id}`)}
              onEdit={canCreate && p.status === 'DRAFT' ? () => navigate(`/projects/${p.id}/edit`) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
