import React, { useState, useEffect, useMemo } from "react";
import AppModal from "../../../components/AppModal";
import AppCard from "../../../components/AppCard";
import AppInputText from "../../../components/inputs/AppInputText";
import AppSelect from "../../../components/inputs/AppSelect";
import AppButton from "../../../components/AppButton";
import AppLoading from "../../../components/AppLoading";
import AppPagination from "../../../components/AppPagination";
import AppTabs from "../../../components/AppTabs";
import {
  DeleteOutlined,
  ExitToAppOutlined,
  MailOutlined,
} from "@mui/icons-material";
import { useTranslation } from "@/app/utils/i18n";
import { useDialogStore } from "@/stores/dialogStore";
import { companyService } from "@/api/services/CompanyService";
import {
  CompanyListItem,
  CompanyUser,
  CompanyInvitation,
  getApiError,
} from "@/api/schemas";
import { User } from "@/api/schemas/User";
import { CompanyPermission } from "@/enums/CompanyPermission";
import { InvitationStatus } from "@/enums/InvitationStatus";
import { usePagination } from "@/app/utils/usePagination";
import { formatDate } from "@/app/utils/formatters/date";

import UserInitials from "./UserInitials";

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyListItem | null;
  currentUser: User | null;
  onLeaveSuccess?: () => void;
  onMemberChanged?: () => void;
}

export default function ManageMembersModal({
  isOpen,
  onClose,
  company,
  currentUser,
  onLeaveSuccess,
  onMemberChanged,
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
          return {
            items: [],
            page: 1,
            page_size: 10,
            total_items: 0,
            total_pages: 0,
          };
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
          return {
            items: [],
            page: 1,
            page_size: 10,
            total_items: 0,
            total_pages: 0,
          };
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

  const invitationsPagination = usePagination<CompanyInvitation>(
    invitationsService,
    {
      page_size: 10,
      status: InvitationStatus.PENDING,
    },
  );

  useEffect(() => {
    if (!isOpen) {
      membersPagination.setItems([]);
      invitationsPagination.setItems([]);
      setInviteEmail("");
      setInvitePermission(CompanyPermission.VIEW);
      setActiveTab("membros");
      return;
    }

    if (company?.id) {
      if (activeTab === "membros") {
        membersPagination.load({ replace: true });
      } else if (activeTab === "pendentes") {
        invitationsPagination.load({ replace: true });
      }
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
      onMemberChanged?.();
    } catch (err) {
      const { code } = getApiError(err);
      openDialog({
        variant: "error",
        message: code
          ? t(`errors.companies.${code}`)
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
          onMemberChanged?.();
        } catch (err) {
          const { code } = getApiError(err);
          openDialog({
            variant: "error",
            message: code
              ? t(`errors.companies.${code}`)
              : t("labels.account.member_remove_error"),
          });
        }
      },
    });
  };

  const handleCancelInvitation = (invitationId: string, email: string) => {
    if (!company) return;
    openDialog({
      variant: "confirm",
      title: t("labels.account.cancel_invitation"),
      message: t("labels.account.cancel_invitation_confirm", { name: email }),
      confirmLabel: t("labels.account.cancel_invitation"),
      onConfirm: async () => {
        try {
          await companyService.cancelInvitation(company.id, invitationId);
          openDialog({
            variant: "success",
            message: t("labels.account.invitation_cancelled"),
          });
          invitationsPagination.load();
        } catch (err) {
          const { code } = getApiError(err);
          openDialog({
            variant: "error",
            message: code
              ? t(`errors.companies.${code}`)
              : t("errors.all.generic"),
          });
        }
      },
    });
  };

  const handleLeaveCompany = () => {
    if (!company || !currentUser) return;
    openDialog({
      variant: "confirm",
      title: t("labels.all.exit"),
      message: t("labels.account.leave_company_confirm", {
        name: company.name,
      }),
      confirmLabel: t("labels.all.exit"),
      onConfirm: async () => {
        try {
          await companyService.removeMeFromCompany(company.id);
          onLeaveSuccess?.();
          onClose();
          openDialog({
            variant: "success",
            message: t("labels.account.left_company"),
          });
          window.location.reload();
        } catch (err) {
          const { code } = getApiError(err);
          openDialog({
            variant: "error",
            message: code
              ? t(`errors.companies.${code}`)
              : t("labels.account.left_company_error"),
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
      onMemberChanged?.();
    } catch (err) {
      const { code } = getApiError(err);
      openDialog({
        variant: "error",
        message: code
          ? t(`errors.companies.${code}`)
          : t("labels.account.permission_update_error"),
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
      className="max-w-2xl! w-full"
      title={
        company
          ? t("labels.account.members_modal_title", {
              name: company.name,
            })
          : ""
      }
    >
      <div className="flex flex-col gap-4 w-full animate-in fade-in duration-200">
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
          <div className="flex flex-col flex-1 min-h-0 justify-between">
            <div className="flex flex-col">
              <h4 className="font-semibold text-foreground mb-2">
                {t("labels.account.active_members")} (
                {membersPagination.pageData.total_items})
              </h4>

              {loadingMembers ? (
                <div className="flex justify-center py-6">
                  <AppLoading />
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
                          <UserInitials
                            name={mem.user_name || mem.user_email || "?"}
                            imageUrl={
                              mem.user_avatar_url ||
                              (isMe ? currentUser?.avatar_url : undefined)
                            }
                            size="md"
                            className="w-11 h-11 sm:w-12 sm:h-12 text-sm sm:text-base font-semibold shrink-0"
                          />
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground truncate">
                                {mem.user_name || mem.user_email}
                              </span>
                              {isMe && (
                                <span className="text-xs px-1.5 py-0.5 rounded-xs bg-red-500/10 text-red-700 dark:bg-red-400/10 dark:text-red-500 font-semibold select-none tracking-wider">
                                  {t("labels.account.you")}
                                </span>
                              )}
                            </div>
                            {mem.user_job_title ? (
                              <span className="text-label truncate">
                                {mem.user_job_title}{" "}
                                {mem.user_email ? `| ${mem.user_email}` : ""}
                              </span>
                            ) : (
                              <span className="text-label truncate">
                                {mem.user_email}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          {!canManage ? (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-xs shrink-0 ${
                                mem.permission === 3
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  : mem.permission === 2
                                    ? "bg-primary/10 text-primary"
                                    : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {t(
                                `labels.account.permissions.${mem.permission}`,
                              )}
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
            <div className="flex flex-col gap-3">
              <AppPagination pagination={membersPagination} />

              {currentUser && company && (
                <AppCard className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-4">
                  <div className="flex flex-col gap-1">
                    <span className=" font-semibold md:text-base text-foreground">
                      {t("labels.account.leave_company")}
                    </span>
                    <span className="text-label">
                      {t("labels.account.leave_company_description")}
                    </span>
                  </div>

                  <AppButton
                    color="red"
                    className="gap-1.5 shrink-0 self-start sm:self-center"
                    onClick={handleLeaveCompany}
                    title={t("labels.account.leave_company")}
                  >
                    <ExitToAppOutlined style={{ fontSize: 16 }} />
                    {t("labels.account.leave_company")}
                  </AppButton>
                </AppCard>
              )}
            </div>
          </div>
        )}

        {activeTab === "adicionar" &&
          company?.permission === CompanyPermission.ADMIN && (
            <div className="flex flex-col min-h-[380px] animate-in fade-in duration-200">
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
                  color="primary"
                  disabled={isInviting || !inviteEmail}
                  className="w-full sm:w-auto h-10 px-6 shrink-0"
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
                {t("labels.account.invitations")} (
                {invitationsPagination.pageData.total_items})
              </h4>

              {invitationsPagination.loading ? (
                <div className="flex justify-center py-6">
                  <AppLoading />
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
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 select-none bg-primary/10 text-primary shadow-xs">
                          <MailOutlined style={{ fontSize: 16 }} />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-semibold text-foreground truncate">
                            {inv.user_email || t("labels.account.guest")}
                          </span>
                          <span className=" text-label">
                            {t("labels.account.invited_by_subtitle", {
                              name: `${inv.invited_by_name || t("labels.account.member")}${inv.invited_by_email ? ` (${inv.invited_by_email})` : ""}`,
                              date: formatDate(inv.created_at),
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-xs shrink-0 ${
                            inv.permission === 3
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : inv.permission === 2
                                ? "bg-primary/10 text-primary"
                                : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {t(`labels.account.permissions.${inv.permission}`)}
                        </span>
                        {company?.permission === CompanyPermission.ADMIN && (
                          <AppButton
                            color="transparent"
                            flat
                            className="w-8 h-8 p-0! flex items-center justify-center text-red-500! hover:bg-red-500/10! transition-colors shrink-0"
                            onClick={() =>
                              handleCancelInvitation(
                                inv.id,
                                inv.user_email || t("labels.account.guest"),
                              )
                            }
                            title={t("labels.account.cancel_invitation")}
                          >
                            <DeleteOutlined style={{ fontSize: 18 }} />
                          </AppButton>
                        )}
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
