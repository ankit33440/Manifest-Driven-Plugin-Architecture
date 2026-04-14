import React from 'react';
import { ClipboardList } from 'lucide-react';

interface DashboardEmptyStateProps {
  onRegisterProject: () => void;
}

export default function DashboardEmptyState({
  onRegisterProject,
}: DashboardEmptyStateProps) {
  return (
    <div className="flex min-h-[calc(100vh-180px)] flex-col">
      <section className="flex-1 rounded-[26px] border border-dashed border-[#d4dbe0] bg-white px-6 py-10 shadow-[0_2px_10px_rgba(15,23,42,0.02)] sm:px-10 lg:px-12">
        <div className="mx-auto flex h-full max-w-[720px] flex-col items-center justify-center text-center">
          <div className="flex h-[108px] w-[108px] items-center justify-center rounded-full bg-[#f4f0ea] text-[#94988e]">
            <ClipboardList size={42} strokeWidth={1.7} />
          </div>
          <h1 className="mt-8 text-[28px] font-bold tracking-[-0.03em] text-[#2a3137]">
            No projects yet
          </h1>
          <p className="mt-4 max-w-[420px] text-[16px] leading-8 text-[#67737c] sm:text-[17px]">
            Your submitted projects will be listed here once they are added.
          </p>
          <button
            type="button"
            onClick={onRegisterProject}
            className="mt-8 inline-flex min-w-[244px] items-center justify-center rounded-[12px] bg-[#1c2f39] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_20px_rgba(28,47,57,0.16)] transition hover:bg-[#223844]"
          >
            + Register New Project
          </button>
        </div>
      </section>
    </div>
  );
}
