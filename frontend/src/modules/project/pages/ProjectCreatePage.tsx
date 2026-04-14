import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import api from '../../../core/api/axios';
import PageLoader from '../../../components/PageLoader';

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

// ─── Zod schema ────────────────────────────────────────────────────────────────

function optionalNum(min?: number, max?: number, msg?: string) {
  return z.string().refine(
    (val) => {
      if (!val || val.trim() === '') return true;
      const n = Number(val);
      if (isNaN(n)) return false;
      if (min !== undefined && n < min) return false;
      if (max !== undefined && n > max) return false;
      return true;
    },
    {
      message:
        msg ??
        (min !== undefined && max !== undefined
          ? `Must be between ${min} and ${max}`
          : 'Must be a valid number'),
    },
  );
}

const schema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    type: z.string().min(1, 'Project type is required'),
    standard: z.string().min(1, 'Standard is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    country: z.string().min(1, 'Country is required'),
    region: z.string().min(1, 'Region is required'),
    latitude: optionalNum(-90, 90, 'Must be between -90 and 90'),
    longitude: optionalNum(-180, 180, 'Must be between -180 and 180'),
    areaHectares: optionalNum(0, undefined, 'Must be a positive number'),
    estimatedCredits: optionalNum(0, undefined, 'Must be a positive number'),
    vintageStartYear: optionalNum(1900, 2100, 'Enter a valid year (1900–2100)'),
    vintageEndYear: optionalNum(1900, 2100, 'Enter a valid year (1900–2100)'),
    documents: z
      .array(
        z.object({
          id: z.string().optional(),
          name: z.string(),
          url: z.string(),
          docType: z.string(),
        }),
      )
      .default([]),
  })
  .refine(
    (d) => {
      if (d.vintageStartYear && d.vintageEndYear) {
        return Number(d.vintageEndYear) >= Number(d.vintageStartYear);
      }
      return true;
    },
    { message: 'End year must be ≥ start year', path: ['vintageEndYear'] },
  );

type FormValues = z.infer<typeof schema>;

const EMPTY_DEFAULTS: FormValues = {
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
  documents: [],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="surface p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {hint && <p className="text-xs text-ink-muted mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-alert mt-1">{message}</p>;
}

function SuccessScreen({ projectId }: { projectId: string }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-full bg-status-approved-bg flex items-center justify-center mb-5">
        <CheckCircle2 size={32} className="text-status-approved-text" />
      </div>
      <h2 className="text-2xl font-bold text-ink mb-2">Project Submitted!</h2>
      <p className="text-sm text-ink-muted max-w-sm mb-8">
        Your project has been submitted for verification. Verifiers will review your submission and
        reach out if additional information is needed.
      </p>

      <div className="surface p-5 w-full max-w-sm mb-6 text-left">
        <p className="section-label mb-3">What happens next</p>
        {[
          'Verifier assignment (1–2 business days)',
          'Document review & site assessment',
          'Verification report issued',
          'Registry approval & credit issuance',
        ].map((step, i) => (
          <div key={step} className="flex gap-3 items-start mb-3 last:mb-0">
            <span className="w-5 h-5 rounded-full bg-canvas text-ink-muted text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
              {i + 1}
            </span>
            <span className="text-sm text-ink">{step}</span>
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

export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id?: string }>();
  const isEditMode = Boolean(editId);

  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [projectId, setProjectId] = useState<string | null>(editId ?? null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_DEFAULTS,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'documents' });

  // Load existing project in edit mode
  useEffect(() => {
    if (!editId) return;
    api
      .get(`/projects/${editId}`)
      .then((r) => {
        const p = r.data;
        reset({
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
          documents: (p.documents ?? []).map((d: any) => ({
            id: d.id,
            name: d.name,
            url: d.url,
            docType: d.type ?? 'Other',
          })),
        });
      })
      .catch(() => setApiError('Could not load project'))
      .finally(() => setInitialLoading(false));
  }, [editId, reset]);

  if (initialLoading) return <PageLoader />;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function numOrUndef(v: string) {
    return v !== '' ? Number(v) : undefined;
  }

  async function persistProject(values: FormValues, pid: string | null): Promise<string> {
    const body = {
      name: values.name,
      type: values.type,
      standard: values.standard,
      description: values.description,
      country: values.country || 'TBD',
      region: values.region || 'TBD',
      latitude: numOrUndef(values.latitude ?? ''),
      longitude: numOrUndef(values.longitude ?? ''),
      areaHectares: numOrUndef(values.areaHectares ?? ''),
      estimatedCredits: numOrUndef(values.estimatedCredits ?? ''),
      vintageStartYear: numOrUndef(values.vintageStartYear ?? ''),
      vintageEndYear: numOrUndef(values.vintageEndYear ?? ''),
    };

    let id = pid;
    if (id) {
      await api.patch(`/projects/${id}`, body);
    } else {
      const res = await api.post('/projects', body);
      id = res.data.id;
      setProjectId(id);
    }

    // POST only new documents (those without an id)
    const newDocs = values.documents.filter((d) => !d.id && d.name && d.url);
    for (const doc of newDocs) {
      await api.post(`/projects/${id}/documents`, {
        name: doc.name,
        url: doc.url,
        type: doc.docType,
      });
    }

    return id!;
  }

  async function handleSaveDraft() {
    const values = getValues();
    setApiError('');
    setSaving(true);
    try {
      await persistProject(values, projectId);
      navigate('/projects');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setApiError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  }

  const onSubmit = async (values: FormValues) => {
    setApiError('');
    setSubmitting(true);
    try {
      const id = await persistProject(values, projectId);
      await api.patch(`/projects/${id}/submit`);
      setIsSubmitted(true);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setApiError(Array.isArray(msg) ? msg.join(', ') : msg || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Readiness (watched values) ─────────────────────────────────────────────
  const [wName, wType, wStandard, wDescription, wCountry, wRegion] = watch([
    'name',
    'type',
    'standard',
    'description',
    'country',
    'region',
  ]);

  const basicDone =
    (wName?.length ?? 0) >= 3 && !!wType && !!wStandard && (wDescription?.length ?? 0) >= 10;
  const locationDone = !!wCountry && !!wRegion;

  const readinessItems = [
    { label: 'Basic Information', done: basicDone },
    { label: 'Location Details', done: locationDone },
    { label: 'Credit Estimation', done: true, optional: true },
    { label: 'Documents', done: true, optional: true },
  ];
  const requiredDone = [basicDone, locationDone].filter(Boolean).length;
  const pct = Math.round((requiredDone / 2) * 100);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isSubmitted && projectId) {
    return (
      <div className="page-container">
        <SuccessScreen projectId={projectId} />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(editId ? `/projects/${editId}` : '/projects')}
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mb-3"
        >
          <ArrowLeft size={15} />
          {isEditMode ? 'Back to Project' : 'Cancel'}
        </button>
        <h1 className="page-title">
          {isEditMode ? 'Edit Draft Project' : 'Register New Project'}
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          {isEditMode
            ? 'Update your draft and submit for verification when ready.'
            : 'Fill in the details below. Save as draft at any time, or submit when ready.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: form sections ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Section 1: Basic Information */}
            <FormSection title="Basic Information">
              <div className="space-y-4">
                <div>
                  <label className="field-label">Project Name *</label>
                  <input
                    {...register('name')}
                    className={`field mt-1 ${errors.name ? 'border-alert focus:ring-alert/20' : ''}`}
                    placeholder="e.g. Amazon Basin Reforestation Initiative"
                  />
                  <FieldError message={errors.name?.message} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">Project Type *</label>
                    <select
                      {...register('type')}
                      className={`field mt-1 ${errors.type ? 'border-alert focus:ring-alert/20' : ''}`}
                    >
                      <option value="">Select type…</option>
                      {PROJECT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <FieldError message={errors.type?.message} />
                  </div>

                  <div>
                    <label className="field-label">Standard *</label>
                    <select
                      {...register('standard')}
                      className={`field mt-1 ${errors.standard ? 'border-alert focus:ring-alert/20' : ''}`}
                    >
                      <option value="">Select standard…</option>
                      {STANDARDS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <FieldError message={errors.standard?.message} />
                  </div>
                </div>

                <div>
                  <label className="field-label">Description *</label>
                  <textarea
                    {...register('description')}
                    className={`field mt-1 resize-none ${errors.description ? 'border-alert focus:ring-alert/20' : ''}`}
                    rows={5}
                    placeholder="Describe the project, its goals, methodology, and expected environmental impact…"
                  />
                  <FieldError message={errors.description?.message} />
                </div>
              </div>
            </FormSection>

            {/* Section 2: Location */}
            <FormSection
              title="Location"
              hint="Coordinates define the project centroid. A full boundary can be uploaded in documents."
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">Country *</label>
                    <input
                      {...register('country')}
                      className={`field mt-1 ${errors.country ? 'border-alert focus:ring-alert/20' : ''}`}
                      placeholder="e.g. Brazil"
                    />
                    <FieldError message={errors.country?.message} />
                  </div>
                  <div>
                    <label className="field-label">Region *</label>
                    <input
                      {...register('region')}
                      className={`field mt-1 ${errors.region ? 'border-alert focus:ring-alert/20' : ''}`}
                      placeholder="e.g. Amazon Basin"
                    />
                    <FieldError message={errors.region?.message} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">Latitude</label>
                    <input
                      {...register('latitude')}
                      type="number"
                      step="any"
                      className={`field mt-1 ${errors.latitude ? 'border-alert focus:ring-alert/20' : ''}`}
                      placeholder="-3.4653"
                    />
                    <FieldError message={errors.latitude?.message} />
                  </div>
                  <div>
                    <label className="field-label">Longitude</label>
                    <input
                      {...register('longitude')}
                      type="number"
                      step="any"
                      className={`field mt-1 ${errors.longitude ? 'border-alert focus:ring-alert/20' : ''}`}
                      placeholder="-62.2159"
                    />
                    <FieldError message={errors.longitude?.message} />
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Section 3: Credit Estimation */}
            <FormSection title="Credit Estimation" hint="All fields in this section are optional.">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">Area (Hectares)</label>
                    <input
                      {...register('areaHectares')}
                      type="number"
                      min="0"
                      step="0.01"
                      className={`field mt-1 ${errors.areaHectares ? 'border-alert focus:ring-alert/20' : ''}`}
                      placeholder="50000"
                    />
                    <FieldError message={errors.areaHectares?.message} />
                  </div>
                  <div>
                    <label className="field-label">Estimated Credits (tCO₂)</label>
                    <input
                      {...register('estimatedCredits')}
                      type="number"
                      min="0"
                      step="1"
                      className={`field mt-1 ${errors.estimatedCredits ? 'border-alert focus:ring-alert/20' : ''}`}
                      placeholder="120000"
                    />
                    <FieldError message={errors.estimatedCredits?.message} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">Vintage Start Year</label>
                    <input
                      {...register('vintageStartYear')}
                      type="number"
                      className={`field mt-1 ${errors.vintageStartYear ? 'border-alert focus:ring-alert/20' : ''}`}
                      placeholder="2024"
                    />
                    <FieldError message={errors.vintageStartYear?.message} />
                  </div>
                  <div>
                    <label className="field-label">Vintage End Year</label>
                    <input
                      {...register('vintageEndYear')}
                      type="number"
                      className={`field mt-1 ${errors.vintageEndYear ? 'border-alert focus:ring-alert/20' : ''}`}
                      placeholder="2034"
                    />
                    <FieldError message={errors.vintageEndYear?.message} />
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Section 4: Documents */}
            <FormSection
              title="Supporting Documents"
              hint="A Project Design Document (PDD) is required for verification."
            >
              <div className="space-y-3">
                {fields.length === 0 && (
                  <p className="text-sm text-ink-faint py-2">No documents added yet.</p>
                )}

                {fields.map((field, i) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        {...register(`documents.${i}.name`)}
                        className="field text-sm"
                        placeholder="Document name"
                      />
                      <input
                        {...register(`documents.${i}.url`)}
                        className="field text-sm"
                        placeholder="https://…"
                      />
                      <select
                        {...register(`documents.${i}.docType`)}
                        className="field text-sm"
                      >
                        {DOC_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="mt-2.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-ink-faint hover:bg-canvas hover:text-alert transition-colors"
                      aria-label="Remove document"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => append({ name: '', url: '', docType: 'PDD' })}
                  className="btn-secondary text-sm inline-flex items-center gap-1.5 mt-1"
                >
                  <Plus size={14} />
                  Add Document
                </button>
              </div>
            </FormSection>

            {/* API error */}
            {apiError && (
              <div className="rounded-lg bg-status-rejected-bg border border-status-rejected-text/20 text-status-rejected-text text-sm px-4 py-3">
                {apiError}
              </div>
            )}
          </div>

          {/* ── Right: readiness sidebar ── */}
          <div className="lg:col-span-1">
            <div className="surface p-5 sticky top-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-ink">Submission Readiness</h3>
                <p className="text-xs text-ink-muted mt-0.5">{pct}% required fields complete</p>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-canvas rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Checklist */}
              <ul className="space-y-2.5">
                {readinessItems.map((item) => (
                  <li key={item.label} className="flex items-center gap-2.5">
                    {item.done ? (
                      <CheckCircle2 size={16} className="text-status-approved-text flex-shrink-0" />
                    ) : (
                      <Circle size={16} className="text-line-strong flex-shrink-0" />
                    )}
                    <span className={`text-sm ${item.done ? 'text-ink' : 'text-ink-muted'}`}>
                      {item.label}
                      {item.optional && (
                        <span className="text-xs text-ink-faint ml-1">(optional)</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2.5 pt-1">
                <button
                  type="submit"
                  disabled={submitting || saving}
                  className="btn-primary w-full"
                >
                  {submitting ? 'Submitting…' : 'Submit for Verification'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={saving || submitting}
                  className="btn-secondary w-full"
                >
                  {saving ? 'Saving…' : 'Save as Draft'}
                </button>
              </div>

              <p className="text-xs text-ink-faint">
                Draft saves your progress without validation. Submit triggers a full review.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
