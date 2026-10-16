"use client";

import { useState } from "react";
import Link from "next/link";
import { usersService } from "@/api/services/UserService";
import { getApiError } from "@/api/schemas";
import { useDialogStore } from "@/stores/dialogStore";
import { useTranslation } from "@/app/utils/i18n";
import AppButton from "@/app/components/AppButton";
import AppInputText from "@/app/components/inputs/AppInputText";
import { MarkEmailReadOutlined, ArrowBackOutlined } from "@mui/icons-material";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { openDialog } = useDialogStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    try {
      await usersService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      const { code } = getApiError(err);
      openDialog({
        variant: "error",
        message: t(code ? `errors.auth.${code}` : "errors.all.generic"),
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
          <MarkEmailReadOutlined style={{ fontSize: 36 }} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {t("labels.forgot_password.success_title")}
        </h1>
        <p className="text-label mt-3 max-w-sm text-sm sm:text-base leading-relaxed">
          {t("labels.forgot_password.success_message")}
        </p>
        <div className="mt-8 w-full">
          <Link href="/login" className="w-full block">
            <AppButton color="primary" className="w-full py-5!">
              {t("labels.forgot_password.back_to_login")}
            </AppButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {t("labels.forgot_password.title")}
        </h1>
        <p className="text-label mt-2">{t("labels.forgot_password.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AppInputText
          label={t("labels.all.email")}
          type="email"
          placeholder={t("labels.forgot_password.email_placeholder")}
          value={email}
          onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          required
          autoFocus
        />

        <AppButton
          type="submit"
          color="primary"
          disabled={loading || !email}
          className="py-5! mt-2"
        >
          {loading
            ? t("labels.forgot_password.sending")
            : t("labels.forgot_password.send_button")}
        </AppButton>

        <div className="flex justify-center mt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-label hover:text-foreground transition-colors"
          >
            <ArrowBackOutlined style={{ fontSize: 16 }} />
            <span>{t("labels.forgot_password.back_to_login")}</span>
          </Link>
        </div>
      </form>
    </div>
  );
}
