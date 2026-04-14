import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';
import {
  dashboardFooterCopy,
  developerActionItems,
  developerLedgerEntries,
  developerRecentUpdates,
  developerStats,
} from '../constants/developerDashboardData';
import DashboardActionCard from './developer-dashboard/DashboardActionCard';
import DashboardEmptyState from './developer-dashboard/DashboardEmptyState';
import DashboardLedgerTable from './developer-dashboard/DashboardLedgerTable';
import DashboardRecentUpdates from './developer-dashboard/DashboardRecentUpdates';
import DashboardStatCard from './developer-dashboard/DashboardStatCard';

interface Project {
  id: string;
}

export default function ProjectDeveloperDashboardV2() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/projects')
      .then((response) => setProjects(response.data))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f4f6f8] p-6">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1c2f39] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mx-auto flex w-full max-w-[1140px] flex-col">
        {projects.length === 0 ? (
          <>
            <DashboardEmptyState onRegisterProject={() => navigate('/projects/new')} />
            <footer className="mt-8 flex flex-col gap-2 px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b0b7bd] sm:flex-row sm:items-center sm:justify-between">
              <span>{dashboardFooterCopy}</span>
              <span>Privacy</span>
            </footer>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <h1 className="text-[24px] font-extrabold tracking-[-0.04em] text-[#204c41] sm:text-[25px]">
                  Projects Developer
                </h1>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate('/projects/new')}
                    className="inline-flex items-center justify-center rounded-[10px] bg-[#223843] px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-[#294754]"
                  >
                    Bulk Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/projects/new')}
                    className="inline-flex items-center justify-center rounded-[10px] bg-[#223843] px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-[#294754]"
                  >
                    + Register New Project
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {developerStats.map((stat) => (
                  <DashboardStatCard key={stat.id} stat={stat} />
                ))}
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
                <section>
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-[18px] font-bold text-[#2c3339]">
                      Actions Required
                    </h2>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center self-start rounded-[10px] bg-[#223843] px-5 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#294754] sm:self-auto"
                    >
                      View Pending Actions
                    </button>
                  </div>
                  <div className="space-y-3">
                    {developerActionItems.map((item) => (
                      <DashboardActionCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>

                <DashboardRecentUpdates items={developerRecentUpdates} />
              </div>

              <section className="pt-2">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-[18px] font-bold text-[#2c3339]">Ledger</h2>
                  <button
                    type="button"
                    className="text-[12px] font-semibold text-[#51606a] transition hover:text-[#22313a]"
                  >
                    View History
                  </button>
                </div>
                <DashboardLedgerTable items={developerLedgerEntries} />
              </section>

              <footer className="flex flex-col gap-2 px-1 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b0b7bd] sm:flex-row sm:items-center sm:justify-between">
                <span>{dashboardFooterCopy}</span>
                <span>Privacy</span>
              </footer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
