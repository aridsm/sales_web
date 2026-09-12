import { describe, it, expect, beforeEach } from 'vitest';
import { useMobileMenuStore } from '@/stores/mobileMenuStore';

describe('mobileMenuStore', () => {
  beforeEach(() => {
    useMobileMenuStore.getState().closeMobileMenu();
  });

  it('initializes with isOpen = false', () => {
    expect(useMobileMenuStore.getState().isOpen).toBe(false);
  });

  it('opens and closes mobile menu correctly', () => {
    useMobileMenuStore.getState().openMobileMenu();
    expect(useMobileMenuStore.getState().isOpen).toBe(true);

    useMobileMenuStore.getState().closeMobileMenu();
    expect(useMobileMenuStore.getState().isOpen).toBe(false);
  });

  it('toggles mobile menu state', () => {
    useMobileMenuStore.getState().toggleMobileMenu();
    expect(useMobileMenuStore.getState().isOpen).toBe(true);

    useMobileMenuStore.getState().toggleMobileMenu();
    expect(useMobileMenuStore.getState().isOpen).toBe(false);
  });

  it('sets open state explicitly', () => {
    useMobileMenuStore.getState().setIsOpen(true);
    expect(useMobileMenuStore.getState().isOpen).toBe(true);

    useMobileMenuStore.getState().setIsOpen(false);
    expect(useMobileMenuStore.getState().isOpen).toBe(false);
  });
});
