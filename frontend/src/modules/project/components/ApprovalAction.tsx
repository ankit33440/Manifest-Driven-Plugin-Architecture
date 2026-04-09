import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '../../../core/api/axios';

interface ApprovalActionProps {
  project: { id: string; status: string };
  onUpdate: () => void;
}

export default function ApprovalAction({ project, onUpdate }: ApprovalActionProps) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [message, setMessage] = useState('');

  const canAct = project.status === 'SUBMITTED' || project.status === 'UNDER_REVIEW';

  async function handle(action: 'approve' | 'reject') {
    setLoading(action);
    setMessage('');
    try {
      await api.patch(`/projects/${project.id}/${action}`);
      setMessage(`Project ${action}d successfully.`);
      onUpdate();
    } catch (err: any) {
      setMessage(err.response?.data?.message || `Failed to ${action} project.`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-2">Approval Decision</h3>
      <p className="text-sm text-gray-500 mb-4">
        As a SUPERADMIN, you can approve or reject this project.
      </p>

      {!canAct && (
        <div className="bg-gray-50 border border-gray-200 text-gray-500 text-sm px-3 py-2 rounded-lg">
          This project is not pending a decision (current status: {project.status}).
        </div>
      )}

      {canAct && (
        <div className="flex gap-3">
          <button
            onClick={() => handle('approve')}
            disabled={loading !== null}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <CheckCircle size={15} />
            {loading === 'approve' ? 'Approving...' : 'Approve'}
          </button>
          <button
            onClick={() => handle('reject')}
            disabled={loading !== null}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <XCircle size={15} />
            {loading === 'reject' ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      )}

      {message && (
        <p className="mt-3 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
}
