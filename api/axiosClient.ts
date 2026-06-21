import axios, { InternalAxiosRequestConfig } from "axios";
import { useTokenStore } from "@/stores/tokenStore";

const baseURL = process.env.NEXT_PUBLIC_BASE_API;

export interface CustomAxiosConfig extends InternalAxiosRequestConfig {
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

const forceLogout = () => {
  const { clearToken } = useTokenStore.getState();
  clearToken();
  window.location.replace("/login");
};

const refreshAccessToken = async (): Promise<string> => {
  const { refresh_token, setTokenData } = useTokenStore.getState();

  if (!refresh_token) {
    forceLogout();
    throw new Error("No refresh token available");
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
    forceLogout();
    throw error;
  } finally {
    isRefreshing = false;
  }
};

axiosClient.interceptors.request.use((config: CustomAxiosConfig) => {
  if (config.formEncoded) {
    config.headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  if (config.skipAuth) {
    return config;
  }

  const { token } = useTokenStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosConfig;

    if (originalRequest?.skipAuth) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const isUnauthorized = status === 401;

    if (!isUnauthorized) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      forceLogout();
      return Promise.reject(error);
    }

    const { refresh_token } = useTokenStore.getState();

    if (!refresh_token) {
      forceLogout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;

    try {
      const newToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosClient(originalRequest);
    } catch (err) {
      return Promise.reject(err);
    }
  },
);
