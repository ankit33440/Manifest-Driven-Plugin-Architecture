import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getDashboardSummary, approveUser, rejectUser, revokeInvitation } from '../../../api/admin';
import { usePermission } from '../../../hooks/usePermission';

export function DashboardPage() {
  const queryClient = useQueryClient();
  const canApprove = usePermission('user:approve');
  const canRevokeInvitation = usePermission('invitation:revoke');
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardSummary,
  });

  const approvalMutation = useMutation({
    mutationFn: ({ userId, action }: { userId: string; action: 'approve' | 'reject' }) =>
      action === 'approve' ? approveUser(userId) : rejectUser(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: revokeInvitation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  if (isLoading) {
    return <div className="surface p-10 text-stone-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <section className="surface p-10">
        <p className="field-label">Administrative Overview</p>
        <h1 className="mt-3 text-6xl font-semibold tracking-[-0.06em] text-slate-900">
          Platform dashboard
        </h1>
        <div className="mt-8 grid gap-5 lg:grid-cols-4">
          {[
            ['Total Users', data?.stats.totalUsers ?? 0],
            ['Pending Approvals', data?.stats.pendingApprovals ?? 0],
            ['Active Projects', data?.stats.activeProjects ?? 0],
            ['Total Credits Issued', data?.stats.totalCreditsIssued ?? 0],
          ].map(([label, value]) => (
            <div key={String(label)} className="subtle-surface p-5">
              <p className="field-label">{label}</p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <div className="surface overflow-hidden">
          <div className="border-b border-stone-100 px-8 py-6">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-900">Pending Approvals</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {data?.pendingApprovals?.length ? (
              data.pendingApprovals.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between gap-6 px-8 py-6">
                  <div>
                    <p className="text-xl font-semibold text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-stone-500">{user.email}</p>
                  </div>
                  {canApprove ? (
                    <div className="flex gap-3">
                      <button
                        className="secondary-button"
                        onClick={() => approvalMutation.mutate({ userId: user.id, action: 'reject' })}
                      >
                        Reject
                      </button>
                      <button
                        className="primary-button"
                        onClick={() => approvalMutation.mutate({ userId: user.id, action: 'approve' })}
                      >
                        Approve
                      </button>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="px-8 py-10 text-stone-500">No pending approvals right now.</div>
            )}
          </div>
        </div>

        <div className="surface overflow-hidden">
          <div className="border-b border-stone-100 px-8 py-6">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-900">Recent Invitations</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {data?.recentInvitations?.length ? (
              data.recentInvitations.map((invitation: any) => (
                <div key={invitation.id} className="flex items-center justify-between gap-5 px-8 py-5">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{invitation.email}</p>
                    <p className="text-sm text-stone-500">
                      {invitation.role.name} • {invitation.status}
                    </p>
                  </div>
                  {canRevokeInvitation ? (
                    <button
                      className="secondary-button"
                      onClick={() => revokeMutation.mutate(invitation.id)}
                    >
                      Revoke
                    </button>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="px-8 py-10 text-stone-500">No invitations sent yet.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
