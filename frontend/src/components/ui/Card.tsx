import React from 'react';

type Padding = 'none' | 'sm' | 'md' | 'lg';

const PAD_CLASSES: Record<Padding, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: Padding;
  title?: string;
  action?: React.ReactNode;
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  title,
  action,
}: CardProps) {
  return (
    <div className={`surface ${PAD_CLASSES[padding]} ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-sm font-semibold text-ink">{title}</h3>}
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
