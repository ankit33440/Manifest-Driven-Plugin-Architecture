import React from 'react';

type BadgeVariant =
  | 'draft'
  | 'submitted'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'pending'
  | 'info';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  draft:      'badge-draft',
  submitted:  'badge-submitted',
  reviewing:  'badge-reviewing',
  approved:   'badge-approved',
  rejected:   'badge-rejected',
  pending:    'badge-pending',
  info:       'badge-submitted',
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

export default function Badge({ variant, label, className = '' }: BadgeProps) {
  return (
    <span className={`status-badge ${VARIANT_CLASSES[variant]} ${className}`}>
      {label ?? variant}
    </span>
  );
}
