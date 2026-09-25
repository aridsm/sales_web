import { CompanyInvitation } from "@/api/schemas/Company";
import AppCard from "../../../components/AppCard";
import AppButton from "../../../components/AppButton";
import {
  MailOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@mui/icons-material";
import { useTranslation } from "@/app/utils/i18n";

interface InvitationsCardProps {
  invitations: CompanyInvitation[];
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export default function InvitationsCard({
  invitations,
  onAccept,
  onReject,
}: InvitationsCardProps) {
  const { t } = useTranslation();

  if (invitations.length === 0) return null;

  return (
    <AppCard className="p-4 md:p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MailOutlined className="text-primary" style={{ fontSize: 18 }} />
          <h3 className="font-semibold text-foreground">
            {t("labels.account.invitations")}
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
          {invitations.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {invitations.map((inv) => (
          <div
            key={inv.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xs border border-border bg-background dark:bg-background-2 gap-3"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-medium text-foreground truncate">
                {inv.company_name}
              </span>
              <span className="text-label md:text-sm truncate">
                {inv.invited_by_name} •{" "}
                {t(`labels.account.permissions.${inv.permission}`)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
              <AppButton
                color="foreground"
                flat
                className="py-1 px-2.5 gap-1!"
                onClick={() => onAccept(inv.id)}
              >
                <CheckOutlined style={{ fontSize: 14 }} />
                {t("labels.account.accept")}
              </AppButton>
              <AppButton
                color="transparent"
                flat
                className="py-1 px-2.5 text-red-500! hover:bg-red-500/10! gap-1!"
                onClick={() => onReject(inv.id)}
              >
                <CloseOutlined style={{ fontSize: 14 }} />
                {t("labels.account.reject")}
              </AppButton>
            </div>
          </div>
        ))}
      </div>
    </AppCard>
  );
}
