import React from 'react';

interface EmptyStateProps {
  message: string;
  icon?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ message, icon = '📭', action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-base font-medium text-gray-500">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
