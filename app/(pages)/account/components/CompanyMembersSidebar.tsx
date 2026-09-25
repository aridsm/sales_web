"use client";

import { useState, useEffect, useCallback } from "react";
import AppCard from "@/app/components/AppCard";
import AppButton from "@/app/components/AppButton";
import CompanyMemberItem from "./CompanyMemberItem";
import CompanyMemberDetails from "./CompanyMemberDetails";
import { CompanyListItem, CompanyUser } from "@/api/schemas/Company";
import { User } from "@/api/schemas/User";
import { companyService } from "@/api/services/CompanyService";
import { useTranslation } from "@/app/utils/i18n";
import { CompanyPermission } from "@/enums/CompanyPermission";
import { GroupOutlined, PersonAddAlt1Outlined } from "@mui/icons-material";

interface CompanyMembersSidebarProps {
  company: CompanyListItem;
  currentUser: User | null;
  refreshKey?: number;
  onOpenManageModal: (company: CompanyListItem) => void;
}

export default function CompanyMembersSidebar({
  company,
  currentUser,
  refreshKey,
  onOpenManageModal,
}: CompanyMembersSidebarProps) {
  const { t } = useTranslation();
  const [members, setMembers] = useState<CompanyUser[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<CompanyUser | null>(
    null,
  );

  const isAdmin =
    company.permission === CompanyPermission.ADMIN ||
    currentUser?.permission === CompanyPermission.ADMIN;

  const fetchMembers = useCallback(async () => {
    if (!company?.id) return;
    try {
      setLoading(true);
      const res = await companyService.getCompanyUsers(company.id, {
        page_size: 20,
      });
      const items = res?.items || (Array.isArray(res) ? res : []);
      setMembers(items);
      setTotalMembers(res?.total_items ?? items.length);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [company?.id]);

  useEffect(() => {
    setSelectedMember(null);
    fetchMembers();
  }, [fetchMembers, refreshKey]);

  return (
    <AppCard className="flex flex-col h-fit">
      {selectedMember ? (
        <CompanyMemberDetails
          member={selectedMember}
          currentUser={currentUser}
          isAdmin={isAdmin}
          onMemberUpdated={(updated) => {
            setSelectedMember(updated);
            setMembers((prev) =>
              prev.map((m) =>
                m.id === updated.id || m.user_id === updated.user_id
                  ? updated
                  : m,
              ),
            );
          }}
          onBack={() => setSelectedMember(null)}
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2 min-w-0">
              <GroupOutlined
                style={{ fontSize: 18 }}
                className="text-primary-3 shrink-0"
              />
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-semibold text-base text-foreground truncate">
                  {t("labels.account.active_members")}
                </h3>
                <span className="px-2 py-0.2 rounded-full bg-primary/10 text-primary-3 text-xs font-semibold shrink-0">
                  {totalMembers}
                </span>
              </div>
            </div>

            {isAdmin && (
              <AppButton
                type="button"
                color="primary-3"
                size="small"
                flat
                onClick={() => onOpenManageModal(company)}
                className="gap-1 px-2! shrink-0"
                title={t("labels.account.manage_members")}
              >
                <PersonAddAlt1Outlined style={{ fontSize: 15 }} />
                <span>{t("labels.account.manage_members")}</span>
              </AppButton>
            )}
          </div>

          <div className="h-px bg-border w-full" />

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-6 text-label">
              {t("labels.account.no_members_found")}
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/60 min-h-0 overflow-y-auto overflow-x-hidden">
              {members.map((member) => (
                <CompanyMemberItem
                  key={member.id}
                  member={member}
                  currentUser={currentUser}
                  onSelect={setSelectedMember}
                />
              ))}
            </div>
          )}
        </>
      )}
    </AppCard>
  );
}
