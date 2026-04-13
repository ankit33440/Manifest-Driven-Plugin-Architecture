import axios from 'axios';
import { getAccessToken, setAccessToken } from './tokenStore';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }

          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await axios.post(
        'http://localhost:3000/api/v1/auth/refresh',
        {},
        { withCredentials: true },
      );

      const token = response.data.accessToken ?? null;
      setAccessToken(token);
      pendingQueue.forEach((resume) => resume(token));
      pendingQueue = [];

      if (token) {
        originalRequest.headers.Authorization = `Bearer ${token}`;
      }

      return apiClient(originalRequest);
    } catch (refreshError) {
      setAccessToken(null);
      pendingQueue.forEach((resume) => resume(null));
      pendingQueue = [];
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export { apiClient };
