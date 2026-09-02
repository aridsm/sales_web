import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CompanyGuard from "@/app/components/CompanyGuard";
import { useUserStore } from "@/stores/userStore";
import { useTokenStore } from "@/stores/tokenStore";

const mockPush = vi.fn();
let mockPathname = "/";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

describe("CompanyGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/";
    useTokenStore.setState({ token: "fake-jwt-token" });
    useUserStore.setState({
      currentUser: null,
      activeCompany: null,
      companies: [],
      loading: false,
    });
  });

  it("renderiza children normalmente na rota /account mesmo sem empresa ativa", () => {
    mockPathname = "/account";
    useUserStore.setState({
      currentUser: {
        id: "u1",
        name: "User Test",
        email: "test@example.com",
        company_id: null,
        created_at: "2026-01-01",
      },
    });

    render(
      <CompanyGuard>
        <div>Account Screen Content</div>
      </CompanyGuard>
    );

    expect(screen.getByText("Account Screen Content")).toBeInTheDocument();
  });

  it("exibe loading enquanto carrega os dados do usuário", () => {
    mockPathname = "/products";
    useUserStore.setState({
      currentUser: null,
      loading: true,
    });

    render(
      <CompanyGuard>
        <div>Protected Content</div>
      </CompanyGuard>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("exibe o container de bloqueio quando o usuário não possui empresa ativa fora de /account", () => {
    mockPathname = "/products";
    useUserStore.setState({
      currentUser: {
        id: "u1",
        name: "User Test",
        email: "test@example.com",
        company_id: null,
        created_at: "2026-01-01",
      },
      loading: false,
    });

    render(
      <CompanyGuard>
        <div>Protected Content</div>
      </CompanyGuard>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getAllByText("Nenhuma empresa ativa").length).toBeGreaterThan(0);
    expect(
      screen.getByText(
        "Nada para exibir. Você não possui uma empresa ativa selecionada no momento. Ative, crie ou selecione uma empresa para começar."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Ativar uma empresa")).toBeInTheDocument();
  });

  it("ao clicar no botão de ativar empresa redireciona para /account", () => {
    mockPathname = "/categories";
    useUserStore.setState({
      currentUser: {
        id: "u1",
        name: "User Test",
        email: "test@example.com",
        company_id: null,
        created_at: "2026-01-01",
      },
      loading: false,
    });

    render(
      <CompanyGuard>
        <div>Protected Content</div>
      </CompanyGuard>
    );

    const button = screen.getByRole("button", { name: "Ativar uma empresa" });
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith("/account");
  });

  it("renderiza children normalmente quando o usuário possui company_id ativo", () => {
    mockPathname = "/products";
    useUserStore.setState({
      currentUser: {
        id: "u1",
        name: "User Test",
        email: "test@example.com",
        company_id: "comp-123",
        created_at: "2026-01-01",
      },
      loading: false,
    });

    render(
      <CompanyGuard>
        <div>Protected Content</div>
      </CompanyGuard>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(screen.queryByText("Ativar uma empresa")).not.toBeInTheDocument();
  });
});
