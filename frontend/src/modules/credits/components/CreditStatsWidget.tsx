import React, { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';
import StatCard from '../../../components/StatCard';
import api from '../../../core/api/axios';

export default function CreditStatsWidget() {
  const [stats, setStats] = useState({ active: 0, pending: 0, retired: 0 });

  useEffect(() => {
    api.get('/credits').then((r) => {
      const credits: any[] = r.data;
      const t = { active: 0, pending: 0, retired: 0 };
      credits.forEach(c => {
        if (c.status === 'ACTIVE') t.active += c.carbonTonnes;
        if (c.status === 'PENDING') t.pending += c.carbonTonnes;
        if (c.status === 'RETIRED') t.retired += c.carbonTonnes;
      });
      setStats(t);
    }).catch(console.error);
  }, []);

  return (
    <StatCard
      label="Active Credits"
      value={stats.active.toLocaleString()}
      icon={<Leaf size={24} className="text-green-600" />}
      trend={`${stats.retired.toLocaleString()} retired · ${stats.pending.toLocaleString()} pending`}
    />
  );
}
