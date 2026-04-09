import React from 'react';

const STATUS_ORDER = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];

const STATUS_META: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-400' },
  SUBMITTED: { label: 'Submitted', color: 'bg-blue-500' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-amber-500' },
  APPROVED: { label: 'Approved', color: 'bg-green-500' },
  REJECTED: { label: 'Rejected', color: 'bg-red-500' },
};

interface ProjectTimelineProps {
  project: { status: string; createdAt: string };
}

export default function ProjectTimeline({ project }: ProjectTimelineProps) {
  const currentIndex = STATUS_ORDER.indexOf(project.status);
  const isRejected = project.status === 'REJECTED';

  const steps = isRejected
    ? ['DRAFT', 'SUBMITTED', 'REJECTED']
    : STATUS_ORDER.filter((s) => s !== 'REJECTED');

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Project Timeline</h3>
      <div className="flex items-center gap-0">
        {steps.map((status, i) => {
          const meta = STATUS_META[status];
          const isDone = STATUS_ORDER.indexOf(status) <= currentIndex;
          const isCurrent = status === project.status;
          return (
            <React.Fragment key={status}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold
                    ${isDone ? meta.color : 'bg-gray-200'} ${isCurrent ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                >
                  {isDone ? '✓' : i + 1}
                </div>
                <span className="text-xs text-gray-500 mt-1 text-center w-20">{meta.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mb-5 ${
                    STATUS_ORDER.indexOf(steps[i + 1]) <= currentIndex ? meta.color : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Created: {new Date(project.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
