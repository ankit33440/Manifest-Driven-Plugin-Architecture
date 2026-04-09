import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';
import PageHeader from '../../../components/PageHeader';
import DataTable, { Column } from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import PageLoader from '../../../components/PageLoader';

interface Credit {
  id: string;
  serialNumber: string;
  projectId: string;
  projectName: string;
  carbonTonnes: number;
  status: string;
  vintageYear: number;
}

export default function CreditListPage() {
  const navigate = useNavigate();
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/credits')
      .then((r) => setCredits(r.data))
      .catch(() => setError('Failed to load credits'))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<Credit>[] = [
    { key: 'serialNumber', header: 'Serial No.' },
    { key: 'projectName', header: 'Project' },
    { key: 'carbonTonnes', header: 'Tonnes', render: (r) => r.carbonTonnes.toLocaleString() },
    { key: 'vintageYear', header: 'Vintage' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Carbon Credits"
        subtitle={`${credits.length} credits active and pending`}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={credits}
        onRowClick={(row) => navigate(`/credits/${row.id}`)}
        emptyMessage="No credits found"
      />
    </div>
  );
}
