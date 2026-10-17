import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AppMenu from "@/app/components/AppMenu";
import { useMobileMenuStore } from "@/stores/mobileMenuStore";
import { useTokenStore } from "@/stores/tokenStore";
import { usersService } from "@/api/services/UserService";

const mockPush = vi.fn();
let mockPathname = "/";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

vi.mock("@/api/services/UserService", () => ({
  usersService: {
    logout: vi.fn().mockResolvedValue({}),
  },
}));

describe("AppMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/";
    useMobileMenuStore.getState().closeMobileMenu();
    useTokenStore.setState({ token: "fake-token" });
  });

  it("renderiza o menu desktop e os itens de navegação", () => {
    render(<AppMenu />);

    expect(screen.getByLabelText("Desktop Menu")).toBeInTheDocument();
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Produtos").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Categorias").length).toBeGreaterThan(0);
  });

  it("alterna a expansão do menu desktop ao clicar no botão de menu", () => {
    render(<AppMenu />);

    const toggleButton = screen.getByLabelText("Abrir menu");
    // Initially expanded - SalesApp logo is visible
    expect(screen.getAllByText("SalesApp").length).toBeGreaterThan(0);

    fireEvent.click(toggleButton);
    // After collapsing, the aside is still in the document with collapsed width class
    expect(screen.getByLabelText("Desktop Menu")).toHaveClass("w-18");
  });

  it("abre e fecha o menu mobile conforme o mobileMenuStore", () => {
    render(<AppMenu />);

    expect(useMobileMenuStore.getState().isOpen).toBe(false);

    useMobileMenuStore.getState().openMobileMenu();
    expect(useMobileMenuStore.getState().isOpen).toBe(true);

    const closeButton = screen.getByLabelText("Fechar menu");
    fireEvent.click(closeButton);
    expect(useMobileMenuStore.getState().isOpen).toBe(false);
  });

  it("executa logout e redireciona ao clicar em Sair", async () => {
    render(<AppMenu />);

    const logoutButtons = screen.getAllByText("Sair");
    fireEvent.click(logoutButtons[0]);

    await waitFor(() => {
      expect(usersService.logout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/login");
      expect(useTokenStore.getState().token).toBeNull();
    });
  });
});
