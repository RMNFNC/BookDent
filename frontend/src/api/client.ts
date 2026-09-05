import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';

export const AUTH_LOGOUT_EVENT = 'dentalcare:auth-logout';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error('Nessun refresh token disponibile');

  const { data } = await axios.post<{ accessToken: string }>(`${baseURL}/auth/refresh`, {
    refreshToken,
  });

  tokenStorage.setAccessToken(data.accessToken);
  return data.accessToken;
};

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;
    const status = error.response?.status;
    const isAuthRoute = config?.url?.includes('/auth/');

    if (status === 401 && config && !config._retry && !isAuthRoute) {
      config._retry = true;

      try {
        refreshPromise ??= refreshAccessToken();
        const newToken = await refreshPromise;
        refreshPromise = null;

        config.headers.set('Authorization', `Bearer ${newToken}`);
        return apiClient(config);
      } catch (refreshError) {
        refreshPromise = null;
        tokenStorage.clear();
        window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: { message: string }[] };
    if (data?.errors?.length) return data.errors.map((e) => e.message).join(' · ');
    if (data?.message) return data.message;
  }
  return fallback;
};
