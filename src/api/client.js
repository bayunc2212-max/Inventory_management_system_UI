import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let waitingQueue = [];

const onTokenRefreshed = (token) => {
  waitingQueue.forEach((cb) => cb(token));
  waitingQueue = [];
};

const onRefreshFailed = (error) => {
  waitingQueue.forEach((cb) => cb(null, error));
  waitingQueue = [];
};

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const { accessToken, refreshToken, logout } = useAuthStore.getState();

    if (error.response?.status === 401 && !original._retry && refreshToken && !original.url.includes('/auth/login') && !original.url.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          waitingQueue.push((token, err) => {
            if (err) return reject(err);
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        useAuthStore.getState().setTokens(data.data.accessToken, data.data.refreshToken);
        onTokenRefreshed(data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        onRefreshFailed(refreshError);
        logout();
        toast.error('Sesi berakhir, silakan login kembali');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error, fallback = 'Terjadi kesalahan') {
  if (error.response?.data?.message) return error.response.data.message;
  return error.message || fallback;
}

export default api;
