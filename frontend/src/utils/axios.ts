/**
 * Axios instance configuration
 * Handles base URL, interceptors, and error handling
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('expense_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success: boolean; message: string; error?: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('expense_token');
      localStorage.removeItem('expense_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
      console.error(`Network Error: Cannot connect to backend at ${baseUrl}`);
      console.error('Possible issues:');
      console.error('  1. Backend server is not running');
      console.error('  2. Backend is running on a different port');
      console.error('  3. Check frontend/.env has correct VITE_API_BASE_URL');
      error.message = `Cannot connect to backend server. Make sure it's running on ${baseUrl}`;
    }
    return Promise.reject(error);
  }
);

export default apiClient;

