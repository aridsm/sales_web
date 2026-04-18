import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BASE_API;

export const axiosClient = axios.create({
  baseURL,
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
