"use client";

import { useEffect } from "react";
import { useTokenStore } from "@/stores/tokenStore";
import { setAuthToken } from "@/api/axiosClient";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, setToken } = useTokenStore();

  useEffect(() => {
    const storedToken = localStorage.getItem("token-storage");
    if (storedToken) {
      try {
        const parsed = JSON.parse(storedToken);
        if (parsed.state?.token) {
          setToken(parsed.state.token);
        }
      } catch (e) {
        console.error("Error parsing token from localStorage", e);
      }
    }
  }, [setToken]);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  return <>{children}</>;
}
