import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRole, deleteRole, getPermissions, getRoles, replaceRolePermissions } from '../../../api/roles';

interface RoleFormValues {
  name: string;
  description: string;
}

export function RolesPage() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<RoleFormValues>();
  const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: getRoles });
  const { data: permissionsByModule } = useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions,
  });

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: async () => {
      reset();
      await queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      replaceRolePermissions(roleId, permissionIds),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const rolePermissionLookup = useMemo(() => {
    return new Map<string, Set<string>>(
      (roles ?? []).map((role: any) => [
        role.id,
        new Set<string>(role.rolePermissions.map((item: any) => item.permissionId)),
      ]),
    );
  }, [roles]);

  return (
    <div className="space-y-8">
      <section className="surface p-8">
        <p className="field-label">RBAC Management</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-slate-900">
          Roles & permissions
        </h1>
        <form
          className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr_auto]"
          onSubmit={handleSubmit((values) => createMutation.mutate(values))}
        >
          <input className="field" placeholder="Role name" {...register('name', { required: true })} />
          <input className="field" placeholder="Description" {...register('description')} />
          <button className="primary-button h-14" type="submit">
            Create role
          </button>
        </form>
      </section>

      <div className="space-y-6">
        {(roles ?? []).map((role: any) => (
          <section key={role.id} className="surface p-8">
            <div className="flex items-center justify-between gap-5">
              <div>
                <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-900">
                  {role.name}
                </h2>
                <p className="mt-2 text-stone-500">{role.description || 'No description yet.'}</p>
              </div>
              {!role.isSystem ? (
                <button className="secondary-button" onClick={() => deleteMutation.mutate(role.id)}>
                  Delete role
                </button>
              ) : (
                <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
                  System role
                </span>
              )}
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-3">
              {Object.entries(permissionsByModule ?? {}).map(([module, permissions]) => (
                <div key={module} className="subtle-surface p-5">
                  <p className="field-label">{module}</p>
                  <div className="mt-4 space-y-3">
                    {(permissions as any[]).map((permission) => {
                      const checked = rolePermissionLookup.get(role.id)?.has(permission.id) ?? false;
                      return (
                        <label key={permission.id} className="flex items-start gap-3 text-sm text-stone-600">
                          <input
                            defaultChecked={checked}
                            type="checkbox"
                            onChange={(event) => {
                              const currentPermissions = new Set<string>(
                                Array.from(rolePermissionLookup.get(role.id) ?? []),
                              );
                              if (event.target.checked) {
                                currentPermissions.add(permission.id);
                              } else {
                                currentPermissions.delete(permission.id);
                              }

                              updatePermissionsMutation.mutate({
                                roleId: role.id,
                                permissionIds: Array.from(currentPermissions),
                              });
                            }}
                          />
                          <span>{permission.key}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
