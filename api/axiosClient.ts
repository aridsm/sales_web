import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BASE_API;

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

axiosClient.interceptors.request.use((config) => {
  if (config.url === "/users/login") {
    config.headers["Content-Type"] = "application/x-www-form-urlencoded";
  }
  return config;
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosClient.defaults.headers.common["Authorization"];
  }
};
