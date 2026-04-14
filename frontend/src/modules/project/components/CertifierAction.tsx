import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  status: string;
}

interface Props {
  project: Project;
  onUpdate: () => void;
}

export default function CertifierAction({ project }: Props) {
  const navigate = useNavigate();

  if (project.status === 'APPROVED') {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Certification</h2>
        <p className="text-sm text-stone-400 mb-4">This project has been approved and is ready for certification.</p>
        <button
          onClick={() => navigate(`/certifier/projects/${project.id}`)}
          className="btn-primary"
        >
          Open Certification Form →
        </button>
      </section>
    );
  }

  if (project.status === 'CERTIFIED') {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Certification</h2>
        <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700">
          Certified
        </span>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-3">Certification</h2>
      <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold bg-stone-100 text-stone-500">
        {project.status.replace(/_/g, ' ')} — not yet ready for certification
      </span>
    </section>
  );
}
