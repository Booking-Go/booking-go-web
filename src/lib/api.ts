import axios from 'axios';

/**
 * API client routed through the Next.js proxy (/api/v1 → backend:8000/api/v1).
 * The proxy is configured in next.config.ts rewrites.
 * Benefits: no CORS, no exposed backend URL, same-origin cookies.
 */
const API_URL = '/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT from localStorage
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (err: unknown) => Promise.reject(err),
);

// Response interceptor — auto refresh on 401, redirect on failure
apiClient.interceptors.response.use(
  (response) => response,
  async (err: unknown) => {
    const error = err as import('axios').AxiosError & { config: { _retry?: boolean } };
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        // Use raw axios (not apiClient) to avoid interceptor loop
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        // Update accessToken cookie so server actions stay in sync
        document.cookie = `accessToken=${accessToken}; path=/; max-age=900; SameSite=Lax`;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch {
        // Token rotation failed — clear everything
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Clear session cookie so middleware redirects
        document.cookie = 'session=; path=/; max-age=0; SameSite=Lax';
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
