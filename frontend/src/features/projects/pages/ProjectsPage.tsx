import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../../../api/projects';
import { useRole } from '../../../hooks/useRole';

export function ProjectsPage() {
  const navigate = useNavigate();
  const isDeveloper = useRole('PROJECT_DEVELOPER');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const { data: projects } = useQuery({
    queryKey: ['projects', status, type],
    queryFn: () => getProjects({ status: status || undefined, type: type || undefined }),
  });

  const stats = useMemo(() => {
    const allProjects = projects ?? [];
    const countByStatus = (key: string) => allProjects.filter((project: any) => project.status === key).length;
    return {
      total: allProjects.length,
      draft: countByStatus('DRAFT'),
      underReview: countByStatus('UNDER_REVIEW'),
      approved: countByStatus('APPROVED'),
      active: countByStatus('ACTIVE'),
    };
  }, [projects]);

  return (
    <div className="space-y-8">
      <section className="surface p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="field-label">Projects Developer</p>
            <h1 className="mt-3 text-6xl font-semibold tracking-[-0.06em] text-emerald-950">
              Projects
            </h1>
          </div>
          {isDeveloper ? (
            <button className="primary-button h-14 px-6 text-base" onClick={() => navigate('/projects/new')}>
              Register New Project
            </button>
          ) : null}
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-5">
          {[
            ['Total Projects', stats.total],
            ['Draft', stats.draft],
            ['Under Review', stats.underReview],
            ['Approved', stats.approved],
            ['Active', stats.active],
          ].map(([label, value]) => (
            <div key={String(label)} className="subtle-surface p-5">
              <p className="field-label">{label}</p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface p-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <input className="field" placeholder="Search by project name" />
          <select className="field" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'VERIFIED', 'CERTIFIED', 'ACTIVE', 'REJECTED'].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select className="field" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="">All types</option>
            {['REFORESTATION', 'SOLAR', 'WIND', 'METHANE', 'REDD_PLUS', 'OTHER'].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8 overflow-hidden rounded-[24px] border border-stone-200">
          <div className="grid grid-cols-[1.3fr_180px_180px_180px_120px] gap-4 bg-stone-50 px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            <span>Project</span>
            <span>Type</span>
            <span>Credits</span>
            <span>Created</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-stone-100 bg-white">
            {(projects ?? []).map((project: any) => (
              <button
                key={project.id}
                className="grid w-full grid-cols-[1.3fr_180px_180px_180px_120px] gap-4 px-6 py-5 text-left transition hover:bg-stone-50"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div>
                  <p className="text-lg font-semibold text-slate-900">{project.name}</p>
                  <p className="text-sm text-stone-500">{project.country || 'Location pending'}</p>
                </div>
                <span className="text-sm text-stone-600">{project.type}</span>
                <span className="text-sm text-stone-600">{Number(project.estimatedCredits ?? 0).toLocaleString()}</span>
                <span className="text-sm text-stone-600">{new Date(project.createdAt).toLocaleDateString()}</span>
                <span className="rounded-full bg-stone-100 px-3 py-2 text-center text-xs font-semibold text-stone-700">
                  {project.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
