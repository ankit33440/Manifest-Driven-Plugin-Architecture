import React from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import ProjectStatusBadge from './ProjectStatusBadge';

export interface DeveloperProject {
  id: string;
  name: string;
  status: string;
  enrollment: string | null;
  country: string | null;
  region: string | null;
  proposedCarbonCredits: number | null;
  createdAt: string;
}

interface ProjectOverviewListProps {
  projects: DeveloperProject[];
  onOpenProject: (projectId: string) => void;
}

export default function ProjectOverviewList({
  projects,
  onOpenProject,
}: ProjectOverviewListProps) {
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <button
          key={project.id}
          type="button"
          onClick={() => onOpenProject(project.id)}
          className="group w-full rounded-[22px] border border-[#e8ecef] bg-[#fbfcfc] p-5 text-left transition hover:border-[#cfd8dd] hover:bg-white hover:shadow-[0_14px_28px_rgba(15,23,42,0.05)]"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>
                <ProjectStatusBadge status={project.status} />
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {project.enrollment ?? '—'}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} />
                  {project.country}{project.region ? `, ${project.region}` : ''}
                </span>
                <span>
                  {project.proposedCarbonCredits != null
                    ? `${Number(project.proposedCarbonCredits).toLocaleString()} tCO₂`
                    : 'Credits pending'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1c2f39]">
              View
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
