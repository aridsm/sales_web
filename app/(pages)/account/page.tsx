"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/app/utils/i18n";
import { useDialogStore } from "@/stores/dialogStore";
import { useTokenStore } from "@/stores/tokenStore";
import { useUserStore } from "@/stores/userStore";
import AppPage from "../../components/AppPage";
import AppTabs, { AppTabItem } from "../../components/AppTabs";
import { usersService } from "@/api/services/UserService";
import { companyService } from "@/api/services/CompanyService";
import { User } from "@/api/schemas/User";
import { CompanyListItem, CompanyInvitation, getApiError } from "@/api/schemas";
import { usePagination } from "@/app/utils/usePagination";

import AccountProfileTab from "./components/tabs/AccountProfileTab";
import AccountSecurityTab from "./components/tabs/AccountSecurityTab";
import AccountCompanyTab from "./components/tabs/AccountCompanyTab";
import AccountCompaniesTab from "./components/tabs/AccountCompaniesTab";
import AccountPreferencesTab from "./components/tabs/AccountPreferencesTab";

import CreateCompanyModal from "./components/CreateCompanyModal";
import EditCompanyModal from "./components/EditCompanyModal";
import ManageMembersModal from "./components/ManageMembersModal";

import {
  PersonOutlined,
  LockOutlined,
  BusinessOutlined,
  ApartmentOutlined,
  SettingsOutlined,
} from "@mui/icons-material";

export default function AccountPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { openDialog } = useDialogStore();
  const clearToken = useTokenStore((state) => state.clearToken);

  const [activeTab, setActiveTab] = useState<string>("profile");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [invitations, setInvitations] = useState<CompanyInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersRefreshKey, setMembersRefreshKey] = useState(0);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyListItem | null>(
    null,
  );
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyListItem | null>(null);

  const companiesPagination = usePagination<CompanyListItem>(
    companyService as any,
  );

  useEffect(() => {
    useUserStore.getState().setCompanies(companiesPagination.items);
  }, [companiesPagination.items]);

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [userRes, invitationsRes] = await Promise.all([
        usersService.me(),
        usersService.getInvitations(),
      ]);
      setCurrentUser(userRes);
      setInvitations(invitationsRes);
      useUserStore.getState().setCurrentUser(userRes);
    } catch {
      openDialog({ variant: "error", message: t("errors.fallback") });
    } finally {
      if (!silent) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
    companiesPagination.load();
  }, [fetchData]);

  const handleSwitchCompany = async (companyId: string) => {
    try {
      await usersService.switchCompany(companyId);
      window.location.reload();
    } catch {
      openDialog({ variant: "error", message: t("errors.fallback") });
    }
  };

  const handleCreateCompany = async (companyName: string) => {
    try {
      await companyService.create(companyName);
      companiesPagination.load();
      fetchData(true);
      openDialog({
        variant: "success",
        message: t("labels.account.company_created"),
        onConfirm: () => {
          companiesPagination.load();
          fetchData(true);
        },
      });
    } catch {
      openDialog({
        variant: "error",
        message: t("labels.account.company_create_error"),
      });
      throw new Error();
    }
  };

  const handleUpdateCompany = async (
    companyId: string,
    companyName: string,
  ) => {
    try {
      await companyService.update(companyId, companyName);
      companiesPagination.load();
      fetchData(true);
      openDialog({
        variant: "success",
        message: t("labels.account.company_updated"),
        onConfirm: () => {
          companiesPagination.load();
          fetchData(true);
        },
      });
    } catch (err) {
      const { code } = getApiError(err);
      openDialog({
        variant: "error",
        message: code
          ? t(`errors.companies.${code}`)
          : t("labels.account.company_update_error"),
      });
      throw new Error();
    }
  };

  const handleDeleteCompany = useCallback(
    (company: CompanyListItem) => {
      openDialog({
        variant: "confirm",
        title: t("labels.all.delete"),
        message: t("labels.account.company_delete_confirm", {
          name: company.name,
        }),
        confirmLabel: t("labels.all.delete"),
        onConfirm: async () => {
          try {
            await companyService.delete(company.id);
            companiesPagination.load();
            fetchData(true);
            openDialog({
              variant: "success",
              message: t("labels.account.company_deleted"),
              onConfirm: () => {
                companiesPagination.load();
                fetchData(true);
              },
            });
          } catch (err) {
            const { code } = getApiError(err);
            openDialog({
              variant: "error",
              message: code
                ? t(`errors.companies.${code}`)
                : t("labels.account.company_delete_error"),
            });
          }
        },
      });
    },
    [t, openDialog, companiesPagination.load, fetchData],
  );

  const handleAcceptInvitation = async (id: string) => {
    try {
      await usersService.acceptInvitation(id);
      openDialog({
        variant: "success",
        message: t("labels.account.invitation_accepted"),
      });
      await fetchData(true);
      companiesPagination.load({ replace: true });
    } catch (err) {
      const { code } = getApiError(err);
      openDialog({
        variant: "error",
        message: code ? t(`errors.companies.${code}`) : t("errors.fallback"),
      });
    }
  };

  const handleRejectInvitation = async (id: string) => {
    try {
      await usersService.rejectInvitation(id);
      await fetchData(true);
      companiesPagination.load({ replace: true });
    } catch (err) {
      const { code } = getApiError(err);
      openDialog({
        variant: "error",
        message: code ? t(`errors.companies.${code}`) : t("errors.fallback"),
      });
    }
  };

  const handleDeleteAccount = () => {
    openDialog({
      variant: "confirm",
      title: t("labels.account.delete_account"),
      message: t("labels.account.delete_account_confirm"),
      confirmLabel: t("labels.all.delete"),
      onConfirm: async () => {
        try {
          await usersService.deleteMe();
          useUserStore.getState().clearUserData();
          clearToken();
          router.push("/login");
        } catch {
          openDialog({ variant: "error", message: t("errors.fallback") });
        }
      },
    });
  };

  const handleLogout = () => {
    openDialog({
      variant: "confirm",
      title: t("labels.menu.logout"),
      message: t("labels.account.logout_confirm"),
      confirmLabel: t("labels.menu.logout"),
      onConfirm: async () => {
        try {
          await usersService.logout();
        } finally {
          useUserStore.getState().clearUserData();
          clearToken();
          router.push("/login");
        }
      },
    });
  };

  if (loading) {
    return (
      <AppPage title={t("labels.menu.account")}>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppPage>
    );
  }

  const activeCompany = companiesPagination.items.find(
    (c) => c.id === currentUser?.company_id,
  );

  const tabs: AppTabItem[] = [
    {
      value: "profile",
      label: (
        <span className="flex items-center gap-1.5">
          <PersonOutlined style={{ fontSize: 16 }} />
          <span>{t("labels.account.tab_profile")}</span>
        </span>
      ),
    },
    {
      value: "security",
      label: (
        <span className="flex items-center gap-1.5">
          <LockOutlined style={{ fontSize: 16 }} />
          <span>{t("labels.account.tab_security")}</span>
        </span>
      ),
    },
    {
      value: "company",
      label: (
        <span className="flex items-center gap-1.5">
          <BusinessOutlined style={{ fontSize: 16 }} />
          <span>{t("labels.account.tab_company")}</span>
        </span>
      ),
    },
    {
      value: "companies",
      label: (
        <span className="flex items-center gap-1.5">
          <ApartmentOutlined style={{ fontSize: 16 }} />
          <span>{t("labels.account.tab_companies")}</span>
          {invitations.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-primary text-white text-[10px] font-bold">
              {invitations.length}
            </span>
          )}
        </span>
      ),
    },
    {
      value: "preferences",
      label: (
        <span className="flex items-center gap-1.5">
          <SettingsOutlined style={{ fontSize: 16 }} />
          <span>{t("labels.account.tab_preferences")}</span>
        </span>
      ),
    },
  ];

  return (
    <AppPage title={t("labels.menu.account")}>
      <div className="flex flex-col md:flex-row gap-3 md:gap-5 w-full pb-10 items-start">
        <div className="shrink-0 w-full md:w-auto">
          <AppTabs
            tabs={tabs}
            direction="column"
            activeTab={activeTab}
            onChange={(val) => setActiveTab(val)}
            className="w-full md:w-64"
          />
        </div>

        <div className="flex-1 min-w-0 w-full">
          {activeTab === "profile" && (
            <AccountProfileTab
              currentUser={currentUser}
              onUserUpdated={(updated) => setCurrentUser(updated)}
            />
          )}

          {activeTab === "security" && (
            <AccountSecurityTab onDeleteAccount={handleDeleteAccount} />
          )}

          {activeTab === "company" && (
            <AccountCompanyTab
              activeCompany={activeCompany}
              currentUser={currentUser}
              membersRefreshKey={membersRefreshKey}
              onOpenMembers={setSelectedCompany}
              onCompanyUpdated={() => {
                fetchData(true);
                companiesPagination.load();
              }}
            />
          )}

          {activeTab === "companies" && (
            <AccountCompaniesTab
              companiesPagination={companiesPagination}
              currentUser={currentUser}
              invitations={invitations}
              onOpenMembers={setSelectedCompany}
              onSwitchCompany={handleSwitchCompany}
              onEditCompany={setEditingCompany}
              onDeleteCompany={handleDeleteCompany}
              onCreateCompanyClick={() => setIsCreateModalOpen(true)}
              onAcceptInvitation={handleAcceptInvitation}
              onRejectInvitation={handleRejectInvitation}
            />
          )}

          {activeTab === "preferences" && (
            <AccountPreferencesTab onLogout={handleLogout} />
          )}
        </div>
      </div>

      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateCompany={handleCreateCompany}
      />

      <EditCompanyModal
        isOpen={editingCompany !== null}
        onClose={() => setEditingCompany(null)}
        company={editingCompany}
        onUpdateCompany={handleUpdateCompany}
      />

      <ManageMembersModal
        isOpen={selectedCompany !== null}
        onClose={() => setSelectedCompany(null)}
        company={selectedCompany}
        currentUser={currentUser}
        onMemberChanged={() => {
          setMembersRefreshKey((k) => k + 1);
          fetchData(true);
        }}
        onLeaveSuccess={async () => {
          await fetchData(true);
          companiesPagination.load();
        }}
      />
    </AppPage>
  );
}
