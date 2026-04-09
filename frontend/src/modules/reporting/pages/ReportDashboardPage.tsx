import React, { useEffect, useState } from 'react';
import api from '../../../core/api/axios';
import PageHeader from '../../../components/PageHeader';

export default function ReportDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Calling the endpoint guarded by ManifestRbacGuard
    api.get('/reports/monthly').then(r => setData(r.data));
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="Platform Reports" subtitle="Monthly Metrics Dashboard" />
      <div className="mt-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        {data ? JSON.stringify(data) : "Loading reports..."}
      </div>
    </div>
  );
}
