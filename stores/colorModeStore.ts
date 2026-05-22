import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ColorModeStore {
  mode: "light" | "dark";
  setMode: (mode: "light" | "dark") => void;
}

export const useColorModeStore = create<ColorModeStore>()(
  persist(
    (set) => ({
      mode: "light",
      setMode: (mode) => {
        if (typeof document !== "undefined") {
          if (mode === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
        set({ mode });
      },
    }),
    {
      name: "sales_web_color",
      onRehydrateStorage: () => (state) => {
        if (typeof document !== "undefined" && state) {
          if (state.mode === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      },
    },
  ),
);
