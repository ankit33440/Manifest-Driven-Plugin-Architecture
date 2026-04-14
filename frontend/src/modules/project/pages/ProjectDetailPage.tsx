import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../core/api/axios';
import { useAuth } from '../../../core/auth/AuthContext';
import { getSectionsFor } from '../../../core/plugin-loader';
import PageLoader from '../../../components/PageLoader';
import VerifierReviewAction from '../components/VerifierReviewAction';
import CertifierAction from '../components/CertifierAction';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  status: string;
  projectProponent: string | null;
  startDate: string | null;
  enrollment: string | null;
  protocol: string | null;
  protocolVersion: string | null;
  applicationYear: number | null;
  vintage: number | null;
  proposedCarbonCredits: number | null;
  averageAccrualRate: number | null;
  geocodedAddress: string | null;
  country: string | null;
  region: string | null;
  areaHectares: number | null;
  developerId: string;
  assignedVerifierId: string | null;
  assignedCertifierId: string | null;
  documents: ProjectDocument[];
  createdAt: string;
}

interface ProjectDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

interface HistoryEntry {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedByUserId: string;
  note: string | null;
  changedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-stone-100 text-stone-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  INFO_REQUESTED: 'bg-orange-100 text-orange-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-600',
  VERIFIED: 'bg-teal-100 text-teal-700',
  CERTIFIED: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-green-100 text-green-700',
};

const LIFECYCLE = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'INFO_REQUESTED', 'APPROVED', 'VERIFIED', 'CERTIFIED'];
const LIFECYCLE_LABELS = ['Draft', 'Submitted', 'Under Review', 'Info Req.', 'Approved', 'Verified', 'Certified'];

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function InfoGrid({ project }: { project: Project }) {
  const rows: [string, string][] = [
    ['Enrollment', project.enrollment ?? '—'],
    ['Protocol', project.protocol ? `${project.protocol}${project.protocolVersion ? ` v${project.protocolVersion}` : ''}` : '—'],
    ['Country', project.country ?? '—'],
    ['Region', project.region ?? '—'],
    ['Area', project.areaHectares ? `${Number(project.areaHectares).toLocaleString()} ha` : '—'],
    ['Proposed Credits', project.proposedCarbonCredits ? `${Number(project.proposedCarbonCredits).toLocaleString()} tCO₂` : '—'],
    ['Vintage', project.vintage ? String(project.vintage) : '—'],
    ['Application Year', project.applicationYear ? String(project.applicationYear) : '—'],
    ['Accrual Rate', project.averageAccrualRate ? `${project.averageAccrualRate}%` : '—'],
    ['Created', new Date(project.createdAt).toLocaleDateString()],
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-stone-100 bg-stone-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">
            {label}
          </p>
          <p className="text-sm font-medium text-slate-900 truncate">{value}</p>
        </div>
      ))}
    </div>
  );
}

function StatusTimeline({
  project,
  history,
}: {
  project: Project;
  history: HistoryEntry[];
}) {
  const currentIdx = LIFECYCLE.indexOf(project.status);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-start gap-0 min-w-max">
        {LIFECYCLE.map((status, i) => {
          const histEntry = history.find((h) => h.toStatus === status);
          const isDone = i < currentIdx || project.status === status;
          const isCurrent = project.status === status;

          return (
            <React.Fragment key={status}>
              <div className="flex flex-col items-center w-24">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    project.status === 'REJECTED' && isCurrent
                      ? 'bg-red-500 border-red-500 text-white'
                      : isCurrent
                      ? 'bg-white border-green-500 text-green-600'
                      : isDone
                      ? 'bg-slate-800 border-slate-800 text-white'
                      : 'bg-white border-stone-200 text-stone-400'
                  }`}
                >
                  {isDone && !isCurrent ? '✓' : i + 1}
                </div>
                <p
                  className={`text-[10px] font-semibold mt-1 text-center ${
                    isCurrent ? 'text-green-600' : isDone ? 'text-slate-700' : 'text-stone-400'
                  }`}
                >
                  {LIFECYCLE_LABELS[i]}
                </p>
                {histEntry && (
                  <p className="text-[9px] text-stone-400 mt-0.5 text-center">
                    {new Date(histEntry.changedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              {i < LIFECYCLE.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mt-4 transition-colors ${
                    i < currentIdx ? 'bg-slate-800' : 'bg-stone-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function DocumentsList({ documents }: { documents: ProjectDocument[] }) {
  if (documents.length === 0) {
    return <p className="text-sm text-stone-400">No documents uploaded yet.</p>;
  }
  return (
    <ul className="space-y-2">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center justify-between p-3 rounded-xl border border-stone-100 bg-stone-50"
        >
          <div>
            <p className="text-sm font-medium text-slate-900">{doc.name}</p>
            <p className="text-xs text-stone-400">
              {doc.type} · {new Date(doc.uploadedAt).toLocaleDateString()}
            </p>
          </div>
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            View →
          </a>
        </li>
      ))}
    </ul>
  );
}

function HistoryTimeline({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-stone-400">No history yet.</p>;
  }
  return (
    <div className="space-y-3">
      {history.map((entry) => (
        <div key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
            <div className="w-px flex-1 bg-stone-200 mt-1" />
          </div>
          <div className="pb-3">
            <p className="text-sm text-slate-900 font-medium">
              {entry.fromStatus ? `${entry.fromStatus.replace(/_/g, ' ')} → ` : ''}
              {entry.toStatus.replace(/_/g, ' ')}
            </p>
            {entry.note && (
              <p className="text-xs text-stone-500 mt-0.5">{entry.note}</p>
            )}
            <p className="text-xs text-stone-400 mt-0.5">
              {new Date(entry.changedAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section components ───────────────────────────────────────────────────────

function SubmitAction({
  project,
  onUpdate,
}: {
  project: Project;
  onUpdate: () => void;
}) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = project.status === 'DRAFT';
  const isAwaitingReview = ['SUBMITTED', 'UNDER_REVIEW'].includes(project.status);
  const isInfoRequested = project.status === 'INFO_REQUESTED';

  async function handleSubmit() {
    if (!id) return;
    setSubmitting(true);
    try {
      await api.patch(`/projects/${id}/submit`);
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-4">Actions</h2>
      {canSubmit && (
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/projects/${project.id}/edit`)}
            className="btn-secondary"
          >
            Edit Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? 'Submitting…' : 'Submit for Verification →'}
          </button>
        </div>
      )}
      {isAwaitingReview && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold bg-amber-100 text-amber-700">
            Awaiting Reviewer Assignment
          </span>
          <p className="text-xs text-stone-400">Your project is in the review queue.</p>
        </div>
      )}
      {isInfoRequested && (
        <div className="space-y-3">
          <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold bg-orange-100 text-orange-700">
            Information Requested
          </span>
          <p className="text-xs text-stone-400 block">
            The reviewer has requested additional information. Update your project and re-submit.
          </p>
          <button
            onClick={() => navigate(`/projects/${project.id}/edit`)}
            className="btn-secondary"
          >
            Edit & Re-submit
          </button>
        </div>
      )}
      {!canSubmit && !isAwaitingReview && !isInfoRequested && (
        <p className="text-sm text-stone-400">No actions available at this stage.</p>
      )}
    </section>
  );
}

function ApprovalAction({
  project,
  onUpdate,
}: {
  project: Project;
  onUpdate: () => void;
}) {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState<'approve' | 'reject' | null>(null);

  async function handle(action: 'approve' | 'reject') {
    setSubmitting(action);
    try {
      await api.patch(`/projects/${project.id}/${action}`, { note: note || undefined });
      setNote('');
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(null);
    }
  }

  if (!['SUBMITTED', 'UNDER_REVIEW'].includes(project.status)) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Approval Decision</h2>
        <p className="text-sm text-stone-400">No pending decision required.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-4">Approval Decision</h2>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note…"
        rows={2}
        className="field w-full text-sm mb-4"
      />
      <div className="flex gap-3">
        <button
          disabled={submitting !== null}
          onClick={() => handle('approve')}
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {submitting === 'approve' ? 'Approving…' : 'Approve'}
        </button>
        <button
          disabled={submitting !== null}
          onClick={() => handle('reject')}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {submitting === 'reject' ? 'Rejecting…' : 'Reject'}
        </button>
      </div>
    </section>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([api.get(`/projects/${id}`), api.get(`/projects/${id}/history`)])
      .then(([projectRes, historyRes]) => {
        setProject(projectRes.data);
        setHistory(historyRes.data);
      })
      .catch(() => setError('Project not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageLoader />;

  if (error || !project) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">{error || 'Project not found'}</p>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 text-sm text-stone-400 hover:text-slate-700"
        >
          ← Back to Projects
        </button>
      </div>
    );
  }

  const sections = user ? getSectionsFor('ProjectDetailPage', user.role as any) : [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/projects')}
          className="text-sm text-stone-400 hover:text-slate-700 transition-colors"
        >
          ← Back to Projects
        </button>

        <div className="mt-3 rounded-2xl overflow-hidden border border-stone-200 bg-gradient-to-r from-green-700 to-emerald-900 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{project.name}</h1>
              <p className="text-green-200 text-sm">
                {project.protocol ?? project.enrollment ?? '—'} · {project.id.slice(0, 8).toUpperCase()} · {project.country}
              </p>
            </div>
            <StatusBadge status={project.status} />
          </div>
        </div>
      </div>

      {/* Manifest-driven sections */}
      {sections.map((section) => {
        switch (section.id) {
          case 'project-info':
            return (
              <section key={section.id}>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
                  Project Details
                </h2>
                <InfoGrid project={project} />
                {project.documents && project.documents.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-5">
                    <h2 className="text-sm font-semibold text-slate-900 mb-4">Documents</h2>
                    <DocumentsList documents={project.documents} />
                  </div>
                )}
              </section>
            );
          case 'submit-action':
            return <SubmitAction key={section.id} project={project} onUpdate={load} />;
          case 'approval-action':
            return <ApprovalAction key={section.id} project={project} onUpdate={load} />;
          case 'verifier-review-action':
            return <VerifierReviewAction key={section.id} project={project} onUpdate={load} />;
          case 'certifier-action':
            return <CertifierAction key={section.id} project={project} onUpdate={load} />;
          case 'project-timeline':
            return (
              <section key={section.id} className="rounded-2xl border border-stone-200 bg-white p-5">
                <h2 className="text-sm font-semibold text-slate-900 mb-5">Status Timeline</h2>
                <StatusTimeline project={project} history={history} />
                <div className="mt-6">
                  <h2 className="text-sm font-semibold text-slate-900 mb-4">Activity History</h2>
                  <HistoryTimeline history={history} />
                </div>
              </section>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
