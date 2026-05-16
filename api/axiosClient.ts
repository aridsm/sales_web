import axios, { InternalAxiosRequestConfig } from "axios";
import { useTokenStore } from "@/stores/tokenStore";

const baseURL = process.env.NEXT_PUBLIC_BASE_API;

interface CustomAxiosConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
  formEncoded?: boolean;
  _retry?: boolean;
}

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

let isRefreshing = false;
let failedQueue: {
  resolve: (value: string | null) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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

export const setAuthToken = (token: string | null) => {
  if (token) {
    axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosClient.defaults.headers.common["Authorization"];
  }
};
