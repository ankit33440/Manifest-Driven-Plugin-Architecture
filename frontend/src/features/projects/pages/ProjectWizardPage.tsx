import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { addProjectDocument, createProject, submitProject, updateProject } from '../../../api/projects';

interface WizardValues {
  name: string;
  type: string;
  standard: string;
  description: string;
  country: string;
  region: string;
  latitude?: number;
  longitude?: number;
  areaHectares?: number;
  estimatedCredits?: number;
  vintageStartYear?: number;
  vintageEndYear?: number;
  documentName?: string;
  documentUrl?: string;
  documentType?: string;
}

const STEPS = ['Basic Info', 'Location', 'Credits Estimation', 'Documents', 'Review & Submit'];

export function ProjectWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { isSubmitting },
  } = useForm<WizardValues>({
    defaultValues: {
      type: 'REFORESTATION',
      standard: 'VCS',
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (values: WizardValues) => {
      const payload = {
        name: values.name,
        description: values.description,
        type: values.type,
        standard: values.standard,
        country: values.country,
        region: values.region,
        latitude: values.latitude ? Number(values.latitude) : undefined,
        longitude: values.longitude ? Number(values.longitude) : undefined,
        areaHectares: values.areaHectares ? Number(values.areaHectares) : undefined,
        estimatedCredits: values.estimatedCredits ? Number(values.estimatedCredits) : undefined,
        vintageStartYear: values.vintageStartYear ? Number(values.vintageStartYear) : undefined,
        vintageEndYear: values.vintageEndYear ? Number(values.vintageEndYear) : undefined,
      };

      if (!projectId) {
        const project = await createProject(payload);
        setProjectId(project.id);
        return project;
      }

      return updateProject(projectId, payload);
    },
  });

  const currentValues = getValues();
  const reviewRows = useMemo(
    () => [
      ['Project Name', currentValues.name],
      ['Type', currentValues.type],
      ['Standard', currentValues.standard],
      ['Country', currentValues.country],
      ['Region', currentValues.region],
      ['Estimated Credits', currentValues.estimatedCredits],
      ['Vintage Range', `${currentValues.vintageStartYear ?? '-'} - ${currentValues.vintageEndYear ?? '-'}`],
    ],
    [currentValues],
  );

  async function saveDraft(values: WizardValues) {
    return saveDraftMutation.mutateAsync(values);
  }

  async function nextStep() {
    const valid = await trigger();
    if (!valid) {
      return;
    }

    await saveDraft(getValues());
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  async function submitWizard(values: WizardValues) {
    const project = await saveDraft(values);
    if (project.id && values.documentName && values.documentUrl && values.documentType) {
      await addProjectDocument(project.id, {
        name: values.documentName,
        url: values.documentUrl,
        type: values.documentType,
      });
    }

    await submitProject(project.id);
    navigate(`/projects/${project.id}`);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.5fr_0.75fr]">
      <section className="surface p-8">
        <p className="field-label">Project Registration</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-slate-900">
          Multi-step project wizard
        </h1>

        <div className="mt-8 flex flex-wrap gap-3">
          {STEPS.map((label, index) => (
            <div
              key={label}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                index === step ? 'bg-slate-900 text-white' : 'bg-stone-100 text-stone-500'
              }`}
            >
              {index + 1}. {label}
            </div>
          ))}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(submitWizard)}>
          {step === 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="field-label">Project name</label>
                <input className="field mt-2" {...register('name', { required: true })} />
              </div>
              <div>
                <label className="field-label">Type</label>
                <select className="field mt-2" {...register('type', { required: true })}>
                  {['REFORESTATION', 'SOLAR', 'WIND', 'METHANE', 'REDD_PLUS', 'OTHER'].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Standard</label>
                <select className="field mt-2" {...register('standard', { required: true })}>
                  {['VCS', 'GOLD_STANDARD', 'CAR', 'CDM', 'OTHER'].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="field-label">Description</label>
                <textarea className="field mt-2 !h-40 py-4" {...register('description', { required: true })} />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="field-label">Country</label>
                <input className="field mt-2" {...register('country')} />
              </div>
              <div>
                <label className="field-label">Region</label>
                <input className="field mt-2" {...register('region')} />
              </div>
              <div>
                <label className="field-label">Latitude</label>
                <input className="field mt-2" type="number" step="0.000001" {...register('latitude')} />
              </div>
              <div>
                <label className="field-label">Longitude</label>
                <input className="field mt-2" type="number" step="0.000001" {...register('longitude')} />
              </div>
              <div className="md:col-span-2">
                <label className="field-label">Area in hectares</label>
                <input className="field mt-2" type="number" step="0.01" {...register('areaHectares')} />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="field-label">Estimated credits</label>
                <input className="field mt-2" type="number" step="0.01" {...register('estimatedCredits')} />
              </div>
              <div>
                <label className="field-label">Vintage start year</label>
                <input className="field mt-2" type="number" {...register('vintageStartYear')} />
              </div>
              <div>
                <label className="field-label">Vintage end year</label>
                <input className="field mt-2" type="number" {...register('vintageEndYear')} />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <div>
                <label className="field-label">Document name</label>
                <input className="field mt-2" {...register('documentName')} />
              </div>
              <div>
                <label className="field-label">Document URL</label>
                <input className="field mt-2" {...register('documentUrl')} />
              </div>
              <div>
                <label className="field-label">Document type</label>
                <input className="field mt-2" {...register('documentType')} />
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="subtle-surface p-6">
              <div className="space-y-4">
                {reviewRows.map(([label, value]) => (
                  <div key={String(label)} className="flex items-center justify-between gap-6 border-b border-stone-200 pb-4 last:border-b-0 last:pb-0">
                    <span className="field-label">{label}</span>
                    <span className="text-right text-sm text-stone-700">{String(value ?? '-')}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-4">
            {step > 0 ? (
              <button className="secondary-button" onClick={() => setStep(step - 1)} type="button">
                Back
              </button>
            ) : null}
            {step < STEPS.length - 1 ? (
              <button className="primary-button" onClick={() => void nextStep()} type="button">
                Next step
              </button>
            ) : (
              <button className="primary-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Submitting...' : 'Save draft & submit'}
              </button>
            )}
            <button className="secondary-button" onClick={() => void saveDraft(getValues())} type="button">
              Save draft
            </button>
          </div>
        </form>
      </section>

      <aside className="surface p-8">
        <p className="field-label">Submission Readiness</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-900">Checklist</h2>
        <div className="mt-8 space-y-5">
          {STEPS.map((label, index) => (
            <div key={label} className="flex items-center gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                  index <= step ? 'bg-slate-900 text-white' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {index + 1}
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">{label}</p>
                <p className="text-sm text-stone-500">
                  {index < step ? 'Completed in draft' : index === step ? 'Current step' : 'Pending'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
