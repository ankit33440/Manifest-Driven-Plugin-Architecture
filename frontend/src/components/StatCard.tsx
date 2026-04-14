import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  className?: string;
}

export default function StatCard({ label, value, icon, trend, className = '' }: StatCardProps) {
  return (
    <div className={`surface p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
          <p className="text-2xl font-bold text-ink mt-1">{value}</p>
          {trend && <p className="text-xs text-ink-faint mt-1">{trend}</p>}
        </div>
        {icon && (
          <div className="p-2 bg-accent-light rounded-lg text-accent">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
