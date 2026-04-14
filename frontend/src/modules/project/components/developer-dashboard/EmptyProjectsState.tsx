import React from 'react';
import { ClipboardList } from 'lucide-react';

interface EmptyProjectsStateProps {
  onRegisterProject: () => void;
}

export default function EmptyProjectsState({
  onRegisterProject,
}: EmptyProjectsStateProps) {
  return (
    <section className="rounded-[30px] border border-dashed border-[#d6dde2] bg-white px-6 py-14 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:px-10 sm:py-20">
      <div className="mx-auto flex max-w-xl flex-col items-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f4f1ea] text-[#8d958b]">
          <ClipboardList size={40} strokeWidth={1.6} />
        </div>
        <h2 className="mt-8 text-3xl font-bold tracking-tight text-[#232b31]">
          No projects yet
        </h2>
        <p className="mt-4 max-w-md text-lg leading-8 text-[#5f6a72]">
          Your submitted projects will be listed here once they are added.
        </p>
        <button
          type="button"
          onClick={onRegisterProject}
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#1c2f39] px-8 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(28,47,57,0.16)] transition hover:bg-[#243845]"
        >
          + Register New Project
        </button>
      </div>
    </section>
  );
}
