import { apiClient } from './client';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    status: string;
    roles: string[];
    permissions: string[];
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterInvitedPayload extends RegisterPayload {
  token: string;
}

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function refreshSession() {
  const { data } = await apiClient.post<AuthResponse>('/auth/refresh');
  return data;
}

export async function logout() {
  await apiClient.post('/auth/logout');
}

export async function getMe() {
  const { data } = await apiClient.get<AuthResponse['user']>('/auth/me');
  return data;
}

export async function registerDeveloper(payload: RegisterPayload) {
  const { data } = await apiClient.post('/auth/register', payload);
  return data;
}

export async function validateInvitation(token: string) {
  const { data } = await apiClient.get<{ email: string; role: string; expiresAt: string }>(
    `/auth/invite/${token}`,
  );
  return data;
}

export async function registerInvited(payload: RegisterInvitedPayload) {
  const { data } = await apiClient.post<AuthResponse>('/auth/register-invited', payload);
  return data;
}
