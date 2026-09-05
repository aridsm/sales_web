import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ManageMembersModal from "@/app/(pages)/account/components/ManageMembersModal";
import { CompanyListItem, CompanyUser, CompanyInvitation } from "@/api/schemas/Company";
import { User } from "@/api/schemas/User";
import { CompanyPermission } from "@/enums/CompanyPermission";
import { companyService } from "@/api/services/CompanyService";
import { useDialogStore } from "@/stores/dialogStore";
import { InvitationStatus } from "@/enums/InvitationStatus";

vi.mock("@/api/services/CompanyService", () => ({
  companyService: {
    getCompanyUsers: vi.fn(),
    getInvitations: vi.fn(),
    removeMeFromCompany: vi.fn(),
    inviteUser: vi.fn(),
    updateMemberPermission: vi.fn(),
    removeMember: vi.fn(),
  },
}));

describe("ManageMembersModal", () => {
  const mockCompany: CompanyListItem = {
    id: "comp-123",
    name: "Test Company",
    permission: CompanyPermission.ADMIN,
    created_at: "2026-08-01T00:00:00Z",
  };

  const mockUser: User = {
    id: "user-abc",
    name: "John Doe",
    email: "john@example.com",
    created_at: "2026-08-01T00:00:00Z",
  };

  const mockMembers: CompanyUser[] = [
    {
      id: "member-1",
      company_id: "comp-123",
      user_id: "user-abc",
      user_name: "John Doe",
      user_email: "john@example.com",
      permission: CompanyPermission.ADMIN,
      created_at: "2026-08-01T00:00:00Z",
    },
    {
      id: "member-2",
      company_id: "comp-123",
      user_id: "user-xyz",
      user_name: "Jane Smith",
      user_email: "jane@example.com",
      permission: CompanyPermission.VIEW,
      created_at: "2026-08-02T00:00:00Z",
    },
  ];

  const mockInvitations: CompanyInvitation[] = [
    {
      id: "invite-1",
      company_id: "comp-123",
      company_name: "Test Company",
      invited_by_name: "John Doe",
      invited_by_email: "john@example.com",
      user_id: "invited-user-id",
      user_name: null,
      user_email: "invited@example.com",
      permission: CompanyPermission.VIEW,
      status: InvitationStatus.PENDING,
      created_at: "2026-08-03T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useDialogStore.setState({
      open: false,
      options: { message: "", variant: "alert" },
    });

    vi.mocked(companyService.getCompanyUsers).mockResolvedValue({
      items: mockMembers,
      page: 1,
      page_size: 10,
      total_items: mockMembers.length,
      total_pages: 1,
    });

    vi.mocked(companyService.getInvitations).mockResolvedValue(mockInvitations);
  });

  it("renders active members tab and loads list of members by default", async () => {
    render(
      <ManageMembersModal
        isOpen={true}
        onClose={vi.fn()}
        company={mockCompany}
        currentUser={mockUser}
      />,
    );

    // Verify members names and roles are rendered
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // Header has the title and total count once loaded
    expect(screen.getByText("Membros Ativos (2)")).toBeInTheDocument();

    expect(companyService.getCompanyUsers).toHaveBeenCalledWith("comp-123", {
      page: 1,
      page_size: 10,
    });
  });

  it("allows switching between Membros, Adicionar, and Pendentes tabs", async () => {
    render(
      <ManageMembersModal
        isOpen={true}
        onClose={vi.fn()}
        company={mockCompany}
        currentUser={mockUser}
      />,
    );

    // Switch to Adicionar tab
    const addTabButton = screen.getByRole("button", { name: "Adicionar" });
    fireEvent.click(addTabButton);

    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByText("Permissão")).toBeInTheDocument();

    // Switch to Pendentes tab
    const pendingTabButton = screen.getByRole("button", { name: "Pendentes" });
    fireEvent.click(pendingTabButton);

    await waitFor(() => {
      expect(screen.getByText("invited@example.com")).toBeInTheDocument();
      expect(screen.getByText(/Por John Doe \(john@example\.com\) •/)).toBeInTheDocument();
    });

    expect(companyService.getInvitations).toHaveBeenCalledWith("comp-123", {
      page: 1,
      page_size: 10,
      status: InvitationStatus.PENDING,
    });
  });

  it("sends an invitation and navigates to the Pendentes tab upon success", async () => {
    vi.mocked(companyService.inviteUser).mockResolvedValue(undefined);

    render(
      <ManageMembersModal
        isOpen={true}
        onClose={vi.fn()}
        company={mockCompany}
        currentUser={mockUser}
      />,
    );

    // Go to Adicionar tab
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    // Fill the email input
    const emailInput = screen.getByLabelText("E-mail");
    fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });

    // Submit form
    const submitButton = screen.getByRole("button", { name: "Convidar" });
    fireEvent.submit(submitButton);

    await waitFor(() => {
      expect(companyService.inviteUser).toHaveBeenCalledWith(
        "comp-123",
        "newuser@example.com",
        CompanyPermission.VIEW,
      );
    });

    // Check that success dialog was opened
    const dialogState = useDialogStore.getState();
    expect(dialogState.open).toBe(true);
    expect(dialogState.options.variant).toBe("success");

    // Simulate dialog confirmation which shifts to Pending tab
    dialogState.options.onConfirm?.();

    await waitFor(() => {
      expect(screen.getByText("Convites Pendentes (1)")).toBeInTheDocument();
    });
  });

  it("calls removeMeFromCompany and triggers onLeaveSuccess when user leaves the company", async () => {
    vi.mocked(companyService.removeMeFromCompany).mockResolvedValue(undefined);
    const handleLeaveSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <ManageMembersModal
        isOpen={true}
        onClose={handleClose}
        company={mockCompany}
        currentUser={mockUser}
        onLeaveSuccess={handleLeaveSuccess}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Verify card message and leave button are displayed below members list
    expect(
      screen.getByText(
        "Você perderá o acesso a esta empresa e a todos os seus dados.",
      ),
    ).toBeInTheDocument();
    const leaveButton = screen.getByTitle("Sair da Empresa");
    fireEvent.click(leaveButton);

    // Open confirmation dialog
    let dialogState = useDialogStore.getState();
    expect(dialogState.open).toBe(true);
    expect(dialogState.options.variant).toBe("confirm");
    expect(dialogState.options.title).toBe("Sair");
    expect(dialogState.options.confirmLabel).toBe("Sair");

    // Confirm leaving
    await dialogState.options.onConfirm?.();

    // Verify removeMeFromCompany api call
    expect(companyService.removeMeFromCompany).toHaveBeenCalledWith("comp-123");
    expect(handleLeaveSuccess).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Check success dialog
    dialogState = useDialogStore.getState();
    expect(dialogState.open).toBe(true);
    expect(dialogState.options.variant).toBe("success");

    // Confirming success dialog should call leave callback again or do nothing
    dialogState.options.onConfirm?.();
  });
});
