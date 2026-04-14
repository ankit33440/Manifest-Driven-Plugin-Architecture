import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { ActionItem } from '../../constants/developerDashboardData';

interface DashboardActionCardProps {
  item: ActionItem;
}

export default function DashboardActionCard({ item }: DashboardActionCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-[12px] border border-[#eceff1] bg-white px-4 py-4 shadow-[0_3px_10px_rgba(15,23,42,0.03)] sm:px-5 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 gap-3">
        <div className="w-[3px] rounded-full bg-[#2d9c4b]" />
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9aa3aa]">
            {item.received}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[17px] font-bold text-[#263239]">{item.project}</span>
            <span className="text-[13px] font-semibold text-[#7d858c]">{item.reference}</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[#d4564b]">
            <AlertCircle size={14} />
            <p className="text-[13px] font-bold">{item.issue}</p>
          </div>
          <p className="mt-1 max-w-[640px] text-[12px] leading-5 text-[#7d848b]">
            {item.summary}
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          className={`inline-flex min-w-[96px] items-center justify-center rounded-full px-4 py-2 text-[12px] font-bold transition ${
            item.ctaVariant === 'success'
              ? 'bg-[#2f8d43] text-white hover:bg-[#267538]'
              : 'bg-[#f0efeb] text-[#68645c] hover:bg-[#e5e3dc]'
          }`}
        >
          {item.ctaLabel}
        </button>
      </div>
    </article>
  );
}
