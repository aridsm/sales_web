import React, { useState, useEffect, useMemo } from "react";
import AppModal from "../../../components/AppModal";
import AppInputText from "../../../components/inputs/AppInputText";
import AppSelect from "../../../components/inputs/AppSelect";
import AppButton from "../../../components/AppButton";
import AppPagination from "../../../components/AppPagination";
import AppTabs from "../../../components/AppTabs";
import { DeleteOutlined, ExitToAppOutlined, MailOutlined } from "@mui/icons-material";
import { useTranslation } from "@/app/utils/i18n";
import { useDialogStore } from "@/stores/dialogStore";
import { companyService } from "@/api/services/CompanyService";
import { CompanyListItem, CompanyUser, CompanyInvitation } from "@/api/schemas/Company";
import { User } from "@/api/schemas/User";
import { CompanyPermission } from "@/enums/CompanyPermission";
import { InvitationStatus } from "@/enums/InvitationStatus";
import { usePagination } from "@/app/utils/usePagination";
import { formatDate } from "@/app/utils/formatters/date";

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyListItem | null;
  currentUser: User | null;
  onLeaveSuccess?: () => void;
}

function getUserInitials(name?: string | null) {
  if (!name) return "U";
  const initials = name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return initials || "U";
}

function getUserColor(name?: string | null) {
  if (!name) return "bg-primary-3 text-white";
  const colors = [
    "bg-red-500 text-white",
    "bg-orange-500 text-white",
    "bg-amber-500 text-white",
    "bg-emerald-500 text-white",
    "bg-teal-500 text-white",
    "bg-cyan-500 text-white",
    "bg-sky-500 text-white",
    "bg-blue-500 text-white",
    "bg-indigo-500 text-white",
    "bg-violet-500 text-white",
    "bg-purple-500 text-white",
    "bg-fuchsia-500 text-white",
    "bg-pink-500 text-white",
    "bg-rose-500 text-white",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export default function ManageMembersModal({
  isOpen,
  onClose,
  company,
  currentUser,
  onLeaveSuccess,
}: ManageMembersModalProps) {
  const { t } = useTranslation();
  const { openDialog } = useDialogStore();

  const [activeTab, setActiveTab] = useState<string>("membros");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePermission, setInvitePermission] = useState<CompanyPermission>(
    CompanyPermission.VIEW,
  );
  const [isInviting, setIsInviting] = useState(false);

  const membersService = useMemo(() => {
    return {
      getAll: async (params?: Record<string, unknown>) => {
        if (!company?.id) {
          return { items: [], page: 1, page_size: 10, total_items: 0, total_pages: 0 };
        }
        return await companyService.getCompanyUsers(company.id, params);
      },
    };
  }, [company]);

  const membersPagination = usePagination<CompanyUser>(membersService, {
    page_size: 10,
  });

  const { items: members, loading: loadingMembers } = membersPagination;

  const invitationsService = useMemo(() => {
    return {
      getAll: async (params?: Record<string, unknown>) => {
        if (!company?.id) {
          return { items: [], page: 1, page_size: 10, total_items: 0, total_pages: 0 };
        }
        const res = await companyService.getInvitations(company.id, params);
        const items = Array.isArray(res) ? res : [];
        return {
          items,
          page: 1,
          page_size: items.length || 10,
          total_items: items.length,
          total_pages: 1,
        };
      },
    };
  }, [company]);

  const invitationsPagination = usePagination<CompanyInvitation>(invitationsService, {
    page_size: 10,
    status: InvitationStatus.PENDING,
  });

  // Fetch members or invitations when company, tab, or modal opens
  useEffect(() => {
    if (isOpen && company?.id) {
      if (activeTab === "membros") {
        membersPagination.load({ replace: true });
      } else if (activeTab === "pendentes") {
        invitationsPagination.load({ replace: true });
      }
    } else {
      membersPagination.setItems([]);
      invitationsPagination.setItems([]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInviteEmail("");
      setInvitePermission(CompanyPermission.VIEW);
      setActiveTab("membros");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, company?.id, activeTab]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !inviteEmail.trim()) return;
    try {
      setIsInviting(true);
      await companyService.inviteUser(
        company.id,
        inviteEmail.trim(),
        invitePermission,
      );
      setInviteEmail("");
      openDialog({
        variant: "success",
        message: t("labels.account.member_invited"),
        onConfirm: () => {
          setActiveTab("pendentes");
        },
      });
      setActiveTab("pendentes");
    } catch (err: any) {
      const errMsg = err.response?.data?.detail?.error;
      openDialog({
        variant: "error",
        message: errMsg
          ? t(`errors.auth.${errMsg}`)
          : t("labels.account.member_invite_error"),
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = (userId: string, name: string) => {
    if (!company) return;
    openDialog({
      variant: "confirm",
      title: t("labels.all.remove"),
      message: t("labels.account.remove_member_confirm", { name }),
      confirmLabel: t("labels.all.remove"),
      onConfirm: async () => {
        try {
          await companyService.removeMember(company.id, userId);
          openDialog({
            variant: "success",
            message: t("labels.account.member_removed"),
          });
          membersPagination.load();
        } catch {
          openDialog({
            variant: "error",
            message: t("labels.account.member_remove_error"),
          });
        }
      },
    });
  };

  const handleLeaveCompany = () => {
    if (!company || !currentUser) return;
    openDialog({
      variant: "confirm",
      title: t("labels.account.leave_company"),
      message: t("labels.account.leave_company_confirm", {
        name: company.name,
      }),
      confirmLabel: t("labels.account.leave_company"),
      onConfirm: async () => {
        try {
          await companyService.removeMeFromCompany(company.id);
          onLeaveSuccess?.();
          onClose();
          openDialog({
            variant: "success",
            message: t("labels.account.left_company"),
          });
        } catch {
          openDialog({
            variant: "error",
            message: t("labels.account.left_company_error"),
          });
        }
      },
    });
  };

  const handlePermissionChange = async (
    userId: string,
    perm: CompanyPermission,
  ) => {
    if (!company) return;
    try {
      await companyService.updateMemberPermission(company.id, userId, perm);
      openDialog({
        variant: "success",
        message: t("labels.account.permission_updated"),
      });
      membersPagination.load();
    } catch {
      openDialog({
        variant: "error",
        message: t("labels.account.permission_update_error"),
      });
    }
  };

  const permissionOptions = useMemo(
    () => [
      { id: CompanyPermission.VIEW, name: t("labels.account.permissions.1") },
      {
        id: CompanyPermission.VIEW_EDIT,
        name: t("labels.account.permissions.2"),
      },
      { id: CompanyPermission.ADMIN, name: t("labels.account.permissions.3") },
    ],
    [t],
  );

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg! w-full"
      title={
        company
          ? t("labels.account.members_modal_title", {
              name: company.name,
            })
          : ""
      }
    >
      <div className="flex flex-col gap-4 pt-1 w-full animate-in fade-in duration-200">
        <AppTabs
          tabs={[
            { value: "membros", label: t("labels.account.tab_members") },
            ...(company?.permission === CompanyPermission.ADMIN
              ? [{ value: "adicionar", label: t("labels.account.tab_add") }]
              : []),
            { value: "pendentes", label: t("labels.account.tab_pending") },
          ]}
          activeTab={activeTab}
          onChange={(val) => setActiveTab(val)}
          fullWidth
        />

        {activeTab === "membros" && (
          <div className="flex flex-col mt-1 min-h-[380px] justify-between">
            <div className="flex flex-col">
              <h4 className="font-semibold text-foreground mb-2">
                {t("labels.account.active_members")} ({membersPagination.pageData.total_items})
              </h4>

              {loadingMembers ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-3" />
                </div>
              ) : (
                <div className="flex flex-col max-h-80 overflow-y-auto scrollbar-thin">
                  {members.map((mem) => {
                    const isMe = mem.user_id === currentUser?.id;
                    const canManage =
                      company?.permission === CompanyPermission.ADMIN && !isMe;

                    return (
                      <div
                        key={mem.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3 border-b border-border last:border-b-0"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 select-none shadow-xs ${getUserColor(mem.user_name)}`}
                          >
                            {getUserInitials(mem.user_name)}
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground text-sm truncate">
                                {mem.user_name}
                              </span>
                              {isMe && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-primary-3 text-white font-semibold select-none tracking-wider">
                                  {t("labels.account.you")}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-label truncate">
                              {mem.user_email}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          {isMe && (
                            <AppButton
                              color="transparent"
                              flat
                              className="text-red-500! hover:bg-red-500/10! transition-colors text-xs font-semibold px-2 py-1 h-8 flex items-center gap-1.5 shrink-0"
                              onClick={handleLeaveCompany}
                              title={t("labels.account.leave_company")}
                            >
                              <ExitToAppOutlined style={{ fontSize: 16 }} />
                              <span>{t("labels.account.leave_company")}</span>
                            </AppButton>
                          )}
                          {!canManage ? (
                            <span className="text-xs font-medium bg-primary-4 text-primary-3 dark:text-primary dark:bg-primary-light px-1.5 py-0.5 rounded">
                              {t(`labels.account.permissions.${mem.permission}`)}
                            </span>
                          ) : (
                            <>
                              <div className="w-36 shrink-0">
                                <AppSelect
                                  size="small"
                                  value={mem.permission}
                                  onChange={(val) =>
                                    handlePermissionChange(
                                      mem.user_id,
                                      Number(val) as CompanyPermission,
                                    )
                                  }
                                  options={permissionOptions}
                                />
                              </div>
                              <AppButton
                                color="transparent"
                                flat
                                className="w-8 h-8 p-0! flex items-center justify-center text-red-500! hover:bg-red-500/10! transition-colors shrink-0"
                                onClick={() =>
                                  handleRemoveMember(
                                    mem.user_id,
                                    mem.user_name || "",
                                  )
                                }
                                title={t("labels.all.remove")}
                              >
                                <DeleteOutlined style={{ fontSize: 18 }} />
                              </AppButton>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <AppPagination pagination={membersPagination} />
          </div>
        )}

        {activeTab === "adicionar" && company?.permission === CompanyPermission.ADMIN && (
          <div className="flex flex-col mt-1 min-h-[380px] animate-in fade-in duration-200">
            <form
              onSubmit={handleInviteMember}
              className="flex flex-col gap-4 pt-2 w-full"
            >
              <div className="flex-1 w-full">
                <AppInputText
                  label={t("labels.account.member_email")}
                  type="email"
                  placeholder={t("labels.account.member_email_placeholder")}
                  value={inviteEmail}
                  onChange={(e) =>
                    setInviteEmail((e.target.value as string) || "")
                  }
                  required
                  className="w-full"
                />
              </div>
              <div className="w-full shrink-0">
                <AppSelect
                  label={t("labels.account.member_permission")}
                  value={invitePermission}
                  onChange={(val) =>
                    setInvitePermission(Number(val) as CompanyPermission)
                  }
                  options={permissionOptions}
                />
              </div>
              <AppButton
                type="submit"
                color="primary-3"
                disabled={isInviting || !inviteEmail}
                className="w-full sm:w-auto h-10 px-6 text-xs font-semibold shrink-0"
              >
                {t("labels.account.invite_button")}
              </AppButton>
            </form>
          </div>
        )}

        {activeTab === "pendentes" && (
          <div className="flex flex-col mt-1 min-h-[380px] justify-between animate-in fade-in duration-200">
            <div className="flex flex-col">
              <h4 className="font-semibold text-foreground mb-2">
                {t("labels.account.invitations")} ({invitationsPagination.pageData.total_items})
              </h4>

              {invitationsPagination.loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-3" />
                </div>
              ) : invitationsPagination.items.length === 0 ? (
                <div className="text-center py-8 text-label text-sm">
                  {t("labels.account.no_invitations")}
                </div>
              ) : (
                <div className="flex flex-col max-h-80 overflow-y-auto scrollbar-thin">
                  {invitationsPagination.items.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3 border-b border-border last:border-b-0"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 select-none bg-indigo-500/10 text-indigo-500 shadow-xs">
                          <MailOutlined style={{ fontSize: 16 }} />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-semibold text-foreground text-sm truncate">
                            {inv.user_email || t("labels.account.guest")}
                          </span>
                          <span className="text-xs text-label">
                            {t("labels.account.invited_by_subtitle", {
                              name: `${inv.invited_by_name || t("labels.account.member")}${inv.invited_by_email ? ` (${inv.invited_by_email})` : ""}`,
                              date: formatDate(inv.created_at),
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <span className="text-xs font-medium bg-primary-4 text-primary-3 dark:text-primary dark:bg-primary-light px-1.5 py-0.5 rounded">
                          {t(`labels.account.permissions.${inv.permission}`)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <AppPagination pagination={invitationsPagination} />
          </div>
        )}
      </div>
    </AppModal>
  );
}
