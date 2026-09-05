import { CompanyListItem } from "@/api/schemas/Company";
import { User } from "@/api/schemas/User";
import AppCard from "../../../components/AppCard";
import AppButton from "../../../components/AppButton";
import { GroupOutlined } from "@mui/icons-material";
import { useTranslation } from "@/app/utils/i18n";

interface ActiveCompanyCardProps {
  activeCompany: CompanyListItem | null | undefined;
  currentUser: User | null;
  onOpenMembers: (company: CompanyListItem) => void;
}

export default function ActiveCompanyCard({
  activeCompany,
  currentUser,
  onOpenMembers,
}: ActiveCompanyCardProps) {
  const { t } = useTranslation();

  return (
    <AppCard className="p-5 flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <span className=" font-medium">
            {t("labels.account.active_company")}
          </span>
          <div className="flex items-center gap-3">
            {activeCompany ? (
              <span className="text-lg font-semibold text-foreground truncate">
                {activeCompany.name}
              </span>
            ) : (
              <p className="text-label">
                {t("labels.account.no_active_company")}
              </p>
            )}

            {activeCompany && (
              <span className="text-xs mt-1 px-2 py-0.5 rounded text-primary-3 bg-primary-4 dark:text-primary dark:bg-primary-light font-medium">
                {t(`labels.account.permissions.${currentUser?.permission}`)}
              </span>
            )}
          </div>
        </div>

        {activeCompany && (
          <AppButton
            color="foreground"
            flat
            className="py-1 px-2.5 text-xs! hover:bg-foreground/5! gap-1.5 shrink-0 self-start sm:self-center"
            onClick={() => onOpenMembers(activeCompany)}
          >
            <GroupOutlined style={{ fontSize: 15 }} />
            {t("labels.account.manage_members")}
          </AppButton>
        )}
      </div>
    </AppCard>
  );
}
