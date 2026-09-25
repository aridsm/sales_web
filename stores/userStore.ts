import { create } from "zustand";
import { User } from "@/api/schemas/User";
import { CompanyListItem } from "@/api/schemas/Company";
import { usersService } from "@/api/services/UserService";
import { companyService } from "@/api/services/CompanyService";
import { useTokenStore } from "./tokenStore";

interface UserState {
  currentUser: User | null;
  activeCompany: CompanyListItem | null;
  companies: CompanyListItem[];
  loading: boolean;
  fetchUserData: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  setCompanies: (companies: CompanyListItem[]) => void;
  clearUserData: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: null,
  activeCompany: null,
  companies: [],
  loading: false,

  fetchUserData: async () => {
    const token = useTokenStore.getState().token;
    if (!token) return;

    try {
      set({ loading: true });
      const [userRes, companiesRes] = await Promise.all([
        usersService.me(),
        companyService.getAll(),
      ]);
      const companyItems = Array.isArray(companiesRes)
        ? companiesRes
        : companiesRes?.items || [];
      const active =
        companyItems.find((c) => c.id === userRes.company_id) || null;
      set({
        currentUser: userRes,
        companies: companyItems,
        activeCompany: active,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  setCurrentUser: (user) => {
    const { companies } = get();
    const active = user
      ? companies.find((c) => c.id === user.company_id) || null
      : null;
    set({ currentUser: user ? { ...user } : null, activeCompany: active ? { ...active } : null });
  },

  setCompanies: (companies) => {
    const { currentUser } = get();
    const active = currentUser
      ? companies.find((c) => c.id === currentUser.company_id) || null
      : null;
    set({ companies: [...companies], activeCompany: active ? { ...active } : null });
  },

  clearUserData: () => {
    set({ currentUser: null, activeCompany: null, companies: [] });
  },
}));
