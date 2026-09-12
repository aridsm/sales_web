import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AppHeader from "@/app/components/AppHeader";
import { useUserStore } from "@/stores/userStore";
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

describe("AppHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.innerWidth = 1024;
    mockPathname = "/";
    useTokenStore.setState({ token: "fake-jwt-token" });
    useUserStore.setState({
      currentUser: {
        id: "u1",
        name: "Ana Terra",
        email: "ana@empresa.com",
        company_id: "c1",
        created_at: "2026-01-01",
      },
      activeCompany: {
        id: "c1",
        name: "Minha Empresa",
        permission: "OWNER" as any,
        created_at: "2026-01-01",
      },
      companies: [],
      loading: false,
    });
  });

  it("renderiza o título da página e as iniciais do usuário", () => {
    render(<AppHeader title="Dashboard" />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("AT")).toBeInTheDocument();
  });

  it("redireciona diretamente para /account ao clicar no avatar em telas desktop (>= 900px)", () => {
    window.innerWidth = 1024;
    render(<AppHeader title="Dashboard" />);

    const avatarButton = screen.getByText("AT");
    fireEvent.click(avatarButton);

    expect(mockPush).toHaveBeenCalledWith("/account");
  });

  it("abre o dropdown de usuário ao clicar no avatar em telas mobile (< 900px)", () => {
    window.innerWidth = 600;
    render(<AppHeader title="Dashboard" />);

    const avatarButton = screen.getByText("AT");
    fireEvent.click(avatarButton);

    // Dropdown content should now be visible
    expect(screen.getByText("Ana Terra")).toBeInTheDocument();
    expect(screen.getByText("ana@empresa.com")).toBeInTheDocument();
    expect(screen.getAllByText("Minha Empresa").length).toBeGreaterThan(0);
    expect(screen.getByText("Configurações")).toBeInTheDocument();
    expect(screen.getByText("Sair")).toBeInTheDocument();
  });

  it("redireciona para /account ao clicar em Configurações no dropdown", () => {
    window.innerWidth = 600;
    render(<AppHeader title="Dashboard" />);

    const avatarButton = screen.getByText("AT");
    fireEvent.click(avatarButton);

    const settingsButton = screen.getByText("Configurações");
    fireEvent.click(settingsButton);

    expect(mockPush).toHaveBeenCalledWith("/account");
  });

  it("executa logout e redireciona para /login ao clicar em Sair no dropdown", async () => {
    window.innerWidth = 600;
    render(<AppHeader title="Dashboard" />);

    const avatarButton = screen.getByText("AT");
    fireEvent.click(avatarButton);

    const logoutButton = screen.getByText("Sair");
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(usersService.logout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/login");
      expect(useTokenStore.getState().token).toBeNull();
    });
  });
});
