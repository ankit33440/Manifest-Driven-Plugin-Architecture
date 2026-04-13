import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inviteUser } from '../../../api/admin';
import { getRoles } from '../../../api/roles';
import { getUsers, updateUserStatus, assignUserRoles } from '../../../api/users';

export function UsersPage() {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const { data: users } = useQuery({
    queryKey: ['users', selectedRole, selectedStatus],
    queryFn: () => getUsers({ role: selectedRole || undefined, status: selectedStatus || undefined }),
  });
  const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: getRoles });

  const inviteMutation = useMutation({
    mutationFn: ({ email, roleName }: { email: string; roleName: string }) => inviteUser(email, roleName),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      updateUserStatus(userId, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const roleAssignmentMutation = useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      assignUserRoles(userId, roleIds),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const roleOptions = useMemo(
    () => (roles ?? []).map((role: any) => ({ id: role.id, name: role.name })),
    [roles],
  );

  return (
    <div className="space-y-8">
      <section className="surface p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="field-label">User Management</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-slate-900">
              Users
            </h1>
          </div>
          <button
            className="primary-button"
            onClick={() =>
              inviteMutation.mutate({ email: `admin${Date.now()}@example.com`, roleName: 'ADMIN' })
            }
          >
            Create Admin Invite
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <select className="field" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
            <option value="">Filter by role</option>
            {roleOptions.map((role: { id: string; name: string }) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
          <select className="field" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
            <option value="">Filter by status</option>
            {['ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED', 'REJECTED'].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="surface overflow-hidden">
        <div className="grid grid-cols-[1.2fr_1fr_180px_220px] gap-4 border-b border-stone-100 px-8 py-5 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          <span>User</span>
          <span>Roles</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        <div className="divide-y divide-stone-100">
          {(users ?? []).map((user: any) => (
            <div key={user.id} className="grid grid-cols-[1.2fr_1fr_180px_220px] gap-4 px-8 py-6">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-stone-500">{user.email}</p>
              </div>
              <div className="text-sm text-stone-600">
                {user.userRoles.map((entry: any) => entry.role.name).join(', ')}
              </div>
              <div className="text-sm font-semibold text-stone-700">{user.status}</div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    className="secondary-button !px-3 !py-2"
                    onClick={() =>
                      statusMutation.mutate({
                        userId: user.id,
                        status: user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                      })
                    }
                  >
                    {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                  </button>
                </div>
                <select
                  className="field !h-11 !rounded-xl !text-sm"
                  defaultValue=""
                  onChange={(event) => {
                    if (!event.target.value) return;
                    roleAssignmentMutation.mutate({
                      userId: user.id,
                      roleIds: [event.target.value],
                    });
                  }}
                >
                  <option value="">Assign single role</option>
                  {roleOptions.map((role: { id: string; name: string }) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
