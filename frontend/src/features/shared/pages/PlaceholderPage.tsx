import React from 'react';

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="surface p-10">
      <h1 className="text-4xl font-semibold tracking-[-0.04em] text-slate-900">{title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-stone-500">
        This workspace route is ready for the next module. The authentication, routing,
        permission hooks, and shared layout are already wired so we can extend it cleanly.
      </p>
    </div>
  );
}
