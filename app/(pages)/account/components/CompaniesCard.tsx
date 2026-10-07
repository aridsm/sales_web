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
  CheckCircleOutlined,
  EmailOutlined,
  PhoneOutlined,
  LocationOnOutlined,
  LanguageOutlined,
  AdminPanelSettingsOutlined,
  BadgeOutlined,
  ApartmentOutlined,
} from "@mui/icons-material";
import { useTranslation } from "@/app/utils/i18n";
import { CompanyPermission } from "@/enums/CompanyPermission";
import { PaginationResult } from "@/app/utils/usePagination";
import { getImageUrl } from "@/app/utils/image";

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
    <AppCard className="p-4 md:p-5 flex flex-col gap-3 md:gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <ApartmentOutlined
            style={{ fontSize: 18 }}
            className="text-primary shrink-0"
          />
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-semibold text-base text-foreground truncate">
              {t("labels.account.my_companies")}
            </h3>
            <span className="px-2 py-0.2 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
              {totalCompanies}
            </span>
          </div>
        </div>

        <AppButton
          color="primary"
          onClick={onCreateCompanyClick}
          className="w-10 min-w-10 px-0 sm:w-auto sm:min-w-0 sm:px-3.5 shrink-0"
          title={t("labels.account.create_company")}
          aria-label={t("labels.account.create_company")}
        >
          <AddOutlined fontSize="small" />
          <span className="hidden sm:inline">
            {t("labels.account.create_company")}
          </span>
        </AppButton>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-8 text-label text-sm">
          {t("labels.account.no_active_company")}
        </div>
      ) : (
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3.5">
          {companies.map((comp) => {
            const isActive = comp.id === currentUser?.company_id;
            const logoUrl = getImageUrl(comp.logo_url);

            return (
              <div
                key={comp.id}
                className={`flex flex-col justify-between p-4 rounded-xs border transition-all duration-200 gap-3.5 relative ${
                  isActive
                    ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                    : "border-border bg-background-2 dark:bg-background-3 hover:border-border-2"
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    {logoUrl ? (
                      <div className="w-11 h-11 rounded-xs overflow-hidden shrink-0 border border-border bg-background-3 flex items-center justify-center p-1">
                        <img
                          src={logoUrl}
                          alt={comp.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-11 h-11 rounded-xs flex items-center justify-center text-sm font-bold shrink-0 select-none shadow-xs ${getCompanyColor(comp.name)}`}
                      >
                        {getCompanyInitials(comp.name)}
                      </div>
                    )}

                    <div className="flex flex-col gap-1 min-w-0">
                      <span
                        className="text-sm font-semibold text-foreground truncate"
                        title={comp.name}
                      >
                        {comp.name}
                      </span>
                      <span
                        className={`font-medium px-2 py-0.5 rounded-xs text-[11px] flex items-center gap-1 w-fit ${
                          comp.permission === 3
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : comp.permission === 2
                              ? "bg-primary/10 text-primary"
                              : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {comp.permission === 3 && (
                          <AdminPanelSettingsOutlined
                            style={{ fontSize: 13 }}
                          />
                        )}
                        <span>
                          {t(`labels.account.permissions.${comp.permission}`)}
                        </span>
                      </span>
                    </div>
                  </div>

                  <AppActions item={comp} actions={companyActions} />
                </div>

                {(comp.document ||
                  comp.email ||
                  comp.phone ||
                  comp.city ||
                  comp.state ||
                  comp.website) && (
                  <div className="flex flex-col gap-2 text-label pt-3 pb-0.5 border-t border-border/40">
                    {comp.document && (
                      <div className="flex items-center gap-2 min-w-0">
                        <BadgeOutlined
                          style={{ fontSize: 16 }}
                          className="text-primary shrink-0"
                        />
                        <span className="truncate text-foreground/80">
                          CNPJ: {comp.document}
                        </span>
                      </div>
                    )}

                    {comp.email && (
                      <div className="flex items-center gap-2 min-w-0">
                        <EmailOutlined
                          style={{ fontSize: 16 }}
                          className="text-primary shrink-0"
                        />
                        <span className="truncate text-foreground/80">
                          {comp.email}
                        </span>
                      </div>
                    )}

                    {comp.phone && (
                      <div className="flex items-center gap-2 min-w-0">
                        <PhoneOutlined
                          style={{ fontSize: 16 }}
                          className="text-primary shrink-0"
                        />
                        <span className="truncate text-foreground/80">
                          {comp.phone}
                        </span>
                      </div>
                    )}

                    {(comp.city || comp.state) && (
                      <div className="flex items-center gap-2 min-w-0">
                        <LocationOnOutlined
                          style={{ fontSize: 16 }}
                          className="text-primary shrink-0"
                        />
                        <span className="truncate text-foreground/80">
                          {[comp.city, comp.state].filter(Boolean).join(" - ")}
                        </span>
                      </div>
                    )}

                    {comp.website && (
                      <div className="flex items-center gap-2 min-w-0">
                        <LanguageOutlined
                          style={{ fontSize: 16 }}
                          className="text-primary shrink-0"
                        />
                        <a
                          href={
                            comp.website.startsWith("http")
                              ? comp.website
                              : `https://${comp.website}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="truncate text-primary hover:underline"
                        >
                          {comp.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                  <AppButton
                    color="background"
                    className="h-7 px-2.5 text-xs! gap-1.5"
                    onClick={() => onOpenMembers(comp)}
                  >
                    <GroupOutlined style={{ fontSize: 15 }} />
                    <span>{t("labels.account.manage_members")}</span>
                  </AppButton>

                  {isActive ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary flex items-center shrink-0 select-none">
                      {t("labels.account.active")}
                    </span>
                  ) : (
                    <AppButton
                      color="background"
                      className="h-7 px-3 text-xs! font-medium"
                      onClick={() => onSwitchCompany(comp.id)}
                    >
                      {t("labels.account.switch")}
                    </AppButton>
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
