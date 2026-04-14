import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../core/api/axios';
import { useAuth } from '../../../core/auth/AuthContext';

interface Project {
  id: string;
  status: string;
  assignedVerifierId: string | null;
}

interface Props {
  project: Project;
  onUpdate: () => void;
}

export default function VerifierReviewAction({ project, onUpdate }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [claiming, setClaiming] = useState(false);

  const isSubmitted = project.status === 'SUBMITTED' || project.status === 'INFO_REQUESTED';
  const isUnderReview = project.status === 'UNDER_REVIEW';
  const isMyClaim = project.assignedVerifierId === user?.id;
  const isOthersClaim = project.assignedVerifierId && !isMyClaim;

  async function handleClaim() {
    setClaiming(true);
    try {
      await api.patch(`/verifier/projects/${project.id}/claim`);
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not claim project');
    } finally {
      setClaiming(false);
    }
  }

  if (isSubmitted && !project.assignedVerifierId) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Verifier Review</h2>
        <p className="text-sm text-stone-400 mb-4">This project is ready for review. Claim it to begin.</p>
        <button
          onClick={handleClaim}
          disabled={claiming}
          className="btn-primary"
        >
          {claiming ? 'Claiming…' : 'Claim for Review'}
        </button>
      </section>
    );
  }

  if (isUnderReview && isMyClaim) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Verifier Review</h2>
        <p className="text-sm text-stone-400 mb-4">You are the assigned verifier for this project.</p>
        <button
          onClick={() => navigate(`/verifier/projects/${project.id}`)}
          className="btn-primary"
        >
          Open Full Review →
        </button>
      </section>
    );
  }

  if (isOthersClaim) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Verifier Review</h2>
        <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold bg-amber-100 text-amber-700">
          Under review by another verifier
        </span>
      </section>
    );
  }

  return null;
}
