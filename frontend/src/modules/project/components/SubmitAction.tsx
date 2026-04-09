import React, { useState } from 'react';
import { Send } from 'lucide-react';
import api from '../../../core/api/axios';

interface SubmitActionProps {
  project: { id: string; status: string };
  onUpdate: () => void;
}

export default function SubmitAction({ project, onUpdate }: SubmitActionProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const canSubmit = project.status === 'DRAFT';

  async function handleSubmit() {
    setLoading(true);
    setMessage('');
    try {
      await api.patch(`/projects/${project.id}/submit`);
      setMessage('Project submitted for review successfully.');
      onUpdate();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to submit project.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-2">Submit for Review</h3>
      <p className="text-sm text-gray-500 mb-4">
        Once submitted, the project will be reviewed by a verifier before approval.
      </p>

      {!canSubmit && (
        <div className="bg-gray-50 border border-gray-200 text-gray-500 text-sm px-3 py-2 rounded-lg">
          This project is not in DRAFT status and cannot be submitted.
        </div>
      )}

      {canSubmit && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Send size={15} />
          {loading ? 'Submitting...' : 'Submit Project'}
        </button>
      )}

      {message && (
        <p className="mt-3 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
}
