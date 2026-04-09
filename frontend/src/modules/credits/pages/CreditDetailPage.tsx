import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';
import PageHeader from '../../../components/PageHeader';
import StatusBadge from '../../../components/StatusBadge';
import PageLoader from '../../../components/PageLoader';
import { useAuth } from '../../../core/auth/AuthContext';

interface Credit {
  id: string;
  serialNumber: string;
  projectId: string;
  projectName: string;
  carbonTonnes: number;
  status: string;
  vintageYear: number;
  issuedAt: string;
}

export default function CreditDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [credit, setCredit] = useState<Credit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/credits/${id}`)
      .then((r) => setCredit(r.data))
      .catch(() => setError('Credit not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRetire = async () => {
    try {
      setLoading(true);
      await api.patch(`/credits/${id}/retire`);
      const { data } = await api.get(`/credits/${id}`);
      setCredit(data);
    } catch (err) {
      setError('Failed to retire credit');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error || !credit) return <div className="p-6 text-red-500">{error}</div>;

  const canRetire = user?.role === 'SUPERADMIN' || user?.role === 'PROJECT_DEVELOPER';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={credit.serialNumber}
        subtitle="Credit Details"
        onBack={() => navigate('/credits')}
        action={
          canRetire && credit.status === 'ACTIVE' ? (
            <button
              onClick={handleRetire}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retire Credit
            </button>
          ) : undefined
        }
      />
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <StatusBadge status={credit.status} />
          <span className="text-gray-500 text-sm">Issued to Project: <span className="font-medium text-gray-900">{credit.projectName}</span></span>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-sm text-gray-500">Volume</p>
            <p className="font-semibold text-lg">{credit.carbonTonnes.toLocaleString()} tCO2e</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Vintage</p>
            <p className="font-semibold text-lg">{credit.vintageYear}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Issue Date</p>
            <p className="font-semibold text-lg">{new Date(credit.issuedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
