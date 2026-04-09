import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';
import PageHeader from '../../../components/PageHeader';
import DataTable, { Column } from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import PageLoader from '../../../components/PageLoader';

interface Listing {
  id: string;
  serialNumber: string;
  projectName: string;
  carbonTonnes: number;
  pricePerTonne: number;
  totalPrice: number;
  status: string;
}

export default function MarketplaceListPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/marketplace/listings')
      .then((r) => setListings(r.data.filter((l: any) => l.status === 'AVAILABLE')))
      .catch(() => setError('Failed to load listings'))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<Listing>[] = [
    { key: 'serialNumber', header: 'Credit Serial No.' },
    { key: 'projectName', header: 'Project' },
    { key: 'carbonTonnes', header: 'Volume (tCO2e)', render: (r) => r.carbonTonnes.toLocaleString() },
    { key: 'pricePerTonne', header: 'Price/Tonne', render: (r) => `$${r.pricePerTonne.toFixed(2)}` },
    { key: 'totalPrice', header: 'Total Price', render: (r) => `$${r.totalPrice.toLocaleString()}` },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Marketplace"
        subtitle={`${listings.length} active listings available`}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={listings}
        onRowClick={(row) => navigate(`/marketplace/${row.id}`)}
        emptyMessage="No available listings found"
      />
    </div>
  );
}
