import React, { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';
import api from '../../../core/api/axios';
import StatCard from '../../../components/StatCard';
import PageLoader from '../../../components/PageLoader';

interface Project {
  id: string;
  status: string;
}

export default function ProjectStatsWidget() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects')
      .then((r) => setProjects(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const total = projects.length;
  const submitted = projects.filter((p) => p.status === 'SUBMITTED').length;
  const approved = projects.filter((p) => p.status === 'APPROVED').length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Layers size={18} className="text-blue-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">Projects Overview</h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{submitted}</p>
          <p className="text-xs text-gray-500 mt-0.5">Submitted</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{approved}</p>
          <p className="text-xs text-gray-500 mt-0.5">Approved</p>
        </div>
      </div>
    </div>
  );
}
