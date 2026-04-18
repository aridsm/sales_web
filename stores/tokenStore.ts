import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TokenStore {
  token: string | null;
  refresh_token: string | null;
  expires_at: string | null;
  setToken: (token: string | null) => void;
  setTokenData: (token: string | null, refresh_token: string | null, expires_at: string | null) => void;
  clearToken: () => void;
}

export const useTokenStore = create<TokenStore>()(
  persist(
    (set) => ({
      token: null,
      refresh_token: null,
      expires_at: null,
      setToken: (token) => set({ token }),
      setTokenData: (token, refresh_token, expires_at) => set({ token, refresh_token, expires_at }),
      clearToken: () => set({ token: null, refresh_token: null, expires_at: null }),
    }),
    {
      name: "sales_web_token",
    },
  ),
);
