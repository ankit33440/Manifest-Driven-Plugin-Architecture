import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../core/api/axios';
import PageLoader from '../../../components/PageLoader';

interface Project {
  id: string;
  name: string;
  status: string;
  enrollment: string | null;
  protocol: string | null;
  protocolVersion: string | null;
  applicationYear: number | null;
  vintage: number | null;
  proposedCarbonCredits: number | null;
  averageAccrualRate: number | null;
  country: string | null;
  region: string | null;
  areaHectares: number | null;
  createdAt: string;
}

interface CreditBatch {
  id: string;
  creditVolume: number;
  serialNumberStart: string;
  serialNumberEnd: string;
  certificationNote: string | null;
  issuedAt: string;
}

interface HistoryEntry {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  changedAt: string;
}

export default function CertifierProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [batches, setBatches] = useState<CreditBatch[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [creditVolume, setCreditVolume] = useState('');
  const [serialStart, setSerialStart] = useState('');
  const [serialEnd, setSerialEnd] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [returning, setReturning] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [projectRes, historyRes, batchesRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/history`),
        api.get(`/certifier/projects/${id}/batches`),
      ]);
      setProject(projectRes.data);
      setHistory(historyRes.data);
      setBatches(batchesRes.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCertify() {
    if (!id) return;
    setSubmitting(true);
    try {
      await api.patch(`/certifier/projects/${id}/certify`, {
        creditVolume: Number(creditVolume),
        serialNumberStart: serialStart,
        serialNumberEnd: serialEnd,
        note,
      });
      setCreditVolume('');
      setSerialStart('');
      setSerialEnd('');
      setNote('');
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Certification failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReturn() {
    if (!id || !note.trim()) return;
    setReturning(true);
    try {
      await api.patch(`/certifier/projects/${id}/reject`, { note });
      setNote('');
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setReturning(false);
    }
  }

  if (loading) return <PageLoader />;

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Project not found.</p>
        <button onClick={() => navigate('/certifier/queue')} className="mt-4 text-sm text-stone-400 hover:text-slate-700">
          ← Back to Queue
        </button>
      </div>
    );
  }

  const canCertify = project.status === 'APPROVED';
  const formFilled = creditVolume && Number(creditVolume) >= 1 && serialStart && serialEnd && note.trim();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate('/certifier/queue')} className="text-sm text-stone-400 hover:text-slate-700 transition-colors">
        ← Back to Queue
      </button>

      {/* Banner */}
      <div className="rounded-2xl overflow-hidden border border-stone-200 bg-gradient-to-r from-teal-700 to-green-900 p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{project.name}</h1>
            <p className="text-teal-200 text-sm">
              {project.protocol ?? project.enrollment ?? '—'} · {project.id.slice(0, 8).toUpperCase()} · {project.country}
            </p>
          </div>
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700">
            {project.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Info grid */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Project Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            ['Enrollment', project.enrollment ?? '—'],
            ['Protocol', project.protocol ? `${project.protocol}${project.protocolVersion ? ` v${project.protocolVersion}` : ''}` : '—'],
            ['Country', project.country ?? '—'],
            ['Area', project.areaHectares ? `${Number(project.areaHectares).toLocaleString()} ha` : '—'],
            ['Proposed Credits', project.proposedCarbonCredits ? `${Number(project.proposedCarbonCredits).toLocaleString()} tCO₂` : '—'],
            ['Vintage', project.vintage ? String(project.vintage) : '—'],
            ['Application Year', project.applicationYear ? String(project.applicationYear) : '—'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-stone-100 bg-stone-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-0.5">{label}</p>
              <p className="text-sm font-medium text-slate-900 truncate">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Certification Form */}
      {canCertify && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Issue Certificate</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1">Credit Volume (tCO₂)</label>
              <input
                type="number"
                min="1"
                value={creditVolume}
                onChange={(e) => setCreditVolume(e.target.value)}
                placeholder="e.g. 10000"
                className="field w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1">Serial Number Start</label>
              <input
                type="text"
                value={serialStart}
                onChange={(e) => setSerialStart(e.target.value)}
                placeholder="e.g. NR-2024-001-0001"
                className="field w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1">Serial Number End</label>
              <input
                type="text"
                value={serialEnd}
                onChange={(e) => setSerialEnd(e.target.value)}
                placeholder="e.g. NR-2024-001-9999"
                className="field w-full text-sm"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-stone-500 mb-1">Certification Note (required)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Certification findings and notes…"
              rows={3}
              className="field w-full text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button
              disabled={!formFilled || submitting}
              onClick={handleCertify}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Issuing…' : 'Issue Certificate'}
            </button>
            <button
              disabled={!note.trim() || returning}
              onClick={handleReturn}
              className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 disabled:opacity-50 transition-colors"
            >
              {returning ? 'Returning…' : 'Return to Approved'}
            </button>
          </div>
        </section>
      )}

      {project.status === 'CERTIFIED' && (
        <section className="rounded-2xl border border-green-200 bg-green-50 p-5">
          <p className="text-sm font-semibold text-green-700">This project has been certified.</p>
        </section>
      )}

      {/* Existing Batches */}
      {batches.length > 0 && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Issued Credit Batches</h2>
          <div className="space-y-2">
            {batches.map((b) => (
              <div key={b.id} className="p-3 rounded-xl border border-stone-100 bg-stone-50">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-900">
                    {Number(b.creditVolume).toLocaleString()} tCO₂
                  </p>
                  <p className="text-xs text-stone-400">{new Date(b.issuedAt).toLocaleDateString()}</p>
                </div>
                <p className="text-xs text-stone-400">
                  {b.serialNumberStart} → {b.serialNumberEnd}
                </p>
                {b.certificationNote && (
                  <p className="text-xs text-stone-500 mt-1">{b.certificationNote}</p>
                )}
              </div>
            ))}
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
