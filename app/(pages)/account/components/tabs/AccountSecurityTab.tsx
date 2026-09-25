"use client";

import React, { useState } from "react";
import { usersService } from "@/api/services/UserService";
import { useDialogStore } from "@/stores/dialogStore";
import { useTranslation } from "@/app/utils/i18n";
import AppCard from "@/app/components/AppCard";
import AppButton from "@/app/components/AppButton";
import AppInputText from "@/app/components/inputs/AppInputText";
import DeleteAccountCard from "../DeleteAccountCard";
import { LockOutlined, VpnKeyOutlined } from "@mui/icons-material";

interface AccountSecurityTabProps {
  onDeleteAccount: () => void;
}

export default function AccountSecurityTab({
  onDeleteAccount,
}: AccountSecurityTabProps) {
  const { t } = useTranslation();
  const { openDialog } = useDialogStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      openDialog({
        variant: "alert",
        message: t("labels.account.current_password_required"),
      });
      return;
    }

    if (newPassword.length < 6) {
      openDialog({
        variant: "alert",
        message: t("labels.account.password_min_length"),
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      openDialog({
        variant: "alert",
        message: t("labels.account.passwords_do_not_match"),
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      await usersService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      openDialog({
        variant: "success",
        message: t("labels.account.password_changed_success"),
      });
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.detail?.error === "errorInvalidCurrentPassword"
          ? t("labels.account.invalid_current_password")
          : t("labels.account.password_change_error");

      openDialog({
        variant: "error",
        message: errMsg,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 md:gap-5 w-full">
      <AppCard className="p-4 sm:p-6 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <LockOutlined style={{ fontSize: 18 }} className="text-primary-3" />
          <h3 className="font-semibold text-sm sm:text-base text-foreground">
            {t("labels.account.change_password")}
          </h3>
        </div>

        <p className="sm:text-sm text-label">
          {t("labels.account.change_password_description")}
        </p>

        <form
          onSubmit={handleChangePassword}
          className="flex flex-col gap-4 max-w-md"
        >
          <AppInputText
            label={t("labels.account.current_password")}
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(String(e?.target?.value ?? ""))}
            placeholder="••••••••"
            required
            disabled={isChangingPassword}
          />

          <AppInputText
            label={t("labels.account.new_password")}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(String(e?.target?.value ?? ""))}
            placeholder="••••••••"
            required
            disabled={isChangingPassword}
          />

          <AppInputText
            label={t("labels.account.confirm_new_password")}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(String(e?.target?.value ?? ""))}
            placeholder="••••••••"
            required
            disabled={isChangingPassword}
          />

          <div className="pt-2">
            <AppButton
              type="submit"
              disabled={isChangingPassword}
              className="gap-2"
            >
              <VpnKeyOutlined style={{ fontSize: 16 }} />
              <span>
                {isChangingPassword
                  ? t("labels.all.saving")
                  : t("labels.account.update_password")}
              </span>
            </AppButton>
          </div>
        </form>
      </AppCard>

      <DeleteAccountCard onDeleteAccount={onDeleteAccount} />
    </div>
  );
}
