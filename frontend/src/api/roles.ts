import { apiClient } from './client';

export async function getRoles() {
  const { data } = await apiClient.get('/roles');
  return data;
}

export async function createRole(payload: { name: string; description?: string }) {
  const { data } = await apiClient.post('/roles', payload);
  return data;
}

export async function updateRole(id: string, payload: { name?: string; description?: string }) {
  const { data } = await apiClient.patch(`/roles/${id}`, payload);
  return data;
}

export async function replaceRolePermissions(id: string, permissionIds: string[]) {
  const { data } = await apiClient.put(`/roles/${id}/permissions`, { permissionIds });
  return data;
}

export async function deleteRole(id: string) {
  const { data } = await apiClient.delete(`/roles/${id}`);
  return data;
}

export async function getPermissions() {
  const { data } = await apiClient.get('/permissions');
  return data;
}
