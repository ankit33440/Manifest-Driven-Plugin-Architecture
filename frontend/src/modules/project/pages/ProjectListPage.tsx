import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';
import { useAuth } from '../../../core/auth/AuthContext';
import { getPagesFor } from '../../../core/plugin-loader';
import StatusBadge from '../../../components/StatusBadge';
import PageLoader from '../../../components/PageLoader';

interface Project {
  id: string;
  name: string;
  enrollment: string | null;
  status: string;
  country: string | null;
  region: string | null;
  proposedCarbonCredits: number | null;
  createdAt: string;
}

const ALL_STATUSES = [
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'INFO_REQUESTED',
  'APPROVED', 'REJECTED', 'CERTIFIED', 'ACTIVE',
];

function ProjectCard({
  project,
  onClick,
  onEdit,
}: {
  project: Project;
  onClick: () => void;
  onEdit?: () => void;
}) {
  return (
    <div className="surface overflow-hidden hover:shadow-md transition-shadow group">
      <div className="h-1.5 w-full bg-accent" />
      <button onClick={onClick} className="w-full text-left p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-ink group-hover:text-accent leading-snug line-clamp-2">
            {project.name}
          </h3>
          <StatusBadge status={project.status} />
        </div>
        <p className="text-xs text-ink-muted mb-3">
          {project.enrollment ?? '—'} · {project.country}{project.region ? `, ${project.region}` : ''}
        </p>
        <div className="flex items-center justify-between text-xs text-ink-faint pt-3 border-t border-line">
          <span>
            {project.proposedCarbonCredits
              ? `${Number(project.proposedCarbonCredits).toLocaleString()} tCO₂`
              : '—'}
          </span>
          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
        </div>
      </button>
      {onEdit && (
        <div className="px-5 pb-4">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="w-full text-xs font-medium text-ink-muted border border-line rounded-md py-1.5 hover:bg-canvas transition-colors"
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
    () => projects.filter((p) => !statusFilter || p.status === statusFilter),
    [projects, statusFilter],
  );

  const stats = useMemo(
    () => ({
      total: projects.length,
      draft: projects.filter((p) => p.status === 'DRAFT').length,
      active: projects.filter((p) =>
        ['SUBMITTED', 'UNDER_REVIEW', 'INFO_REQUESTED', 'APPROVED', 'ACTIVE'].includes(p.status),
      ).length,
      certified: projects.filter((p) => p.status === 'CERTIFIED').length,
    }),
    [projects],
  );

  if (loading) return <PageLoader />;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">{isAdmin ? 'All Projects' : 'My Projects'}</h1>
          <p className="text-sm text-ink-muted mt-0.5">{projects.length} total</p>
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
          <div key={s.label} className="surface px-4 py-3 text-center">
            <p className="text-2xl font-bold text-ink">{s.value}</p>
            <p className="text-xs text-ink-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
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
        {statusFilter && (
          <button
            onClick={() => setStatusFilter('')}
            className="text-xs text-ink-muted hover:text-ink transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-status-rejected-bg border border-status-rejected-text/20 text-status-rejected-text text-sm px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-ink-faint">
          <p className="text-base font-medium">No projects found</p>
          {canCreate && (
            <button
              onClick={() => navigate('/projects/new')}
              className="mt-3 text-accent font-medium text-sm hover:underline"
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
              onEdit={
                canCreate && p.status === 'DRAFT'
                  ? () => navigate(`/projects/${p.id}/edit`)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
