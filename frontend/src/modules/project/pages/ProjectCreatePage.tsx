import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../core/api/axios';
import PageLoader from '../../../components/PageLoader';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DocRow {
  name: string;
  url: string;
  type: string;
}

interface FormData {
  // Step 0 — Basic Info
  name: string;
  type: string;
  standard: string;
  description: string;
  // Step 1 — Location
  country: string;
  region: string;
  latitude: string;
  longitude: string;
  // Step 2 — Credits
  areaHectares: string;
  estimatedCredits: string;
  vintageStartYear: string;
  vintageEndYear: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROJECT_TYPES = [
  { value: 'REFORESTATION', label: 'Reforestation' },
  { value: 'SOLAR', label: 'Solar' },
  { value: 'WIND', label: 'Wind' },
  { value: 'METHANE', label: 'Methane Capture' },
  { value: 'REDD_PLUS', label: 'REDD+' },
  { value: 'OTHER', label: 'Other' },
];

const STANDARDS = [
  { value: 'VCS', label: 'VCS (Verra)' },
  { value: 'GOLD_STANDARD', label: 'Gold Standard' },
  { value: 'CAR', label: 'CAR' },
  { value: 'CDM', label: 'CDM' },
  { value: 'OTHER', label: 'Other' },
];

const DOC_TYPES = ['PDD', 'Validation Report', 'Methodology', 'Boundary Map', 'Other'];

const STEPS = ['Basic Info', 'Location', 'Credits', 'Documents', 'Review'];

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i < current
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : i === current
                  ? 'bg-white border-green-500 text-green-600'
                  : 'bg-white border-stone-200 text-stone-400'
              }`}
            >
              {i < current ? '✓' : i + 1}
            </div>
            <span
              className={`text-[10px] mt-1 font-medium ${
                i === current ? 'text-green-600' : i < current ? 'text-slate-700' : 'text-stone-400'
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`flex-1 h-0.5 mb-4 mx-1 transition-colors ${
                i < current ? 'bg-slate-900' : 'bg-stone-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Readiness sidebar ────────────────────────────────────────────────────────

function ReadinessSidebar({
  step,
  onSubmit,
  onSaveDraft,
  submitting,
}: {
  step: number;
  onSubmit: () => void;
  onSaveDraft: () => void;
  submitting: boolean;
}) {
  const checks = [
    { label: 'Basic Information', done: step > 0 },
    { label: 'Location Details', done: step > 1 },
    { label: 'Credit Estimation', done: step > 2 },
    { label: 'Required Documents', done: step > 3 },
  ];

  const readyCount = checks.filter((c) => c.done).length;
  const pct = Math.round((readyCount / checks.length) * 100);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 sticky top-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Submission Readiness</h3>
      <p className="text-xs text-stone-400 mb-4">{pct}% complete</p>

      {/* Progress bar */}
      <div className="h-1.5 bg-stone-100 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Checklist */}
      <ul className="space-y-2 mb-6">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-2 text-sm">
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                c.done ? 'bg-green-500 text-white' : 'bg-stone-100 text-stone-400'
              }`}
            >
              {c.done ? '✓' : '○'}
            </span>
            <span className={c.done ? 'text-slate-700' : 'text-stone-400'}>{c.label}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSubmit}
        disabled={step < 4 || submitting}
        className="btn-primary w-full mb-2"
      >
        {submitting ? 'Submitting…' : 'Submit for Verification'}
      </button>
      <button onClick={onSaveDraft} className="btn-secondary w-full text-sm">
        Save Draft & Exit
      </button>
    </div>
  );
}

// ─── Step forms ───────────────────────────────────────────────────────────────

function Step0({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="field-label mb-1.5 block">Project Name *</label>
        <input
          className="field"
          placeholder="e.g. Amazon Basin Reforestation"
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label mb-1.5 block">Project Type *</label>
          <select
            className="field"
            value={data.type}
            onChange={(e) => onChange('type', e.target.value)}
          >
            <option value="">Select type…</option>
            {PROJECT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label mb-1.5 block">Standard *</label>
          <select
            className="field"
            value={data.standard}
            onChange={(e) => onChange('standard', e.target.value)}
          >
            <option value="">Select standard…</option>
            {STANDARDS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="field-label mb-1.5 block">Description *</label>
        <textarea
          className="field resize-none"
          rows={5}
          placeholder="Describe the project, its goals, methodology, and expected impact..."
          value={data.description}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </div>
    </div>
  );
}

function Step1({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label mb-1.5 block">Country *</label>
          <input
            className="field"
            placeholder="e.g. Brazil"
            value={data.country}
            onChange={(e) => onChange('country', e.target.value)}
          />
        </div>
        <div>
          <label className="field-label mb-1.5 block">Region *</label>
          <input
            className="field"
            placeholder="e.g. Amazon Basin"
            value={data.region}
            onChange={(e) => onChange('region', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label mb-1.5 block">Latitude</label>
          <input
            className="field"
            type="number"
            step="any"
            placeholder="-3.4653"
            value={data.latitude}
            onChange={(e) => onChange('latitude', e.target.value)}
          />
        </div>
        <div>
          <label className="field-label mb-1.5 block">Longitude</label>
          <input
            className="field"
            type="number"
            step="any"
            placeholder="-62.2159"
            value={data.longitude}
            onChange={(e) => onChange('longitude', e.target.value)}
          />
        </div>
      </div>
      <p className="text-xs text-stone-400">
        Coordinates define the project centroid. A full geospatial boundary can be uploaded in
        documents.
      </p>
    </div>
  );
}

function Step2({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label mb-1.5 block">Area (Hectares)</label>
          <input
            className="field"
            type="number"
            min="0"
            step="0.01"
            placeholder="50000"
            value={data.areaHectares}
            onChange={(e) => onChange('areaHectares', e.target.value)}
          />
        </div>
        <div>
          <label className="field-label mb-1.5 block">Estimated Credits (tCO₂)</label>
          <input
            className="field"
            type="number"
            min="0"
            step="1"
            placeholder="120000"
            value={data.estimatedCredits}
            onChange={(e) => onChange('estimatedCredits', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label mb-1.5 block">Vintage Start Year</label>
          <input
            className="field"
            type="number"
            placeholder="2024"
            value={data.vintageStartYear}
            onChange={(e) => onChange('vintageStartYear', e.target.value)}
          />
        </div>
        <div>
          <label className="field-label mb-1.5 block">Vintage End Year</label>
          <input
            className="field"
            type="number"
            placeholder="2034"
            value={data.vintageEndYear}
            onChange={(e) => onChange('vintageEndYear', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function Step3({
  docs,
  onChange,
}: {
  docs: DocRow[];
  onChange: (docs: DocRow[]) => void;
}) {
  function addRow() {
    onChange([...docs, { name: '', url: '', type: 'PDD' }]);
  }

  function removeRow(i: number) {
    onChange(docs.filter((_, idx) => idx !== i));
  }

  function updateRow(i: number, field: keyof DocRow, value: string) {
    onChange(docs.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500">
        Upload links to project documents. A Project Design Document (PDD) is required for
        verification.
      </p>
      {docs.map((doc, i) => (
        <div key={i} className="flex gap-3 items-start">
          <div className="flex-1 grid grid-cols-3 gap-2">
            <input
              className="field text-sm"
              placeholder="Document name"
              value={doc.name}
              onChange={(e) => updateRow(i, 'name', e.target.value)}
            />
            <input
              className="field text-sm"
              placeholder="https://..."
              value={doc.url}
              onChange={(e) => updateRow(i, 'url', e.target.value)}
            />
            <select
              className="field text-sm"
              value={doc.type}
              onChange={(e) => updateRow(i, 'type', e.target.value)}
            >
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => removeRow(i)}
            className="mt-3 text-stone-400 hover:text-red-500 transition-colors text-sm"
          >
            ✕
          </button>
        </div>
      ))}
      <button onClick={addRow} className="btn-secondary text-sm">
        + Add Document
      </button>
    </div>
  );
}

function Step4({ data, docs }: { data: FormData; docs: DocRow[] }) {
  const rows: [string, string][] = [
    ['Project Name', data.name],
    ['Type', data.type],
    ['Standard', data.standard],
    ['Country', data.country],
    ['Region', data.region],
    ['Latitude', data.latitude || '—'],
    ['Longitude', data.longitude || '—'],
    ['Area (ha)', data.areaHectares || '—'],
    ['Est. Credits', data.estimatedCredits || '—'],
    ['Vintage', data.vintageStartYear && data.vintageEndYear
      ? `${data.vintageStartYear}–${data.vintageEndYear}`
      : '—'],
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label} className="border-b border-stone-100 last:border-0">
                <td className="py-2.5 px-4 text-stone-500 font-medium w-2/5">{label}</td>
                <td className="py-2.5 px-4 text-slate-900">{value || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <p className="field-label mb-2 block">Description</p>
        <p className="text-sm text-slate-700 whitespace-pre-wrap bg-stone-50 rounded-xl p-4 border border-stone-100">
          {data.description || '—'}
        </p>
      </div>
      {docs.length > 0 && (
        <div>
          <p className="field-label mb-2 block">Documents ({docs.length})</p>
          <ul className="space-y-1">
            {docs.map((d, i) => (
              <li key={i} className="text-sm text-slate-700 flex gap-2">
                <span className="text-stone-400">{d.type}</span>
                <span>{d.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Success screen ────────────────────────────────────────────────────────────

function SuccessScreen({ projectId }: { projectId: string }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
        <span className="text-3xl">✓</span>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Project Successfully Submitted!</h2>
      <p className="text-stone-500 text-sm max-w-sm mb-8">
        Your project has been submitted for verification. Our team of verifiers will review your
        submission and reach out if additional information is needed.
      </p>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 w-full max-w-sm mb-6 text-left">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
          What happens next
        </p>
        {[
          'Verifier assignment (1–2 business days)',
          'Document review & site assessment',
          'Verification report issued',
          'Registry approval & credit issuance',
        ].map((step, i) => (
          <div key={step} className="flex gap-3 items-start mb-3 last:mb-0">
            <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-500 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="text-sm text-slate-700">{step}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate(`/projects/${projectId}`)} className="btn-primary">
          View Project
        </button>
        <button onClick={() => navigate('/projects')} className="btn-secondary">
          All Projects
        </button>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

const EMPTY_FORM: FormData = {
  name: '',
  type: '',
  standard: '',
  description: '',
  country: '',
  region: '',
  latitude: '',
  longitude: '',
  areaHectares: '',
  estimatedCredits: '',
  vintageStartYear: '',
  vintageEndYear: '',
};

export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id?: string }>();
  const isEditMode = Boolean(editId);

  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [projectId, setProjectId] = useState<string | null>(editId ?? null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // In edit mode: fetch existing project and pre-populate all fields
  useEffect(() => {
    if (!editId) return;
    api
      .get(`/projects/${editId}`)
      .then((r) => {
        const p = r.data;
        setFormData({
          name: p.name ?? '',
          type: p.type ?? '',
          standard: p.standard ?? '',
          description: p.description ?? '',
          country: p.country === 'TBD' ? '' : (p.country ?? ''),
          region: p.region === 'TBD' ? '' : (p.region ?? ''),
          latitude: p.latitude != null ? String(p.latitude) : '',
          longitude: p.longitude != null ? String(p.longitude) : '',
          areaHectares: p.areaHectares != null ? String(p.areaHectares) : '',
          estimatedCredits: p.estimatedCredits != null ? String(p.estimatedCredits) : '',
          vintageStartYear: p.vintageStartYear != null ? String(p.vintageStartYear) : '',
          vintageEndYear: p.vintageEndYear != null ? String(p.vintageEndYear) : '',
        });
        setDocs(
          (p.documents ?? []).map((d: any) => ({
            name: d.name,
            url: d.url,
            type: d.type ?? 'Other',
          })),
        );
      })
      .catch(() => setError('Could not load project'))
      .finally(() => setInitialLoading(false));
  }, [editId]);

  if (initialLoading) return <PageLoader />;

  function setField(field: keyof FormData, value: string) {
    setFormData((f) => ({ ...f, [field]: value }));
  }

  function numOrUndef(v: string) {
    return v !== '' ? Number(v) : undefined;
  }

  async function handleNext() {
    setError('');
    setLoading(true);
    try {
      if (step === 0) {
        const body = {
          name: formData.name,
          type: formData.type,
          standard: formData.standard,
          description: formData.description,
          country: 'TBD',
          region: 'TBD',
        };
        if (isEditMode && projectId) {
          // Edit mode: PATCH instead of POST, keep existing projectId
          await api.patch(`/projects/${projectId}`, body);
        } else {
          const res = await api.post('/projects', body);
          setProjectId(res.data.id);
        }
      } else if (step === 1 && projectId) {
        await api.patch(`/projects/${projectId}`, {
          country: formData.country,
          region: formData.region,
          latitude: numOrUndef(formData.latitude),
          longitude: numOrUndef(formData.longitude),
        });
      } else if (step === 2 && projectId) {
        await api.patch(`/projects/${projectId}`, {
          areaHectares: numOrUndef(formData.areaHectares),
          estimatedCredits: numOrUndef(formData.estimatedCredits),
          vintageStartYear: numOrUndef(formData.vintageStartYear),
          vintageEndYear: numOrUndef(formData.vintageEndYear),
        });
      } else if (step === 3 && projectId) {
        for (const doc of docs) {
          if (doc.name && doc.url) {
            await api.post(`/projects/${projectId}/documents`, doc);
          }
        }
      }
      setStep((s) => s + 1);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!projectId) return;
    setError('');
    setLoading(true);
    try {
      await api.patch(`/projects/${projectId}/submit`);
      setIsSubmitted(true);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Submission failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDraft() {
    // In create mode, step 0 not yet saved → save it first
    if (!isEditMode && step === 0 && formData.name && formData.type && formData.standard && formData.description) {
      try {
        const res = await api.post('/projects', {
          name: formData.name,
          type: formData.type,
          standard: formData.standard,
          description: formData.description,
          country: 'TBD',
          region: 'TBD',
        });
        setProjectId(res.data.id);
      } catch {
        // navigate anyway
      }
    }
    // In edit mode data is already persisted after each Next — just navigate
    navigate(editId ? `/projects/${editId}` : '/projects');
  }

  if (isSubmitted && projectId) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <SuccessScreen projectId={projectId} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() =>
            step > 0
              ? setStep((s) => s - 1)
              : navigate(editId ? `/projects/${editId}` : '/projects')
          }
          className="text-sm text-stone-400 hover:text-slate-700 transition-colors"
        >
          ← {step > 0 ? 'Back' : isEditMode ? 'Back to Project' : 'Cancel'}
        </button>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">
          {isEditMode ? 'Edit Draft Project' : 'Register New Project'}
        </h1>
        <p className="text-sm text-stone-500">
          {isEditMode
            ? 'Update your draft and submit for verification when ready.'
            : 'Complete all steps to submit your project for verification.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <StepIndicator current={step} />

            <h2 className="text-base font-semibold text-slate-900 mb-5">
              Step {step + 1}: {STEPS[step]}
            </h2>

            {step === 0 && <Step0 data={formData} onChange={setField} />}
            {step === 1 && <Step1 data={formData} onChange={setField} />}
            {step === 2 && <Step2 data={formData} onChange={setField} />}
            {step === 3 && <Step3 docs={docs} onChange={setDocs} />}
            {step === 4 && <Step4 data={formData} docs={docs} />}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {step < 4 && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Saving…' : 'Next →'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <ReadinessSidebar
            step={step}
            onSubmit={handleSubmit}
            onSaveDraft={handleSaveDraft}
            submitting={loading && step === 4}
          />
        </div>
      </div>
    </div>
  );
}
