import React from 'react';

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-stone-100 text-stone-700',
  SUBMITTED: 'bg-sky-100 text-sky-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
  VERIFIED: 'bg-teal-100 text-teal-700',
  CERTIFIED: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-green-100 text-green-700',
};

export default function ProjectStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600'}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
