import { apiClient } from './client';

export interface ProjectPayload {
  name: string;
  description: string;
  type: string;
  standard: string;
  country?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  areaHectares?: number;
  estimatedCredits?: number;
  vintageStartYear?: number;
  vintageEndYear?: number;
}

export async function getProjects(params?: { status?: string; type?: string }) {
  const { data } = await apiClient.get('/projects', { params });
  return data;
}

export async function getProject(id: string) {
  const { data } = await apiClient.get(`/projects/${id}`);
  return data;
}

export async function createProject(payload: ProjectPayload) {
  const { data } = await apiClient.post('/projects', payload);
  return data;
}

export async function updateProject(id: string, payload: Partial<ProjectPayload>) {
  const { data } = await apiClient.patch(`/projects/${id}`, payload);
  return data;
}

export async function submitProject(id: string, note?: string) {
  const { data } = await apiClient.patch(`/projects/${id}/submit`, { note });
  return data;
}

export async function approveProject(id: string, note?: string) {
  const { data } = await apiClient.patch(`/projects/${id}/approve`, { note });
  return data;
}

export async function rejectProject(id: string, note?: string) {
  const { data } = await apiClient.patch(`/projects/${id}/reject`, { note });
  return data;
}

export async function verifyProject(id: string, note?: string) {
  const { data } = await apiClient.patch(`/projects/${id}/verify`, { note });
  return data;
}

export async function certifyProject(id: string, note?: string) {
  const { data } = await apiClient.patch(`/projects/${id}/certify`, { note });
  return data;
}

export async function addProjectDocument(
  id: string,
  payload: { name: string; url: string; type: string },
) {
  const { data } = await apiClient.post(`/projects/${id}/documents`, payload);
  return data;
}

export async function getProjectHistory(id: string) {
  const { data } = await apiClient.get(`/projects/${id}/history`);
  return data;
}
