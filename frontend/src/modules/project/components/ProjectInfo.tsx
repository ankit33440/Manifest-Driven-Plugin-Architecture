import React from 'react';
import StatusBadge from '../../../components/StatusBadge';

interface ProjectInfoProps {
  project: {
    id: string;
    name: string;
    type: string;
    status: string;
    location: string;
    description: string;
    developerId: string;
    createdAt: string;
  };
}

export default function ProjectInfo({ project }: ProjectInfoProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Project Information</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</dt>
          <dd className="mt-1 text-sm text-gray-900 font-medium">{project.name}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</dt>
          <dd className="mt-1"><StatusBadge status={project.status} /></dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</dt>
          <dd className="mt-1 text-sm text-gray-900">{project.type.replace(/_/g, ' ')}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Location</dt>
          <dd className="mt-1 text-sm text-gray-900">{project.location}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</dt>
          <dd className="mt-1 text-sm text-gray-700 leading-relaxed">{project.description}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Project ID</dt>
          <dd className="mt-1 text-sm text-gray-500 font-mono">{project.id}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Created</dt>
          <dd className="mt-1 text-sm text-gray-900">{new Date(project.createdAt).toLocaleDateString()}</dd>
        </div>
      </dl>
    </div>
  );
}
