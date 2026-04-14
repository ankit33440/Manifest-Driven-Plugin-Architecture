import React from 'react';

const STATUS_CLASSES: Record<string, string> = {
  // Project statuses
  DRAFT:          'badge-draft',
  SUBMITTED:      'badge-submitted',
  UNDER_REVIEW:   'badge-reviewing',
  INFO_REQUESTED: 'badge-pending',
  APPROVED:       'badge-approved',
  REJECTED:       'badge-rejected',
  CERTIFIED:      'badge-approved',
  // User statuses
  ACTIVE:         'badge-approved',
  SUSPENDED:      'badge-rejected',
  PENDING:        'badge-pending',
  // Credit / marketplace statuses
  RETIRED:        'badge-draft',
  AVAILABLE:      'badge-approved',
  SOLD:           'badge-draft',
  CANCELLED:      'badge-rejected',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const cls = STATUS_CLASSES[status] ?? 'badge-draft';
  return (
    <span className={`status-badge ${cls} ${className}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
