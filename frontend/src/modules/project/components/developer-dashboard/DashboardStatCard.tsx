import React from 'react';
import type { DashboardStat } from '../../constants/developerDashboardData';

interface DashboardStatCardProps {
  stat: DashboardStat;
}

export default function DashboardStatCard({ stat }: DashboardStatCardProps) {
  return (
    <article className="relative overflow-hidden rounded-[18px] border border-[#e9edf0] bg-white px-5 py-4">
      <div className="absolute right-[-18px] top-[-32px] h-24 w-24 rounded-full bg-[#f6f8f7]" />
      <p className="relative text-[10px] font-bold uppercase tracking-[0.14em] text-[#9aa2a9]">
        {stat.label}
      </p>
      <h3 className="relative mt-3 text-[19px] font-extrabold tracking-[-0.03em] text-[#183d33] sm:text-[20px]">
        {stat.value}
      </h3>
      <p className="relative mt-2 text-[12px] font-semibold text-[#3d9b50]">
        {stat.detail}
      </p>
    </article>
  );
}
