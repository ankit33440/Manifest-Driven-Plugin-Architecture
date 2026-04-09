import React, { useState } from 'react';
import api from '../../../core/api/axios';
import { ShoppingCart } from 'lucide-react';

export default function BuyAction({ listingId, onPurchased }: { listingId: string; onPurchased: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBuy = async () => {
    try {
      setLoading(true);
      setError('');
      await api.post(`/marketplace/listings/${listingId}/buy`);
      onPurchased();
    } catch (err) {
      setError('Failed to purchase listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h3 className="font-semibold text-blue-900 flex items-center gap-2">
          <ShoppingCart size={20} /> Purchase Credits
        </h3>
        <p className="text-blue-700 text-sm mt-1">Complete the transaction to acquire these carbon credits.</p>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>
      <button
        onClick={handleBuy}
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap disabled:opacity-50"
      >
        {loading ? 'Purchasing...' : 'Buy Now'}
      </button>
    </div>
  );
}
