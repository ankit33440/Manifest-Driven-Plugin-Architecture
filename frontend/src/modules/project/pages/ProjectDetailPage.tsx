import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../core/api/axios';
import { useAuth } from '../../../core/auth/AuthContext';
import PageLoader from '../../../components/PageLoader';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  standard: string;
  country: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  areaHectares: number | null;
  estimatedCredits: number | null;
  vintageStartYear: number | null;
  vintageEndYear: number | null;
  developerId: string;
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
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-600',
  VERIFIED: 'bg-teal-100 text-teal-700',
  CERTIFIED: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-green-100 text-green-700',
};

const LIFECYCLE = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'VERIFIED', 'CERTIFIED'];
const LIFECYCLE_LABELS = ['Draft', 'Submitted', 'Under Review', 'Approved', 'Verified', 'Certified'];

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
    ['Type', project.type.replace(/_/g, ' ')],
    ['Standard', project.standard],
    ['Country', project.country],
    ['Region', project.region],
    ['Area', project.areaHectares ? `${Number(project.areaHectares).toLocaleString()} ha` : '—'],
    ['Est. Credits', project.estimatedCredits ? `${Number(project.estimatedCredits).toLocaleString()} tCO₂` : '—'],
    [
      'Vintage Period',
      project.vintageStartYear && project.vintageEndYear
        ? `${project.vintageStartYear}–${project.vintageEndYear}`
        : '—',
    ],
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
          const isRejected = project.status === 'REJECTED' && i === currentIdx;

          return (
            <React.Fragment key={status}>
              <div className="flex flex-col items-center w-28">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    isRejected
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  async function handleSubmit() {
    if (!id) return;
    setSubmitting(true);
    try {
      await api.patch(`/projects/${id}/submit`);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

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

  const isDeveloper = user?.role === 'PROJECT_DEVELOPER';
  const canSubmit = isDeveloper && project.status === 'DRAFT';
  const isAwaitingReview = ['SUBMITTED', 'UNDER_REVIEW'].includes(project.status);

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

        {/* Forest gradient banner */}
        <div className="mt-3 rounded-2xl overflow-hidden border border-stone-200 bg-gradient-to-r from-green-700 to-emerald-900 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{project.name}</h1>
              <p className="text-green-200 text-sm">
                {project.standard} · {project.id.slice(0, 8).toUpperCase()} · {project.country}
              </p>
            </div>
            <StatusBadge status={project.status} />
          </div>
        </div>
      </div>

      {/* Info grid */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
          Project Details
        </h2>
        <InfoGrid project={project} />
      </section>

      {/* Status timeline */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-5">Status Timeline</h2>
        <StatusTimeline project={project} history={history} />
      </section>

      {/* Documents */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Documents</h2>
        <DocumentsList documents={project.documents ?? []} />
      </section>

      {/* History log */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Activity History</h2>
        <HistoryTimeline history={history} />
      </section>

      {/* Actions */}
      {isDeveloper && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Actions</h2>
          {canSubmit && (
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/projects/${id}/edit`)}
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
              <p className="text-xs text-stone-400">
                Your project is in the review queue.
              </p>
            </div>
          )}
          {!canSubmit && !isAwaitingReview && (
            <p className="text-sm text-stone-400">No actions available at this stage.</p>
          )}
        </section>
      )}
    </div>
  );
}
