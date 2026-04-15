import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, ArrowLeft, CheckCircle2, Circle, MapPin } from 'lucide-react';
import ConfirmModal from '../../../components/common/ConfirmModal';
import api from '../../../core/api/axios';
import PageLoader from '../../../components/PageLoader';

// ─── Zod schema ────────────────────────────────────────────────────────────────

function optionalInt(min?: number, max?: number) {
  return z.string().refine(
    (v) => {
      if (!v || v.trim() === '') return true;
      const n = Number(v);
      return Number.isInteger(n) && (min === undefined || n >= min) && (max === undefined || n <= max);
    },
    { message: min !== undefined && max !== undefined ? `Must be a whole number between ${min}–${max}` : 'Must be a whole number' },
  );
}

function optionalDecimal(min?: number) {
  return z.string().refine(
    (v) => {
      if (!v || v.trim() === '') return true;
      const n = Number(v);
      return !isNaN(n) && (min === undefined || n >= min);
    },
    { message: 'Must be a valid number' },
  );
}

const schema = z.object({
  name:               z.string().min(3, 'At least 3 characters'),
  projectProponent:   z.string().optional(),
  startDate:          z.string().optional(),
  geocodedAddress:    z.string().min(1, 'Location is required'),
  enrollment:         z.string().optional(),
  protocol:           z.string().optional(),
  protocolVersion:    z.string().optional(),
  applicationYear:    optionalInt(1900, 2030),
  vintage:            optionalInt(1900, 2030),
  proposedCarbonCredits: optionalDecimal(0),
  averageAccrualRate: optionalDecimal(0),
  description:        z.string().min(10, 'At least 10 characters'),
  documents: z.array(
    z.object({
      id:      z.string().optional(),
      name:    z.string(),
      url:     z.string(),
      docType: z.string(),
    }),
  ),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  name: '', projectProponent: '', startDate: '', geocodedAddress: '',
  enrollment: '', protocol: '', protocolVersion: '',
  applicationYear: '', vintage: '', proposedCarbonCredits: '', averageAccrualRate: '',
  description: '', documents: [],
};

const DOC_TYPES = ['PDD', 'Validation Report', 'Methodology', 'Boundary Map', 'Other'];

// ─── Field helpers ─────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-alert mt-1">{message}</p>;
}

function mapBackendMessageToField(message: string): keyof FormValues | null {
  const normalized = message.toLowerCase();

  if (normalized.includes('projectproponent') || normalized.includes('project proponent')) return 'projectProponent';
  if (normalized.includes('startdate') || normalized.includes('start date')) return 'startDate';
  if (normalized.includes('geocodedaddress') || normalized.includes('location')) return 'geocodedAddress';
  if (normalized.includes('protocolversion') || normalized.includes('protocol version')) return 'protocolVersion';
  if (normalized.includes('protocol')) return 'protocol';
  if (normalized.includes('applicationyear') || normalized.includes('application year')) return 'applicationYear';
  if (normalized.includes('vintage')) return 'vintage';
  if (normalized.includes('proposedcarboncredits') || normalized.includes('proposed carbon credits')) return 'proposedCarbonCredits';
  if (normalized.includes('averageaccrualrate') || normalized.includes('average accrual rate')) return 'averageAccrualRate';
  if (normalized.includes('description')) return 'description';
  if (normalized.includes('enrollment')) return 'enrollment';
  if (normalized.includes('name')) return 'name';

  return null;
}

function FieldWrapper({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="field-label">
        {label}
        {required && <span className="text-alert ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Success screen ────────────────────────────────────────────────────────────

function SuccessScreen({ projectId }: { projectId: string }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-14 h-14 rounded-full bg-status-approved-bg flex items-center justify-center mb-5">
        <CheckCircle2 size={28} className="text-status-approved-text" />
      </div>
      <h2 className="text-2xl font-bold text-ink mb-2">Project Successfully Submitted!</h2>
      <p className="text-sm text-ink-muted max-w-sm mb-8">
        Your environmental asset has been recorded in the Living Ledger. We are now entering the
        verification phase to validate your ecological impact.
      </p>
      <div className="flex gap-3">
        <button onClick={() => navigate(`/projects/${projectId}`)} className="btn-primary">
          View Submission
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
  const [projectStatus, setProjectStatus] = useState<string | null>(editId ? null : 'DRAFT');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');
  const [backendFieldErrors, setBackendFieldErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [discarding, setDiscarding] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    watch,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: EMPTY,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'documents' });

  useEffect(() => {
    const subscription = watch(() => {
      if (Object.keys(backendFieldErrors).length > 0) {
        setBackendFieldErrors({});
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, backendFieldErrors]);

  // ── Load existing project in edit mode ─────────────────────────────────────

  useEffect(() => {
    if (!editId) return;
    api
      .get(`/projects/${editId}`)
      .then((r) => {
        const p = r.data;
        setProjectStatus(p.status ?? 'DRAFT');
        reset({
          name:               p.name ?? '',
          projectProponent:   p.projectProponent ?? '',
          startDate:          p.startDate ? p.startDate.slice(0, 10) : '',
          geocodedAddress:    p.geocodedAddress ?? '',
          enrollment:         p.enrollment ?? '',
          protocol:           p.protocol ?? '',
          protocolVersion:    p.protocolVersion ?? '',
          applicationYear:    p.applicationYear != null ? String(p.applicationYear) : '',
          vintage:            p.vintage != null ? String(p.vintage) : '',
          proposedCarbonCredits: p.proposedCarbonCredits != null ? String(p.proposedCarbonCredits) : '',
          averageAccrualRate: p.averageAccrualRate != null ? String(p.averageAccrualRate) : '',
          description:        p.description ?? '',
          documents: (p.documents ?? []).map((d: any) => ({
            id: d.id, name: d.name, url: d.url, docType: d.type ?? 'Other',
          })),
        });
      })
      .catch(() => setApiError('Could not load project'))
      .finally(() => setInitialLoading(false));
  }, [editId, reset]);

  if (initialLoading) return <PageLoader />;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function numOrUndef(v: string | undefined) {
    return v && v.trim() !== '' ? Number(v) : undefined;
  }

  function applyBackendError(rawMessage: unknown, fallbackMessage: string) {
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : typeof rawMessage === 'string'
        ? rawMessage
        : fallbackMessage;

    const field = mapBackendMessageToField(message);
    if (field) {
      setBackendFieldErrors({ [field]: message });
      setApiError('');
      setFocus(field);
      return;
    }

    setBackendFieldErrors({});
    setApiError(message);
  }

  function resetFormState() {
    reset(EMPTY);
    setProjectId(null);
    setProjectStatus('DRAFT');
    setIsSubmitted(false);
    setApiError('');
    setBackendFieldErrors({});
  }

  const hasSavedDraft = Boolean(projectId) && projectStatus === 'DRAFT' && !isSubmitted;
  const discardDisabled = submitting || saving || discarding || isSubmitted;
  const discardMessage = hasSavedDraft
    ? 'This will delete your saved draft and reset the form.'
    : 'All unsaved changes will be lost.';

  async function persistProject(values: FormValues, pid: string | null): Promise<string> {
    const body = {
      name:               values.name,
      description:        values.description,
      projectProponent:   values.projectProponent || undefined,
      startDate:          values.startDate || undefined,
      geocodedAddress:    values.geocodedAddress,
      enrollment:         values.enrollment || undefined,
      protocol:           values.protocol || undefined,
      protocolVersion:    values.protocolVersion || undefined,
      applicationYear:    numOrUndef(values.applicationYear),
      vintage:            numOrUndef(values.vintage),
      proposedCarbonCredits: numOrUndef(values.proposedCarbonCredits),
      averageAccrualRate: numOrUndef(values.averageAccrualRate),
    };

    let id = pid;
    if (id) {
      await api.patch(`/projects/${id}`, body);
    } else {
      const res = await api.post('/projects', body);
      id = res.data.id;
      setProjectId(id);
      setProjectStatus(res.data.status ?? 'DRAFT');
    }

    const newDocs = values.documents.filter((d) => !d.id && d.name && d.url);
    for (const doc of newDocs) {
      await api.post(`/projects/${id}/documents`, { name: doc.name, url: doc.url, type: doc.docType });
    }

    return id!;
  }

  async function handleSaveDraft() {
    setApiError('');
    setBackendFieldErrors({});
    setSaving(true);
    try {
      await persistProject(getValues(), projectId);
      navigate('/projects');
    } catch (err: any) {
      applyBackendError(err.response?.data?.message, 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  }

  const onSubmit = async (values: FormValues) => {
    setApiError('');
    setBackendFieldErrors({});
    setSubmitting(true);
    try {
      const id = await persistProject(values, projectId);
      await api.patch(`/projects/${id}/submit`);
      setProjectStatus('SUBMITTED');
      setIsSubmitted(true);
    } catch (err: any) {
      applyBackendError(err.response?.data?.message, 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  function handleDiscardClick() {
    if (discardDisabled) return;
    setDiscardModalOpen(true);
  }

  function handleDiscardCancel() {
    if (discarding) return;
    setDiscardModalOpen(false);
  }

  async function handleDiscardConfirm() {
    if (discarding) return;

    setDiscarding(true);
    setApiError('');

    try {
      if (hasSavedDraft && projectId) {
        await api.delete(`/projects/draft/${projectId}`);
      }

      resetFormState();
      setDiscardModalOpen(false);
      navigate('/projects');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setDiscardModalOpen(false);
      setApiError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to discard submission');
    } finally {
      setDiscarding(false);
    }
  }

  // ── Readiness ──────────────────────────────────────────────────────────────

  const [wName, wGeo, wDesc, wDocs] = watch(['name', 'geocodedAddress', 'description', 'documents']);
  const basicDone = (wName?.length ?? 0) >= 3 && (wDesc?.length ?? 0) >= 10;
  const geoBoundaryDone = (wGeo?.length ?? 0) > 0;
  const docsDone = (wDocs?.length ?? 0) > 0;
  const pct = Math.round(([basicDone, geoBoundaryDone].filter(Boolean).length / 2) * 100);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isSubmitted && projectId) {
    return <div className="page-container"><SuccessScreen projectId={projectId} /></div>;
  }

  const err = (field: keyof FormValues) =>
    (errors[field]?.message as string | undefined) ?? backendFieldErrors[field];
  const cls = (field: keyof typeof errors) =>
    `field mt-1 ${
      errors[field] || backendFieldErrors[field as keyof FormValues]
        ? 'border-alert bg-alert/5 focus:border-alert focus:ring-alert/20'
        : ''
    }`;

  return (
    <div className="page-container">
      <ConfirmModal
        open={discardModalOpen}
        title="Discard changes?"
        message={discardMessage}
        onCancel={handleDiscardCancel}
        onConfirm={handleDiscardConfirm}
        confirmLabel="Confirm Discard"
        cancelLabel="Cancel"
        loading={discarding}
      />

      {/* Page header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(editId ? `/projects/${editId}` : '/projects')}
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mb-3"
        >
          <ArrowLeft size={15} />
          {isEditMode ? 'Back to Project' : 'Cancel'}
        </button>
        <h1 className="page-title">{isEditMode ? 'Edit Project' : 'Register New Project'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: form ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Project Information */}
            <div className="surface p-6 space-y-4">
              <h2 className="text-sm font-semibold text-ink mb-1">Project Information</h2>

              {/* Row: name + proponent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldWrapper label="Project Name" required>
                  <input {...register('name')} className={cls('name')} placeholder="Amazon Basin Reforestation – Sector 4" />
                  <FieldError message={err('name')} />
                </FieldWrapper>
                <FieldWrapper label="Project Proponent">
                  <input {...register('projectProponent')} className={cls('projectProponent')} placeholder="Institutional Developer Name" />
                  <FieldError message={err('projectProponent')} />
                </FieldWrapper>
              </div>

              {/* Row: start date + location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldWrapper label="Project Start Date">
                  <input {...register('startDate')} type="date" className={cls('startDate')} />
                  <FieldError message={err('startDate')} />
                </FieldWrapper>
                <FieldWrapper label="Location" required>
                  <div className="relative mt-1">
                    <input
                      {...register('geocodedAddress')}
                      className={`field pr-8 ${
                        errors.geocodedAddress || backendFieldErrors.geocodedAddress
                          ? 'border-alert bg-alert/5 focus:border-alert focus:ring-alert/20'
                          : ''
                      }`}
                      placeholder="Brazil, Amazonas"
                    />
                    <MapPin size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
                  </div>
                  <FieldError message={err('geocodedAddress')} />
                </FieldWrapper>
              </div>

              {/* Row: enrollment */}
              <FieldWrapper label="Enrollment">
                <input {...register('enrollment')} className={cls('enrollment')} placeholder="Standard Registry" />
                <FieldError message={err('enrollment')} />
              </FieldWrapper>

              {/* Row: protocol + version */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldWrapper label="Protocol">
                  <input {...register('protocol')} className={cls('protocol')} placeholder="VM0047" />
                  <FieldError message={err('protocol')} />
                </FieldWrapper>
                <FieldWrapper label="Protocol Version">
                  <input {...register('protocolVersion')} className={cls('protocolVersion')} placeholder="V1.2" />
                  <FieldError message={err('protocolVersion')} />
                </FieldWrapper>
              </div>

              {/* Row: application year + vintage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldWrapper label="Application Year">
                  <input {...register('applicationYear')} type="number" className={cls('applicationYear')} placeholder="2024" />
                  <FieldError message={err('applicationYear')} />
                </FieldWrapper>
                <FieldWrapper label="Vintage">
                  <input {...register('vintage')} type="number" className={cls('vintage')} placeholder="2024" />
                  <FieldError message={err('vintage')} />
                </FieldWrapper>
              </div>

              {/* Row: proposed credits + accrual rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldWrapper label="Proposed Carbon Credits (tCO₂)">
                  <input {...register('proposedCarbonCredits')} type="number" min="0" className={cls('proposedCarbonCredits')} placeholder="43,000" />
                  <FieldError message={err('proposedCarbonCredits')} />
                </FieldWrapper>
                <FieldWrapper label="Average Accrual Rate (yr)">
                  <input {...register('averageAccrualRate')} type="number" min="0" step="0.01" className={cls('averageAccrualRate')} placeholder="2" />
                  <FieldError message={err('averageAccrualRate')} />
                </FieldWrapper>
              </div>

              {/* Description */}
              <FieldWrapper label="Project Description" required>
                <textarea
                  {...register('description')}
                  className={`field mt-1 resize-none ${
                    errors.description || backendFieldErrors.description
                      ? 'border-alert bg-alert/5 focus:border-alert focus:ring-alert/20'
                      : ''
                  }`}
                  rows={5}
                  placeholder="Comprehensive restoration project covering degraded pasture land in the Amazon Basin…"
                />
                <FieldError message={err('description')} />
              </FieldWrapper>
            </div>

            {/* Document Repository */}
            <div className="surface p-6">
              <h2 className="text-sm font-semibold text-ink mb-1">Document Repository</h2>
              <p className="text-xs text-ink-muted mb-4">
                A Project Design Document (PDD) is required for verification.
              </p>

              {fields.length === 0 && (
                <div className="rounded-lg border-2 border-dashed border-line flex flex-col items-center justify-center py-10 text-center mb-4">
                  <p className="text-sm text-ink-muted">Drag and drop documents here</p>
                  <p className="text-xs text-ink-faint mt-1">PDF, XLSX, or DAT files up to 50MB each</p>
                </div>
              )}

              <div className="space-y-2.5 mb-4">
                {fields.map((field, i) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input {...register(`documents.${i}.name`)} className="field text-sm" placeholder="Document name" />
                      <input {...register(`documents.${i}.url`)} className="field text-sm" placeholder="https://…" />
                      <select {...register(`documents.${i}.docType`)} className="field text-sm">
                        {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-ink-faint hover:bg-canvas hover:text-alert transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => append({ name: '', url: '', docType: 'PDD' })}
                className="btn-secondary text-sm inline-flex items-center gap-1.5"
              >
                <Plus size={14} />
                Add Document
              </button>
            </div>

            {/* API error */}
            {apiError && (
              <div className="rounded-lg bg-status-rejected-bg border border-status-rejected-text/20 text-status-rejected-text text-sm px-4 py-3">
                {apiError}
              </div>
            )}
          </div>

          {/* ── RIGHT: readiness sidebar ── */}
          <div className="lg:col-span-1">
            <div className="surface p-5 sticky top-6 space-y-4">
              <h3 className="text-sm font-semibold text-ink">Submission Readiness</h3>

              {/* Checklist */}
              <ul className="space-y-3">
                {[
                  { label: 'Basic Information', sublabel: 'All required fields completed', done: basicDone },
                  { label: 'Geospatial Boundary', sublabel: 'Coordinates validated against registry', done: geoBoundaryDone },
                  { label: 'Required Documents', sublabel: `${fields.length} file${fields.length !== 1 ? 's' : ''} uploaded`, done: docsDone, optional: true },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-2.5">
                    {item.done ? (
                      <CheckCircle2 size={16} className="text-status-approved-text flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle size={16} className="text-line-strong flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${item.done ? 'text-ink' : 'text-ink-muted'}`}>
                        {item.label}
                        {item.optional && <span className="text-xs text-ink-faint font-normal ml-1">(optional)</span>}
                      </p>
                      <p className="text-xs text-ink-faint">{item.sublabel}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Progress bar */}
              <div className="h-1 bg-canvas rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button type="submit" disabled={submitting || saving || discarding} className="btn-primary w-full">
                  {submitting ? 'Submitting…' : 'Submit for Verification'}
                </button>
                <button type="button" onClick={handleSaveDraft} disabled={saving || submitting || discarding} className="btn-secondary w-full">
                  {saving ? 'Saving…' : 'Save Draft & Exit'}
                </button>
                <button
                  type="button"
                  onClick={handleDiscardClick}
                  disabled={discardDisabled}
                  className="w-full py-1 text-sm font-medium text-alert transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {discarding ? 'Discarding...' : 'Discard Submission'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
