import axios from 'axios';
import type { ApiResponse } from '../types/api';
import { useLoadingStore } from '../stores/loadingStore';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5207';

// Saves/deletes on a fast local server finish in a few ms, so the in-button spinner would only flash.
// Write requests therefore take at least this long; reads are never delayed.
const MIN_ACTION_MS = 600;
const startedAt = new WeakMap<object, number>();

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Request interceptor to add JWT token and set Content-Type
api.interceptors.request.use(
  (config) => {
    useLoadingStore.getState().start();
    if (config.method && config.method !== 'get') startedAt.set(config, Date.now());

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only set JSON content-type when NOT sending FormData.
    // For FormData, the browser must set it automatically (includes the boundary).
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
const waitForMinimum = async (config: object | undefined) => {
  const start = config && startedAt.get(config);
  if (!start) return;
  const remaining = MIN_ACTION_MS - (Date.now() - start);
  if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
};

api.interceptors.response.use(
  async (response) => {
    await waitForMinimum(response.config);
    useLoadingStore.getState().stop();
    return response;
  },
  async (error) => {
    await waitForMinimum(error.config);
    useLoadingStore.getState().stop();
    // Handle 401 Unauthorized - token expired or invalid
    // Skip redirect when already on login/register to let the form show the error
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

/** HTTP status of a failed request, or undefined when the server was unreachable. */
export function getErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

/** First error message the API returned in its ApiResponse body, or the fallback. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiResponse<unknown>>(error)) return fallback;
  const body = error.response?.data;
  return body?.errors?.[0] || body?.message || fallback;
}

export default api;
