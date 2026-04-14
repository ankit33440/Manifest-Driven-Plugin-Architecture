import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface DashboardMetricCardProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}

export default function DashboardMetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: DashboardMetricCardProps) {
  return (
    <div className="rounded-[24px] border border-[#e8ecef] bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_34px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{detail}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef3f4] text-[#1c2f39]">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
