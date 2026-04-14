import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../core/api/axios';
import { useAuth } from '../../../core/auth/AuthContext';
import PageLoader from '../../../components/PageLoader';
import ReviewChecklist from '../components/ReviewChecklist';

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  standard: string;
  country: string;
  region: string;
  areaHectares: number | null;
  estimatedCredits: number | null;
  vintageStartYear: number | null;
  vintageEndYear: number | null;
  assignedVerifierId: string | null;
  createdAt: string;
}

interface ProjectReview {
  id: string;
  methodologyCheck: boolean;
  boundaryCheck: boolean;
  additionalityCheck: boolean;
  permanenceCheck: boolean;
  reviewNote: string | null;
  outcome: string | null;
}

interface HistoryEntry {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedByUserId: string;
  note: string | null;
  changedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  INFO_REQUESTED: 'bg-orange-100 text-orange-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-600',
};

export default function VerifierProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [review, setReview] = useState<ProjectReview | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [checklistSaving, setChecklistSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [projectRes, historyRes, reviewRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/history`),
        api.get(`/verifier/projects/${id}/review`).catch(() => ({ data: null })),
      ]);
      setProject(projectRes.data);
      setHistory(historyRes.data);
      setReview(reviewRes.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleChecklistChange(key: string, value: boolean) {
    if (!id) return;
    setChecklistSaving(true);
    try {
      const res = await api.patch(`/verifier/projects/${id}/checklist`, { [key]: value });
      setReview(res.data);
    } catch {
      // silent
    } finally {
      setChecklistSaving(false);
    }
  }

  async function handleDecision(action: 'approve' | 'reject' | 'request-info') {
    if (!id || !note.trim()) return;
    setSubmitting(action);
    try {
      await api.patch(`/verifier/projects/${id}/${action}`, { note: note.trim() });
      setNote('');
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(null);
    }
  }

  async function handleClaim() {
    if (!id) return;
    setSubmitting('claim');
    try {
      await api.patch(`/verifier/projects/${id}/claim`);
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not claim project');
    } finally {
      setSubmitting(null);
    }
  }

  if (loading) return <PageLoader />;

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Project not found.</p>
        <button onClick={() => navigate('/verifier/queue')} className="mt-4 text-sm text-stone-400 hover:text-slate-700">
          ← Back to Queue
        </button>
      </div>
    );
  }

  const isMyClaim = project.assignedVerifierId === user?.id;
  const canReview = isMyClaim && project.status === 'UNDER_REVIEW';
  const canClaim = !project.assignedVerifierId && (project.status === 'SUBMITTED' || project.status === 'INFO_REQUESTED');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/verifier/queue')}
        className="text-sm text-stone-400 hover:text-slate-700 transition-colors"
      >
        ← Back to Queue
      </button>

      {/* Banner */}
      <div className="rounded-2xl overflow-hidden border border-stone-200 bg-gradient-to-r from-sky-700 to-blue-900 p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{project.name}</h1>
            <p className="text-blue-200 text-sm">
              {project.standard} · {project.id.slice(0, 8).toUpperCase()} · {project.country}
            </p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[project.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {project.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Info grid */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Project Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            ['Type', project.type.replace(/_/g, ' ')],
            ['Country', project.country],
            ['Region', project.region],
            ['Area', project.areaHectares ? `${Number(project.areaHectares).toLocaleString()} ha` : '—'],
            ['Est. Credits', project.estimatedCredits ? `${Number(project.estimatedCredits).toLocaleString()} tCO₂` : '—'],
            ['Vintage', project.vintageStartYear && project.vintageEndYear ? `${project.vintageStartYear}–${project.vintageEndYear}` : '—'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-stone-100 bg-stone-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">{label}</p>
              <p className="text-sm font-medium text-slate-900 truncate">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Claim action */}
      {canClaim && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Claim for Review</h2>
          <p className="text-sm text-stone-400 mb-4">This project is not yet assigned. Claim it to begin your review.</p>
          <button
            onClick={handleClaim}
            disabled={submitting === 'claim'}
            className="btn-primary"
          >
            {submitting === 'claim' ? 'Claiming…' : 'Claim Project'}
          </button>
        </section>
      )}

      {/* Claimed by another */}
      {project.assignedVerifierId && !isMyClaim && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold bg-amber-100 text-amber-700">
            Under review by another verifier
          </span>
        </section>
      )}

      {/* Checklist */}
      {isMyClaim && review && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Review Checklist</h2>
            {checklistSaving && <span className="text-xs text-stone-400">Saving…</span>}
          </div>
          <ReviewChecklist
            values={{
              methodologyCheck: review.methodologyCheck,
              boundaryCheck: review.boundaryCheck,
              additionalityCheck: review.additionalityCheck,
              permanenceCheck: review.permanenceCheck,
            }}
            onChange={canReview ? (key, val) => handleChecklistChange(key, val) : undefined}
            readOnly={!canReview}
          />
        </section>
      )}

      {/* Review Actions */}
      {canReview && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Review Decision</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a review note (required)…"
            rows={3}
            className="field w-full text-sm mb-4"
          />
          <div className="flex flex-wrap gap-3">
            <button
              disabled={!note.trim() || submitting !== null}
              onClick={() => handleDecision('approve')}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {submitting === 'approve' ? 'Approving…' : 'Approve'}
            </button>
            <button
              disabled={!note.trim() || submitting !== null}
              onClick={() => handleDecision('request-info')}
              className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 disabled:opacity-50 transition-colors"
            >
              {submitting === 'request-info' ? 'Sending…' : 'Request Information'}
            </button>
            <button
              disabled={!note.trim() || submitting !== null}
              onClick={() => handleDecision('reject')}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {submitting === 'reject' ? 'Rejecting…' : 'Reject'}
            </button>
          </div>
        </section>
      )}

      {/* Activity History */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Activity History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-stone-400">No history yet.</p>
        ) : (
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
                  {entry.note && <p className="text-xs text-stone-500 mt-0.5">{entry.note}</p>}
                  <p className="text-xs text-stone-400 mt-0.5">{new Date(entry.changedAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
