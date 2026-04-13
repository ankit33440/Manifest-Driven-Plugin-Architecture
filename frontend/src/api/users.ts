import { apiClient } from './client';

export async function getUsers(params?: { role?: string; status?: string }) {
  const { data } = await apiClient.get('/users', { params });
  return data;
}

export async function getUser(id: string) {
  const { data } = await apiClient.get(`/users/${id}`);
  return data;
}

export async function assignUserRoles(id: string, roleIds: string[]) {
  const { data } = await apiClient.put(`/users/${id}/roles`, { roleIds });
  return data;
}

export async function updateUserStatus(id: string, payload: { status: string; note?: string }) {
  const { data } = await apiClient.patch(`/users/${id}/status`, payload);
  return data;
}
