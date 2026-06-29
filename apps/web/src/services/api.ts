import axios from 'axios';

// Base URL points to our Express API port (relative path in production/deployment)
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api');

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Enables cookies like refreshToken to be transmitted automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// A local in-memory variable to store the access token (never stored in localStorage)
let accessTokenMemory: string | null = null;

export function setAccessTokenInMemory(token: string | null): void {
  accessTokenMemory = token;
}

export function getAccessTokenFromMemory(): string | null {
  return accessTokenMemory;
}

// Request Interceptor: Automatically injects Authorization header
api.interceptors.request.use(
  (config) => {
    const token = getAccessTokenFromMemory();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Silent token auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refreshing if login endpoint failed or it is not a 401, or already retried
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/login')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue up failed requests while token is refreshing
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Request a new access token via silent refresh endpoint
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const { accessToken } = response.data.data;
      setAccessTokenInMemory(accessToken);

      processQueue(null, accessToken);
      isRefreshing = false;

      // Retry original request with new access token
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;
      setAccessTokenInMemory(null);
      
      // Notify application of logout (redirect to login page or dispatch event)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-session-expired'));
      }
      
      return Promise.reject(refreshError);
    }
  }
);
