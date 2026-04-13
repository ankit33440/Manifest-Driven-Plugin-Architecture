import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  approveProject,
  certifyProject,
  getProject,
  getProjectHistory,
  rejectProject,
  submitProject,
  verifyProject,
} from '../../../api/projects';
import { usePermission } from '../../../hooks/usePermission';
import { useRole } from '../../../hooks/useRole';

export function ProjectDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canApprove = usePermission('project:approve');
  const canVerify = usePermission('project:verify');
  const canCertify = usePermission('project:certify');
  const isDeveloper = useRole('PROJECT_DEVELOPER');

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
    enabled: Boolean(id),
  });
  const { data: history } = useQuery({
    queryKey: ['project-history', id],
    queryFn: () => getProjectHistory(id),
    enabled: Boolean(id),
  });

  const actionMutation = useMutation({
    mutationFn: (action: 'submit' | 'approve' | 'reject' | 'verify' | 'certify') => {
      if (action === 'submit') return submitProject(id);
      if (action === 'approve') return approveProject(id);
      if (action === 'reject') return rejectProject(id);
      if (action === 'verify') return verifyProject(id);
      return certifyProject(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project', id] });
      await queryClient.invalidateQueries({ queryKey: ['project-history', id] });
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  if (!project) {
    return <div className="surface p-8 text-stone-500">Loading project...</div>;
  }

  return (
    <div className="space-y-8">
      <section className="surface p-8">
        <button className="field-label text-emerald-700" onClick={() => navigate('/projects')}>
          Back to projects
        </button>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="field-label">Project Detail</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-slate-900">
              {project.name}
            </h1>
            <p className="mt-4 text-lg text-stone-500">{project.description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isDeveloper && project.status === 'DRAFT' ? (
              <button className="primary-button" onClick={() => actionMutation.mutate('submit')}>
                Submit
              </button>
            ) : null}
            {canApprove && (project.status === 'SUBMITTED' || project.status === 'UNDER_REVIEW') ? (
              <>
                <button className="secondary-button" onClick={() => actionMutation.mutate('reject')}>
                  Reject
                </button>
                <button className="primary-button" onClick={() => actionMutation.mutate('approve')}>
                  Approve
                </button>
              </>
            ) : null}
            {canVerify && project.status === 'APPROVED' ? (
              <button className="primary-button" onClick={() => actionMutation.mutate('verify')}>
                Verify
              </button>
            ) : null}
            {canCertify && project.status === 'VERIFIED' ? (
              <button className="primary-button" onClick={() => actionMutation.mutate('certify')}>
                Certify
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['Status', project.status],
            ['Type', project.type],
            ['Standard', project.standard],
            ['Credits', Number(project.estimatedCredits ?? 0).toLocaleString()],
            ['Country', project.country || '-'],
            ['Region', project.region || '-'],
            ['Vintage Start', project.vintageStartYear || '-'],
            ['Vintage End', project.vintageEndYear || '-'],
          ].map(([label, value]) => (
            <div key={String(label)} className="subtle-surface p-5">
              <p className="field-label">{label}</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface p-8">
          <p className="field-label">Status Timeline</p>
          <div className="mt-8 space-y-5">
            {(history ?? []).map((entry: any) => (
              <div key={entry.id} className="flex gap-4">
                <div className="mt-1 h-4 w-4 rounded-full bg-emerald-600" />
                <div>
                  <p className="text-lg font-semibold text-slate-900">{entry.toStatus}</p>
                  <p className="text-sm text-stone-500">
                    {new Date(entry.changedAt).toLocaleString()} by {entry.changedByUser.firstName}{' '}
                    {entry.changedByUser.lastName}
                  </p>
                  {entry.note ? <p className="mt-2 text-sm text-stone-600">{entry.note}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface p-8">
          <p className="field-label">Documents</p>
          <div className="mt-6 space-y-4">
            {project.documents.length ? (
              project.documents.map((document: any) => (
                <a
                  key={document.id}
                  className="block rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-slate-900"
                  href={document.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  <p className="font-semibold">{document.name}</p>
                  <p className="mt-1 text-stone-500">{document.type}</p>
                </a>
              ))
            ) : (
              <p className="text-stone-500">No documents uploaded yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
