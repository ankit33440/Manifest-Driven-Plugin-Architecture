import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';
import PageHeader from '../../../components/PageHeader';
import StatusBadge from '../../../components/StatusBadge';
import PageLoader from '../../../components/PageLoader';
import { useAuth } from '../../../core/auth/AuthContext';
import { getSectionsFor } from '../../../core/plugin-loader';
import BuyAction from '../components/BuyAction';

interface Listing {
  id: string;
  serialNumber: string;
  projectName: string;
  carbonTonnes: number;
  pricePerTonne: number;
  totalPrice: number;
  status: string;
  sellerId: string;
  listedAt: string;
}

export default function MarketplaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchListing = () => {
    setLoading(true);
    api.get(`/marketplace/listings/${id}`)
      .then((r) => setListing(r.data))
      .catch(() => setError('Listing not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  if (loading) return <PageLoader />;
  if (error || !listing) return <div className="p-6 text-red-500">{error}</div>;

  const sections = user ? getSectionsFor('MarketDetailPage', user.role) : [];
  const showBuyAction = sections.some((s) => s.id === 'buy-action') && listing.status === 'AVAILABLE';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={`Listing: ${listing.serialNumber}`}
        subtitle="Marketplace Application"
        onBack={() => navigate('/marketplace')}
      />
      
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <StatusBadge status={listing.status} />
          <span className="text-gray-500 text-sm">Listed Project: <span className="font-medium text-gray-900">{listing.projectName}</span></span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-500">Volume</p>
            <p className="font-semibold text-lg">{listing.carbonTonnes.toLocaleString()} tCO2e</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Price / Tonne</p>
            <p className="font-semibold text-lg">${listing.pricePerTonne.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Price</p>
            <p className="font-semibold text-lg">${listing.totalPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Listed At</p>
            <p className="font-semibold text-lg">{new Date(listing.listedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      {showBuyAction && <BuyAction listingId={listing.id} onPurchased={fetchListing} />}
    </div>
  );
}
