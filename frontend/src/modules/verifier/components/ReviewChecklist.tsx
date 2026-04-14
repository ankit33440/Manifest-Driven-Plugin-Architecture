import React from 'react';

interface ChecklistValues {
  methodologyCheck: boolean;
  boundaryCheck: boolean;
  additionalityCheck: boolean;
  permanenceCheck: boolean;
}

interface ReviewChecklistProps {
  values: ChecklistValues;
  onChange?: (key: keyof ChecklistValues, value: boolean) => void;
  readOnly?: boolean;
}

const CHECKLIST_ITEMS: { key: keyof ChecklistValues; label: string; description: string }[] = [
  { key: 'methodologyCheck', label: 'Methodology', description: 'Approved methodology correctly applied' },
  { key: 'boundaryCheck', label: 'Project Boundary', description: 'Geographic and temporal boundaries defined' },
  { key: 'additionalityCheck', label: 'Additionality', description: 'Emissions reductions are additional' },
  { key: 'permanenceCheck', label: 'Permanence', description: 'Long-term carbon storage demonstrated' },
];

export default function ReviewChecklist({ values, onChange, readOnly = false }: ReviewChecklistProps) {
  const checked = Object.values(values).filter(Boolean).length;
  const total = CHECKLIST_ITEMS.length;
  const pct = (checked / total) * 100;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-1">
        <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
          {checked}/{total} complete
        </span>
      </div>

      {CHECKLIST_ITEMS.map(({ key, label, description }) => (
        <label
          key={key}
          className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
            readOnly ? '' : 'cursor-pointer hover:bg-stone-50'
          } ${values[key] ? 'border-green-200 bg-green-50' : 'border-stone-200 bg-white'}`}
        >
          <input
            type="checkbox"
            checked={values[key]}
            disabled={readOnly}
            onChange={(e) => onChange?.(key, e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded accent-green-600"
          />
          <div>
            <p className="text-sm font-medium text-slate-900">{label}</p>
            <p className="text-xs text-stone-400">{description}</p>
          </div>
        </label>
      ))}
    </div>
  );
}
