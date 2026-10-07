"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usersService } from "@/api/services/UserService";
import { getApiError } from "@/api/schemas";
import { useTokenStore } from "@/stores/tokenStore";
import { useDialogStore } from "@/stores/dialogStore";
import { useTranslation } from "@/app/utils/i18n";
import AppButton from "@/app/components/AppButton";
import AppInputText from "@/app/components/inputs/AppInputText";
import AppLoading from "@/app/components/AppLoading";
import {
  CheckCircleOutlined,
  CancelOutlined,
  ArrowForwardOutlined,
  RefreshOutlined,
} from "@mui/icons-material";
import Link from "next/link";

function VerifyEmailContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setTokenData, token } = useTokenStore();
  const { openDialog } = useDialogStore();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const verificationToken = searchParams.get("token");
  const verifiedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  useEffect(() => {
    if (!verificationToken) {
      setStatus("error");
      setErrorMessage(t("errors.auth.errorInvalidOrExpiredVerificationToken"));
      return;
    }

    if (verifiedTokenRef.current === verificationToken) {
      return;
    }
    verifiedTokenRef.current = verificationToken;

    usersService
      .verifyEmail({ token: verificationToken })
      .then((tokenResponse) => {
        if (tokenResponse?.access_token) {
          setTokenData(
            tokenResponse.access_token,
            tokenResponse.refresh_token,
            tokenResponse.expires_at,
          );
        }
        setStatus("success");
      })
      .catch((err) => {
        const { code } = getApiError(err);
        setStatus("error");
        setErrorMessage(
          t(
            code
              ? `errors.auth.${code}`
              : "errors.auth.errorInvalidOrExpiredVerificationToken",
          ),
        );
      });
  }, [verificationToken, setTokenData, t]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail || resendCooldown > 0 || resending) return;

    setResending(true);
    try {
      await usersService.resendVerification({ email: resendEmail });
      setResendCooldown(60);
      openDialog({
        variant: "success",
        message: t("labels.verify_email.resend_success"),
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

  if (status === "loading") {
    return (
      <div className="w-full flex flex-col items-center justify-center text-center py-10">
        <AppLoading className="w-10 h-10 mb-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">
          {t("labels.verify_email.verifying_title")}
        </h1>
        <p className="text-label mt-2 text-sm max-w-sm">
          {t("labels.verify_email.verifying_description")}
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="w-full flex flex-col items-center text-center">
        <CheckCircleOutlined
          className="text-emerald-500 mb-4"
          style={{ fontSize: 48 }}
        />

        <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
          {t("labels.verify_email.success_title")}
        </h1>

        <p className="text-foreground-2 mt-2 text-sm sm:text-base leading-relaxed max-w-md">
          {t("labels.verify_email.success_description")}
        </p>

        <div className="w-full mt-8">
          <AppButton
            type="button"
            color="primary"
            className="w-full py-5!"
            onClick={() => router.push(token ? "/" : "/login")}
          >
            <span>
              {token
                ? t("labels.verify_email.go_to_dashboard")
                : t("labels.verify_email.go_to_login")}
            </span>
            <ArrowForwardOutlined style={{ fontSize: 18 }} />
          </AppButton>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center text-center">
      <CancelOutlined className="text-red-500 mb-4" style={{ fontSize: 48 }} />

      <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
        {t("labels.verify_email.error_title")}
      </h1>

      <p className="text-red-500/90 dark:text-red-400 mt-2 text-sm leading-relaxed max-w-md font-medium">
        {errorMessage}
      </p>

      <p className="text-label mt-2 text-xs sm:text-sm max-w-md">
        {t("labels.verify_email.error_description")}
      </p>

      <form onSubmit={handleResend} className="w-full mt-6 flex flex-col gap-3 text-left">
        <AppInputText
          label={t("labels.all.email")}
          type="email"
          placeholder={t("labels.verify_email.email_placeholder")}
          value={resendEmail}
          onChange={(e) => setResendEmail((e.target as HTMLInputElement).value)}
          required
        />

        <AppButton
          type="submit"
          color="primary"
          disabled={!resendEmail || resendCooldown > 0 || resending}
          className="w-full py-5! mt-1"
        >
          <RefreshOutlined
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
                : t("labels.verify_email.resend_button")}
          </span>
        </AppButton>
      </form>

      <div className="mt-6">
        <Link
          href="/login"
          className="text-sm text-primary hover:underline font-semibold transition-colors"
        >
          {t("labels.verify_email.go_to_login")}
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center py-20">
          <AppLoading className="w-8 h-8 text-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
