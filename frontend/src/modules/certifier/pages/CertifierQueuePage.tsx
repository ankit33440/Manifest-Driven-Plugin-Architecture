import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';
import PageHeader from '../../../components/PageHeader';
import DataTable, { Column } from '../../../components/DataTable';
import PageLoader from '../../../components/PageLoader';

interface Project {
  id: string;
  name: string;
  enrollment: string | null;
  protocol: string | null;
  country: string | null;
  proposedCarbonCredits: number | null;
  updatedAt: string;
}

export default function CertifierQueuePage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/certifier/queue')
      .then((r) => setProjects(r.data))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const columns: Column<Project>[] = [
    {
      key: 'name',
      header: 'Project',
      render: (p) => (
        <div>
          <p className="font-medium text-slate-900">{p.name}</p>
          <p className="text-xs text-stone-400">{p.enrollment ?? '—'}</p>
        </div>
      ),
    },
    { key: 'protocol', header: 'Protocol' },
    { key: 'country', header: 'Country' },
    {
      key: 'proposedCarbonCredits',
      header: 'Proposed Credits',
      render: (p) =>
        p.proposedCarbonCredits ? `${Number(p.proposedCarbonCredits).toLocaleString()} tCO₂` : '—',
    },
    {
      key: 'updatedAt',
      header: 'Approved',
      render: (p) => new Date(p.updatedAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Certification Queue"
        subtitle={`${projects.length} project${projects.length !== 1 ? 's' : ''} approved for certification`}
      />
      <DataTable
        columns={columns}
        data={projects}
        onRowClick={(p) => navigate(`/certifier/projects/${p.id}`)}
        emptyMessage="No projects awaiting certification."
      />
    </div>
  );
}
