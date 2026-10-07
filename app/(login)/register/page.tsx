"use client";

import { useState, useEffect } from "react";
import { usersService } from "@/api/services/UserService";
import { getApiError } from "@/api/schemas";
import { useDialogStore } from "@/stores/dialogStore";
import AppButton from "@/app/components/AppButton";
import AppInputText from "@/app/components/inputs/AppInputText";
import Link from "next/link";
import { useTranslation } from "@/app/utils/i18n";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

export default function RegisterPage() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { openDialog } = useDialogStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      openDialog({
        variant: "error",
        message: t("errors.auth.errorPasswordsNotMatch"),
      });
      return;
    }

    if (password.length < 6) {
      openDialog({
        variant: "error",
        message: t("errors.auth.errorPasswordMinLength"),
      });
      return;
    }

    setLoading(true);

    try {
      await usersService.signup({ name, email, password });
      setRegisteredEmail(email);
      setResendCooldown(60);
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

  const handleResend = async () => {
    if (!registeredEmail || resendCooldown > 0 || resending) return;
    setResending(true);
    try {
      await usersService.resendVerification({ email: registeredEmail });
      setResendCooldown(60);
      openDialog({
        variant: "success",
        message: t("labels.register_success.resend_success"),
      });
    } catch (err) {
      const { code } = getApiError(err);
      openDialog({
        variant: "error",
        message: t(code ? `errors.auth.${code}` : "errors.all.generic"),
      });
    } finally {
      setResending(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (registeredEmail) {
    return (
      <div className="w-full flex flex-col items-center text-center">
        <MarkEmailReadOutlinedIcon
          className="text-primary mb-4"
          style={{ fontSize: 48 }}
        />

        <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
          {t("labels.register_success.title")}
        </h1>

        <p className="text-foreground-2 mt-2 text-sm sm:text-base leading-relaxed max-w-md">
          {t("labels.register_success.description")}{" "}
          <strong className="text-foreground font-semibold">
            {registeredEmail}
          </strong>
          .
        </p>

        <p className="text-label mt-2 text-xs sm:text-sm max-w-sm">
          {t("labels.register_success.instructions")}
        </p>

        <div className="w-full mt-8 flex flex-col gap-3">
          <AppButton
            type="button"
            color="background"
            disabled={resendCooldown > 0 || resending}
            onClick={handleResend}
            className="w-full py-5!"
          >
            <RefreshOutlinedIcon
              style={{ fontSize: 18 }}
              className={resending ? "animate-spin" : ""}
            />
            <span>
              {resendCooldown > 0
                ? t("labels.register_success.resend_cooldown", {
                    seconds: resendCooldown,
                  })
                : resending
                  ? t("labels.verify_email.resending")
                  : t("labels.register_success.resend_button")}
            </span>
          </AppButton>

          <Link href="/login" className="w-full">
            <AppButton
              type="button"
              color="transparent"
              flat
              className="w-full py-5!"
            >
              <ArrowBackOutlinedIcon style={{ fontSize: 18 }} />
              <span>{t("labels.register_success.back_to_login")}</span>
            </AppButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {t("labels.register.title")}
        </h1>
        <p className="text-label mt-2">{t("labels.register.description")}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AppInputText
          label="Nome"
          type="text"
          placeholder={t("labels.all.name")}
          value={name}
          onChange={(e) => setName((e.target as HTMLInputElement).value)}
          required
        />

        <AppInputText
          label={t("labels.all.email")}
          type="email"
          placeholder="exemplo@email.com"
          value={email}
          onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          required
        />

        <AppInputText
          label={t("labels.all.password")}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
          required
        />

        <AppInputText
          label={t("labels.register.confirm_password")}
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
          disabled={loading}
          className="py-5!"
        >
          {loading
            ? t("labels.register.creating")
            : t("labels.register.create")}
        </AppButton>
      </form>

      <p className=" text-label mt-6">
        {t("labels.register.have_account")}{" "}
        <Link
          href="/login"
          className="text-primary hover:underline font-semibold transition-colors"
        >
          {t("labels.all.enter")}
        </Link>
      </p>
    </div>
  );
}
