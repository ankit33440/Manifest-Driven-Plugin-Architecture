import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';
import PageHeader from '../../../components/PageHeader';
import DataTable, { Column } from '../../../components/DataTable';
import PageLoader from '../../../components/PageLoader';

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  country: string;
  region: string;
  createdAt: string;
  assignedVerifierId: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  INFO_REQUESTED: 'bg-orange-100 text-orange-700',
};

export default function VerifierQueuePage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get('/verifier/queue')
      .then((r) => setProjects(r.data))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleClaim(projectId: string) {
    setClaiming(projectId);
    try {
      await api.patch(`/verifier/projects/${projectId}/claim`);
      navigate(`/verifier/projects/${projectId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not claim project');
      setClaiming(null);
    }
  }

  if (loading) return <PageLoader />;

  const columns: Column<Project>[] = [
    {
      key: 'name',
      header: 'Project',
      render: (p) => (
        <div>
          <p className="font-medium text-slate-900">{p.name}</p>
          <p className="text-xs text-stone-400">{p.type.replace(/_/g, ' ')}</p>
        </div>
      ),
    },
    { key: 'country', header: 'Country' },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {p.status.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      render: (p) => new Date(p.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      render: (p) =>
        p.assignedVerifierId ? (
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/verifier/projects/${p.id}`); }}
            className="text-xs text-blue-600 hover:underline"
          >
            Open →
          </button>
        ) : (
          <button
            disabled={claiming === p.id}
            onClick={(e) => { e.stopPropagation(); handleClaim(p.id); }}
            className="text-xs font-medium text-white bg-slate-800 rounded-lg px-3 py-1.5 hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {claiming === p.id ? '…' : 'Claim'}
          </button>
        ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Review Queue"
        subtitle={`${projects.length} project${projects.length !== 1 ? 's' : ''} awaiting review`}
      />
      <DataTable
        columns={columns}
        data={projects}
        onRowClick={(p) => navigate(`/verifier/projects/${p.id}`)}
        emptyMessage="No projects in the review queue."
      />
    </div>
  );
}
