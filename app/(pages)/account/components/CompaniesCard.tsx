import { useMemo } from "react";
import { CompanyListItem } from "@/api/schemas/Company";
import { User } from "@/api/schemas/User";
import AppCard from "../../../components/AppCard";
import AppButton from "../../../components/AppButton";
import AppActions, { ActionItem } from "../../../components/AppActions";
import AppPagination from "../../../components/AppPagination";
import {
  AddOutlined,
  GroupOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@mui/icons-material";
import { useTranslation } from "@/app/utils/i18n";
import { CompanyPermission } from "@/enums/CompanyPermission";
import { PaginationResult } from "@/app/utils/usePagination";

interface CompaniesCardProps {
  companiesPagination: PaginationResult<CompanyListItem>;
  currentUser: User | null;
  onOpenMembers: (company: CompanyListItem) => void;
  onSwitchCompany: (companyId: string) => Promise<void>;
  onEditCompany: (company: CompanyListItem) => void;
  onDeleteCompany: (company: CompanyListItem) => void;
  onCreateCompanyClick: () => void;
}

function getCompanyInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return initials || "?";
}

function getCompanyColor(name: string) {
  const colors = [
    "bg-rose-500 text-white",
    "bg-amber-500 text-white",
    "bg-emerald-500 text-white",
    "bg-teal-500 text-white",
    "bg-cyan-500 text-white",
    "bg-orange-500 text-white",
    "bg-sky-500 text-white",
    "bg-pink-500 text-white",
    "bg-purple-500 text-white",
    "bg-blue-500 text-white",
    "bg-indigo-500 text-white",
    "bg-violet-500 text-white",
    "bg-fuchsia-500 text-white",
    "bg-red-500 text-white",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export default function CompaniesCard({
  companiesPagination,
  currentUser,
  onOpenMembers,
  onSwitchCompany,
  onEditCompany,
  onDeleteCompany,
  onCreateCompanyClick,
}: CompaniesCardProps) {
  const { t } = useTranslation();
  const { items: companies, pageData } = companiesPagination;
  const totalCompanies = pageData.total_items;

  const companyActions = useMemo<ActionItem<CompanyListItem>[]>(
    () => [
      {
        text: t("labels.account.manage_members"),
        preText: <GroupOutlined style={{ fontSize: 18 }} />,
        class: "sm:hidden",
        click: (comp) => onOpenMembers(comp),
      },
      {
        text: t("labels.all.edit"),
        preText: <EditOutlined style={{ fontSize: 18 }} />,
        click: (comp) => onEditCompany(comp),
        hidden: (comp) => comp.permission !== CompanyPermission.ADMIN,
        disabled: (comp) => comp.permission !== CompanyPermission.ADMIN,
      },
      {
        text: t("labels.all.delete"),
        preText: (
          <DeleteOutlined style={{ fontSize: 18 }} className="text-red-500" />
        ),
        class: "text-red-500 hover:bg-red-500/10!",
        click: (comp) => onDeleteCompany(comp),
        hidden: (comp) => comp.permission !== CompanyPermission.ADMIN,
        disabled: (comp) => comp.permission !== CompanyPermission.ADMIN,
      },
    ],
    [t, onOpenMembers, onEditCompany, onDeleteCompany],
  );

  return (
    <AppCard className="p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-foreground">
            {t("labels.account.my_companies")} ({totalCompanies})
          </h3>
        </div>

        <AppButton
          color="primary-3"
          className="w-8 h-8 min-w-8! min-h-8! max-h-8! p-0! md:w-auto md:min-w-0 md:min-h-10! md:max-h-10! md:py-2.5! md:px-4! gap-1.5! shrink-0"
          onClick={onCreateCompanyClick}
          title={t("labels.account.create_company")}
          aria-label={t("labels.account.create_company")}
        >
          <AddOutlined style={{ fontSize: 18 }} />
          <span className="hidden md:inline">
            {t("labels.account.create_company")}
          </span>
        </AppButton>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-8 text-label text-sm">
          {t("labels.account.no_active_company")}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {companies.map((comp) => {
            const isActive = comp.id === currentUser?.company_id;

            return (
              <div
                key={comp.id}
                className={`flex items-center justify-between p-3.5 rounded-md border transition-colors  gap-3 ${isActive ? "border-primary-3 bg-primary-4/50 dark:bg-primary-3/15" : "border-border bg-background dark:bg-background-2"}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 select-none shadow-xs ${getCompanyColor(comp.name)}`}
                  >
                    {getCompanyInitials(comp.name)}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-foreground break-words">
                      {comp.name}
                    </span>
                    <span className="text-xs text-label">
                      {t(`labels.account.permissions.${comp.permission}`)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <AppButton
                    color="foreground"
                    flat
                    className="hidden sm:inline-flex py-1 px-2.5 text-xs! hover:bg-foreground/5! gap-1.5!"
                    onClick={() => onOpenMembers(comp)}
                  >
                    <GroupOutlined style={{ fontSize: 15 }} />
                    {t("labels.account.manage_members")}
                  </AppButton>
                  {isActive ? (
                    <span className="w-20 py-1 rounded-sm text-xs font-semibold bg-primary-3 text-white flex items-center justify-center shrink-0 select-none">
                      {t("labels.account.active")}
                    </span>
                  ) : (
                    <AppButton
                      color="foreground"
                      flat
                      className="w-20 py-1 text-xs! justify-center text-primary-3 dark:text-primary! underline underline-offset-2"
                      onClick={() => onSwitchCompany(comp.id)}
                    >
                      {t("labels.account.switch")}
                    </AppButton>
                  )}
                  <AppActions
                    item={comp}
                    actions={companyActions}
                    className={
                      comp.permission !== CompanyPermission.ADMIN
                        ? "sm:hidden"
                        : ""
                    }
                  />
                  {comp.permission !== CompanyPermission.ADMIN && (
                    <span className="hidden sm:inline-block w-8" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <AppPagination pagination={companiesPagination} />
    </AppCard>
  );
}
