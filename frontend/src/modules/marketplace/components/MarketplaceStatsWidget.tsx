import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import StatCard from '../../../components/StatCard';
import api from '../../../core/api/axios';

export default function MarketplaceStatsWidget() {
  const [stats, setStats] = useState({ available: 0, sold: 0, volume: 0 });

  useEffect(() => {
    api.get('/marketplace/listings').then((r) => {
      const listings: any[] = r.data;
      let available = 0;
      let sold = 0;
      let volume = 0;
      listings.forEach(l => {
        if (l.status === 'AVAILABLE') {
          available++;
          volume += l.carbonTonnes;
        }
        if (l.status === 'SOLD') sold++;
      });
      setStats({ available, sold, volume });
    }).catch(console.error);
  }, []);

  return (
    <StatCard
      label="Marketplace Listings"
      value={stats.available.toString()}
      icon={<ShoppingCart size={24} className="text-blue-600" />}
      trend={`${stats.sold} listed items sold · ${stats.volume.toLocaleString()} tCO2e available`}
    />
  );
}
