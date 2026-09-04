import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePermission } from "@/app/utils/usePermission";
import { useUserStore } from "@/stores/userStore";
import { CompanyPermission } from "@/enums/CompanyPermission";

describe("usePermission", () => {
  beforeEach(() => {
    useUserStore.setState({
      currentUser: null,
      activeCompany: null,
      companies: [],
      loading: false,
    });
  });

  it("retorna canEdit: false e isAdmin: false quando não há usuário logado", () => {
    const { result } = renderHook(() => usePermission());
    expect(result.current.canEdit).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.permission).toBeUndefined();
  });

  it("retorna canEdit: false e isAdmin: false para permission = VIEW", () => {
    useUserStore.setState({
      currentUser: {
        id: "u1",
        name: "Viewer",
        email: "view@example.com",
        created_at: "2026-01-01",
        permission: CompanyPermission.VIEW,
      },
    });

    const { result } = renderHook(() => usePermission());
    expect(result.current.canEdit).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.permission).toBe(CompanyPermission.VIEW);
  });

  it("retorna canEdit: true e isAdmin: false para permission = VIEW_EDIT", () => {
    useUserStore.setState({
      currentUser: {
        id: "u2",
        name: "Editor",
        email: "edit@example.com",
        created_at: "2026-01-01",
        permission: CompanyPermission.VIEW_EDIT,
      },
    });

    const { result } = renderHook(() => usePermission());
    expect(result.current.canEdit).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.permission).toBe(CompanyPermission.VIEW_EDIT);
  });

  it("retorna canEdit: true e isAdmin: true para permission = ADMIN", () => {
    useUserStore.setState({
      currentUser: {
        id: "u3",
        name: "Admin",
        email: "admin@example.com",
        created_at: "2026-01-01",
        permission: CompanyPermission.ADMIN,
      },
    });

    const { result } = renderHook(() => usePermission());
    expect(result.current.canEdit).toBe(true);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.permission).toBe(CompanyPermission.ADMIN);
  });

  it("faz fallback para activeCompany.permission se currentUser.permission não estiver definido", () => {
    useUserStore.setState({
      currentUser: {
        id: "u4",
        name: "User without direct perm",
        email: "fallback@example.com",
        created_at: "2026-01-01",
      },
      activeCompany: {
        id: "10",
        name: "Fallback Company",
        permission: CompanyPermission.VIEW,
        created_at: "2026-01-01",
      },
    });

    const { result } = renderHook(() => usePermission());
    expect(result.current.canEdit).toBe(false);
    expect(result.current.permission).toBe(CompanyPermission.VIEW);
  });
});
