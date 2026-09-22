import AppCard from "../../../components/AppCard";
import AppButton from "../../../components/AppButton";
import { DeleteOutlined } from "@mui/icons-material";
import { useTranslation } from "@/app/utils/i18n";

interface DeleteAccountCardProps {
  onDeleteAccount: () => void;
}

export default function DeleteAccountCard({
  onDeleteAccount,
}: DeleteAccountCardProps) {
  const { t } = useTranslation();

  return (
    <AppCard className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-sm text-foreground">
          {t("labels.account.delete_account")}
        </span>
        <span className="text-xs text-label">
          {t("labels.account.delete_account_description")}
        </span>
      </div>

      <AppButton
        color="red"
        className="gap-1.5 shrink-0 self-start sm:self-center text-xs"
        onClick={onDeleteAccount}
        title={t("labels.account.delete_account")}
      >
        <DeleteOutlined style={{ fontSize: 16 }} />
        {t("labels.account.delete_account")}
      </AppButton>
    </AppCard>
  );
}
