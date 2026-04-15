import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nr_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Unwrap the { success, data, timestamp } envelope from ResponseTransformInterceptor
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    const requestUrl = error.config?.url as string | undefined;
    const token = localStorage.getItem('nr_token');
    const isPublicAuthRequest =
      requestUrl === '/auth/login' || requestUrl === '/auth/register';

    if (error.response?.status === 401 && token && !isPublicAuthRequest) {
      localStorage.removeItem('nr_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
