import axios from "axios";

/**
 * Centralized Axios instance — single source of truth for all API calls.
 *
 * Why a centralized instance?
 * - Base URL configured once (not repeated in every component)
 * - Automatic token refresh on 401 (no manual handling per request)
 * - Request/response interceptors for logging, error normalization
 * - Credentials included by default (httpOnly cookies)
 *
 * Token refresh flow:
 *   1. Request fails with 401 (access token expired)
 *   2. Interceptor calls POST /auth/refresh (uses refresh token cookie)
 *   3. Server issues new access + refresh tokens (set via cookies)
 *   4. Original request is retried automatically
 *   5. If refresh also fails → user is logged out
 *
 * Interview note: This is the standard approach used in production SPAs.
 * The key insight is that multiple concurrent 401s should only trigger
 * ONE refresh — we use a promise queue to handle this.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Always send cookies (httpOnly access + refresh tokens)
  timeout: 15000,        // 15s timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Token Refresh Queue ──────────────────────────────────────────────────────
// Prevents multiple concurrent 401s from triggering multiple refresh calls.
// All 401 requests queue behind a single refresh attempt.

let isRefreshing = false;
let failedQueue = [];

function processQueue(error) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
}

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401 errors (not 403, which means "forbidden" not "expired")
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't retry refresh or login requests
    if (
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login")
    ) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Attempt to refresh tokens
      await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      // Refresh succeeded — retry all queued requests
      processQueue(null);

      // Retry the original request
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed — reject all queued requests
      processQueue(refreshError);

      // Dispatch a custom event that the app can listen for
      window.dispatchEvent(new CustomEvent("auth:session-expired"));

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Add request timestamp for performance monitoring
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
