"use client";

import React, { useState, useEffect } from "react";
import AppModal from "@/app/components/AppModal";
import AppInputText from "@/app/components/inputs/AppInputText";
import AppButton from "@/app/components/AppButton";
import { useTranslation } from "@/app/utils/i18n";
import { usersService } from "@/api/services/UserService";
import { useDialogStore } from "@/stores/dialogStore";
import { getApiError } from "@/api/schemas";
import { MarkEmailReadOutlined } from "@mui/icons-material";

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
}

export default function ChangeEmailModal({
  isOpen,
  onClose,
  currentEmail,
}: ChangeEmailModalProps) {
  const { t } = useTranslation();
  const { openDialog } = useDialogStore();

  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setNewEmail("");
      setPassword("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const cleanNewEmail = newEmail.trim().toLowerCase();
    if (!cleanNewEmail || !password) return;

    if (cleanNewEmail === currentEmail.trim().toLowerCase()) {
      openDialog({
        variant: "alert",
        message: t("errors.users.errorEmailSameAsCurrent"),
      });
      return;
    }

    try {
      setIsLoading(true);
      await usersService.requestEmailChange({
        new_email: cleanNewEmail,
        password,
      });

      onClose();
      openDialog({
        variant: "success",
        message: t("labels.account.change_email_success"),
      });
    } catch (err: any) {
      const { code } = getApiError(err);
      const detail = err?.response?.data?.detail;
      const apiMsg =
        typeof detail === "string"
          ? detail
          : typeof detail?.message === "string"
            ? detail.message
            : err?.response?.data?.message;

      const translated = code ? t(`errors.users.${code}`) : null;
      const finalMessage =
        translated && translated !== `errors.users.${code}`
          ? translated
          : apiMsg || t("errors.all.generic");

      openDialog({
        variant: "error",
        message: finalMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("labels.account.change_email_title")}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
        <p className="text-sm text-label">
          {t("labels.account.change_email_description")}
        </p>

        <AppInputText
          label={t("labels.account.current_email")}
          type="email"
          value={currentEmail}
          disabled={true}
        />

        <AppInputText
          label={t("labels.account.new_email")}
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail((e.target.value as string) || "")}
          placeholder={t("labels.account.new_email_placeholder")}
          required
          disabled={isLoading}
        />

        <AppInputText
          label={t("labels.account.confirm_password_label")}
          type="password"
          value={password}
          onChange={(e) => setPassword((e.target.value as string) || "")}
          placeholder={t("labels.account.confirm_password_placeholder")}
          required
          disabled={isLoading}
        />

        <div className="flex justify-end gap-3 mt-2 border-t border-border pt-3">
          <AppButton
            type="button"
            color="transparent"
            flat
            onClick={onClose}
            disabled={isLoading}
          >
            {t("labels.all.cancel")}
          </AppButton>
          <AppButton
            type="submit"
            color="primary"
            disabled={isLoading || !newEmail || !password}
          >
            <MarkEmailReadOutlined style={{ fontSize: 18 }} />
            <span>
              {isLoading
                ? t("labels.all.saving")
                : t("labels.account.send_email_change_request")}
            </span>
          </AppButton>
        </div>
      </form>
    </AppModal>
  );
}
