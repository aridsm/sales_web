import axios from "axios";

const baseURL = process.env.BASE_API;

export const axiosClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
