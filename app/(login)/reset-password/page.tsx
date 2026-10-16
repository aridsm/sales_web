"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { usersService } from "@/api/services/UserService";
import { getApiError } from "@/api/schemas";
import { useDialogStore } from "@/stores/dialogStore";
import { useTranslation } from "@/app/utils/i18n";
import AppButton from "@/app/components/AppButton";
import AppInputText from "@/app/components/inputs/AppInputText";
import AppLoading from "@/app/components/AppLoading";
import {
  CheckCircleOutlined,
  CancelOutlined,
  ArrowBackOutlined,
} from "@mui/icons-material";

function ResetPasswordForm() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const { openDialog } = useDialogStore();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="w-full flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6">
          <CancelOutlined style={{ fontSize: 36 }} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {t("labels.reset_password.invalid_token_title")}
        </h1>
        <p className="text-label mt-3 max-w-sm text-sm sm:text-base leading-relaxed">
          {t("labels.reset_password.invalid_token_message")}
        </p>
        <div className="mt-8 flex flex-col gap-3 w-full">
          <Link href="/forgot-password" className="w-full block">
            <AppButton color="primary" className="w-full py-5!">
              {t("labels.reset_password.request_new_link")}
            </AppButton>
          </Link>
          <Link href="/login" className="w-full block">
            <AppButton color="background" className="w-full py-5!">
              {t("labels.reset_password.back_to_login")}
            </AppButton>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
          <CheckCircleOutlined style={{ fontSize: 36 }} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {t("labels.reset_password.success_title")}
        </h1>
        <p className="text-label mt-3 max-w-sm text-sm sm:text-base leading-relaxed">
          {t("labels.reset_password.success_message")}
        </p>
        <div className="mt-8 w-full">
          <Link href="/login" className="w-full block">
            <AppButton color="primary" className="w-full py-5!">
              {t("labels.reset_password.back_to_login")}
            </AppButton>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword || loading) return;

    if (password !== confirmPassword) {
      openDialog({
        variant: "error",
        message: t("errors.auth.errorPasswordsDoNotMatch"),
      });
      return;
    }

    if (password.length < 6) {
      openDialog({
        variant: "error",
        message: t("errors.auth.errorPasswordTooShort"),
      });
      return;
    }

    setLoading(true);
    try {
      await usersService.resetPassword(token, password);
      setSuccess(true);
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

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {t("labels.reset_password.title")}
        </h1>
        <p className="text-label mt-2">{t("labels.reset_password.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AppInputText
          label={t("labels.reset_password.new_password")}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
          required
          autoFocus
        />

        <AppInputText
          label={t("labels.reset_password.confirm_password")}
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword((e.target as HTMLInputElement).value)
          }
          required
        />

        <AppButton
          type="submit"
          color="primary"
          disabled={loading || !password || !confirmPassword}
          className="py-5! mt-2"
        >
          {loading
            ? t("labels.reset_password.saving")
            : t("labels.reset_password.button")}
        </AppButton>

        <div className="flex justify-center mt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-label hover:text-foreground transition-colors"
          >
            <ArrowBackOutlined style={{ fontSize: 16 }} />
            <span>{t("labels.reset_password.back_to_login")}</span>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <AppLoading />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
