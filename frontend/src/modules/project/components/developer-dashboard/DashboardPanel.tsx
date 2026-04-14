import React from 'react';

interface DashboardPanelProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardPanel({
  children,
  className = '',
}: DashboardPanelProps) {
  return (
    <section
      className={`rounded-[28px] border border-[#e5e7eb] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.03)] ${className}`}
    >
      {children}
    </section>
  );
}
