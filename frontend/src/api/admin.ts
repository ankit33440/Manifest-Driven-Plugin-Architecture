import { apiClient } from './client';

export async function getDashboardSummary() {
  const { data } = await apiClient.get('/admin/dashboard');
  return data;
}

export async function getPendingApprovals() {
  const { data } = await apiClient.get('/admin/pending-approvals');
  return data;
}

export async function approveUser(userId: string, note?: string) {
  const { data } = await apiClient.patch(`/admin/users/${userId}/approve`, { note });
  return data;
}

export async function rejectUser(userId: string, note?: string) {
  const { data } = await apiClient.patch(`/admin/users/${userId}/reject`, { note });
  return data;
}

export async function inviteUser(email: string, roleName: string) {
  const { data } = await apiClient.post('/admin/invite', { email, roleName });
  return data;
}

export async function getInvitations() {
  const { data } = await apiClient.get('/admin/invitations');
  return data;
}

export async function revokeInvitation(id: string) {
  const { data } = await apiClient.delete(`/admin/invitations/${id}`);
  return data;
}
