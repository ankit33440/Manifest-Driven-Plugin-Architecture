import React from 'react';

const STATUS_STYLES: Record<string, string> = {
  // Project statuses
  DRAFT: 'bg-gray-100 text-gray-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  // Credit statuses
  ACTIVE: 'bg-green-100 text-green-700',
  RETIRED: 'bg-gray-100 text-gray-600',
  PENDING: 'bg-amber-100 text-amber-700',
  // Marketplace statuses
  AVAILABLE: 'bg-green-100 text-green-700',
  SOLD: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style} ${className}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
