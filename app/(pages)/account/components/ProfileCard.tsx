import React, { useState } from "react";
import { User } from "@/api/schemas/User";
import AppCard from "../../../components/AppCard";
import UserInitials from "./UserInitials";
import {
  CalendarTodayOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  ExitToAppOutlined,
} from "@mui/icons-material";
import { useTranslation } from "@/app/utils/i18n";
import { formatDate } from "@/app/utils/formatters/date";
import AppButton from "@/app/components/AppButton";
import AppInputText from "@/app/components/inputs/AppInputText";

interface ProfileCardProps {
  currentUser: User | null;
  onSaveName: (name: string) => Promise<void>;
  onLogout: () => void;
}

export default function ProfileCard({
  currentUser,
  onSaveName,
  onLogout,
}: ProfileCardProps) {
  const { t } = useTranslation();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const handleStartEditName = () => {
    setEditName(currentUser?.name || "");
    setIsEditingName(true);
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditName("");
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = editName.trim();
    if (!trimmed || trimmed === currentUser?.name) {
      handleCancelEditName();
      return;
    }
    try {
      setIsSavingName(true);
      await onSaveName(trimmed);
      setIsEditingName(false);
    } catch {
      // Error is handled in the parent component
    } finally {
      setIsSavingName(false);
    }
  };

  return (
    <AppCard className="p-4 sm:p-5 flex flex-col gap-3.5">
      <div className="flex items-center gap-3.5 min-w-0">
        <UserInitials name={currentUser?.name || "?"} />

        <div className="flex flex-col min-w-0 flex-1">
          {isEditingName ? (
            <form
              onSubmit={handleSave}
              className="flex items-center gap-1.5 w-full max-w-sm"
            >
              <div className="flex-1 min-w-0">
                <AppInputText
                  value={editName}
                  onChange={(e) =>
                    setEditName((e.target.value as string) || "")
                  }
                  placeholder={t("labels.account.edit_name_placeholder")}
                  autoFocus
                  disabled={isSavingName}
                  className="py-1! text-sm"
                />
              </div>
              <AppButton
                type="submit"
                color="primary-3"
                disabled={isSavingName || !editName.trim()}
                className="w-8 h-8 p-0! shrink-0"
                title={t("labels.all.save")}
              >
                <CheckOutlined style={{ fontSize: 16 }} />
              </AppButton>
              <AppButton
                type="button"
                color="transparent"
                flat
                onClick={handleCancelEditName}
                disabled={isSavingName}
                className="w-8 h-8 p-0! shrink-0 text-label hover:text-foreground"
                title={t("labels.all.cancel")}
              >
                <CloseOutlined style={{ fontSize: 16 }} />
              </AppButton>
            </form>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
                {currentUser?.name}
              </h2>
              <button
                type="button"
                onClick={handleStartEditName}
                className="w-7 h-7 rounded-xs flex items-center justify-center text-label hover:text-foreground hover:bg-foreground/5 transition-colors shrink-0 cursor-pointer"
                title={t("labels.all.edit")}
                aria-label={t("labels.all.edit")}
              >
                <EditOutlined style={{ fontSize: 15 }} />
              </button>
            </div>
          )}
          <span className="text-xs sm:text-sm text-label truncate">
            {currentUser?.email}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between gap-3 text-xs">
        <span className="text-label flex items-center gap-1.5 min-w-0 truncate">
          <CalendarTodayOutlined
            style={{ fontSize: 14 }}
            className="opacity-60 shrink-0"
          />
          <span className="truncate">
            {t("labels.account.member_since")}{" "}
            <span className="font-medium text-foreground/80">
              {formatDate(currentUser?.created_at)}
            </span>
          </span>
        </span>

        <AppButton
          onClick={onLogout}
          flat
          color="foreground"
          className="py-1 px-2.5 text-xs! hover:bg-red-500/10! hover:text-red-500! gap-1.5 shrink-0"
        >
          <ExitToAppOutlined
            style={{ fontSize: 15 }}
            className="text-red-500"
          />
          <span>{t("labels.menu.logout")}</span>
        </AppButton>
      </div>
    </AppCard>
  );
}
