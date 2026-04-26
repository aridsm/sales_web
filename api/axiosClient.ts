import axios, { InternalAxiosRequestConfig } from "axios";
import { useTokenStore } from "@/stores/tokenStore";

const baseURL = process.env.NEXT_PUBLIC_BASE_API;

/**
 * Extends Axios's internal request config with custom flags.
 * - `skipAuth` — skip the Authorization header (e.g. login, signup).
 * - `formEncoded` — set Content-Type to `application/x-www-form-urlencoded` instead of JSON.
 * - `_retry` — internal flag to prevent infinite retry loops on token refresh.
 */
interface CustomAxiosConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
  formEncoded?: boolean;
  _retry?: boolean;
}

/**
 * Pre-configured Axios instance used for all API calls.
 *
 * - Base URL is read from `NEXT_PUBLIC_BASE_API`.
 * - Arrays in query params are serialized as repeated keys: `?id=1&id=2`.
 * - `null` and `undefined` param values are automatically stripped.
 * - Default Content-Type is `application/json`.
 */
export const axiosClient = axios.create({
  baseURL,
  paramsSerializer: {
    serialize: (params) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, String(v)));
        } else {
          searchParams.set(key, String(value));
        }
      });
      return searchParams.toString();
    },
  },
  headers: {
    "Content-Type": "application/json",
  },
});

/** True while a token refresh request is in flight. Prevents multiple simultaneous refresh calls. */
let isRefreshing = false;
/** Queue of pending requests that arrived while a refresh was in progress. */
let failedQueue: any[] = [];

/**
 * Resolves or rejects all requests queued during a token refresh.
 *
 * Called after a refresh attempt completes:
 * - On success: resolves each queued promise with the new `token`.
 * - On failure: rejects each queued promise with the `error`.
 *
 * @param error - The error from a failed refresh, or `null` on success.
 * @param token - The new access token, or `null` on failure.
 */
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

/**
 * Exchanges the stored refresh token for a new access token.
 *
 * - Reads `refresh_token` from the Zustand token store.
 * - Uses a plain `axios` call (not `axiosClient`) to avoid interceptor loops.
 * - On success: saves the new tokens and flushes the pending request queue.
 * - On failure: clears the token store, redirects to `/login`, and re-throws.
 *
 * @throws {Error} If no refresh token is stored or the refresh request fails.
 * @returns The new access token string.
 */
const refreshToken = async () => {
  const { refresh_token, setTokenData, clearToken } = useTokenStore.getState();
  if (!refresh_token) {
    clearToken();
    window.location.href = "/login";
    throw new Error("No refresh token");
  }

  isRefreshing = true;
  try {
    const response = await axios.post(`${baseURL}/users/refresh_token`, {
      refresh_token,
    });

    const {
      access_token,
      refresh_token: newRefreshToken,
      expires_at,
    } = response.data;

    setTokenData(access_token, newRefreshToken, expires_at);
    processQueue(null, access_token);
    return access_token;
  } catch (error) {
    processQueue(error, null);
    clearToken();
    window.location.href = "/login";
    throw error;
  } finally {
    isRefreshing = false;
  }
};

/**
 * Request interceptor — runs before every outgoing request.
 *
 * 1. If `skipAuth` is set, bypasses auth logic entirely.
 *    - If `formEncoded` is also set, overrides Content-Type to `application/x-www-form-urlencoded`.
 * 2. If the stored token is expired, proactively refreshes it before the request goes out.
 *    - If a refresh is already in progress, queues the request and waits.
 * 3. If the token is still valid, attaches it as a Bearer Authorization header.
 */
axiosClient.interceptors.request.use(async (config: CustomAxiosConfig) => {
  const { token, expires_at } = useTokenStore.getState();

  if (config.skipAuth) {
    if (config.formEncoded) {
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
    return config;
  }

  if (expires_at) {
    const isExpired = new Date(expires_at).getTime() < Date.now();

    if (isExpired) {
      if (isRefreshing) {
        try {
          const newToken = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          config.headers.Authorization = `Bearer ${newToken}`;
          return config;
        } catch (error) {
          return Promise.reject(error);
        }
      }

      try {
        const newToken = await refreshToken();
        config.headers.Authorization = `Bearer ${newToken}`;
        return config;
      } catch (error) {
        return Promise.reject(error);
      }
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Response interceptor — runs after every response (or on network error).
 *
 * Handles two failure cases:
 * 1. **401 / 403 with no refresh token** — clears auth state and redirects to `/login`.
 * 2. **`errorExpiredToken` message** — the server signalled expiry that the proactive check
 *    missed. Triggers a token refresh and retries the original request once (`_retry` flag
 *    prevents infinite loops). If a refresh is already in progress, queues the retry.
 */
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosConfig;
    const { refresh_token, clearToken } = useTokenStore.getState();

    const status = error.response?.status;
    const isUnauthorized = status === 401 || status === 403;
    const isExpiredError =
      error.response?.data?.message === "errorExpiredToken" ||
      error.response?.data === "errorExpiredToken";

    if (isUnauthorized && !refresh_token) {
      clearToken();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isExpiredError && !originalRequest._retry && refresh_token) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Manually sets or removes the Authorization header on the `axiosClient` defaults.
 *
 * Useful for initializing the token on app load (e.g. after hydrating from storage)
 * without going through the store interceptor.
 *
 * @param token - The access token to set, or `null` to remove the header.
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosClient.defaults.headers.common["Authorization"];
  }
};
