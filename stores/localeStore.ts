import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LocaleStore {
  locale: string;
  setLocale: (locale: string) => void;
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: "pt-BR",
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "sales_web_locale",
    },
  ),
);
