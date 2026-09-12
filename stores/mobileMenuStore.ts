import { create } from "zustand";

interface MobileMenuState {
  isOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const useMobileMenuStore = create<MobileMenuState>((set) => ({
  isOpen: false,
  openMobileMenu: () => set({ isOpen: true }),
  closeMobileMenu: () => set({ isOpen: false }),
  toggleMobileMenu: () => set((state) => ({ isOpen: !state.isOpen })),
  setIsOpen: (isOpen) => set({ isOpen }),
}));
