import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../../../core/api/axios';
import { useAuth } from '../../../core/auth/AuthContext';
import { getPagesFor } from '../../../core/plugin-loader';
import PageHeader from '../../../components/PageHeader';
import DataTable, { Column } from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import PageLoader from '../../../components/PageLoader';

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string;
  createdAt: string;
}

export default function ProjectListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canCreate = user ? getPagesFor(user.role).some((p) => p.path === '/projects/new') : false;

  useEffect(() => {
    api.get('/projects')
      .then((r) => setProjects(r.data))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<Project>[] = [
    { key: 'name', header: 'Project Name' },
    { key: 'type', header: 'Type', render: (r) => r.type.replace(/_/g, ' ') },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'location', header: 'Location' },
    {
      key: 'createdAt',
      header: 'Created',
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Projects"
        subtitle={`${projects.length} total projects`}
        action={
          canCreate ? (
            <button
              onClick={() => navigate('/projects/new')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <Plus size={16} />
              New Project
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={projects}
        onRowClick={(row) => navigate(`/projects/${row.id}`)}
        emptyMessage="No projects found"
      />
    </div>
  );
}
