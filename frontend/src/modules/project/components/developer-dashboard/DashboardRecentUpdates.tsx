import React from 'react';
import { Dot } from 'lucide-react';
import type { UpdateItem } from '../../constants/developerDashboardData';

interface DashboardRecentUpdatesProps {
  items: UpdateItem[];
}

export default function DashboardRecentUpdates({
  items,
}: DashboardRecentUpdatesProps) {
  return (
    <aside className="rounded-[16px] border border-[#e8ecef] bg-white px-5 py-5">
      <h3 className="text-[18px] font-bold text-[#2a3238]">Recent Updates</h3>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-2">
            <Dot size={22} className="mt-0.5 text-[#99a2a8]" />
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-[#30373d]">{item.title}</p>
              <p className="mt-1 text-[11px] leading-4 text-[#7d858b]">{item.summary}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b0b7bd]">
                {item.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#7a848c] transition hover:text-[#27323a]"
      >
        View all activity
      </button>
    </aside>
  );
}
