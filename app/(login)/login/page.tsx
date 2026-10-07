"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usersService } from "@/api/services/UserService";
import { Login, getApiError } from "@/api/schemas";
import { useTokenStore } from "@/stores/tokenStore";
import { useDialogStore } from "@/stores/dialogStore";
import AppButton from "@/app/components/AppButton";
import AppInputText from "@/app/components/inputs/AppInputText";
import AppCheckbox from "@/app/components/inputs/AppCheckbox";
import Link from "next/link";
import { useTranslation } from "@/app/utils/i18n";
import { useColorModeStore } from "@/stores/colorModeStore";

export default function LoginPage() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const { token, setTokenData } = useTokenStore();
  const { openDialog } = useDialogStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedEmail = localStorage.getItem("remembered_email");
      if (savedEmail) {
        setUsername(savedEmail);
        setRememberMe(true);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  useEffect(() => {
    if (token) {
      router.push("/");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUnverifiedEmail(null);

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);
      const { access_token, refresh_token, expires_at } =
        await usersService.login(formData.toString() as unknown as Login);
      setTokenData(access_token, refresh_token, expires_at);
      try {
        if (rememberMe) {
          localStorage.setItem("remembered_email", username);
        } else {
          localStorage.removeItem("remembered_email");
        }
      } catch {
        // ignore
      }
      router.push("/");
    } catch (err) {
      const { code } = getApiError(err);
      if (code === "errorEmailNotVerified") {
        setUnverifiedEmail(username);
      }
      openDialog({
        variant: "error",
        message: t(code ? `errors.auth.${code}` : "errors.all.generic"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail || resendCooldown > 0 || resending) return;
    setResending(true);
    try {
      await usersService.resendVerification({ email: unverifiedEmail });
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

  if (!mounted || token) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {t("labels.login.title")}
        </h1>
        <p className="text-label mt-2">{t("labels.login.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AppInputText
          label={t("labels.all.email")}
          type="email"
          placeholder="exemplo@email.com"
          value={username}
          onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
          required
        />
        <div className="flex flex-col gap-1">
          <AppInputText
            label={t("labels.all.password")}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
            required
          />
        </div>
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <AppCheckbox
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>{t("labels.login.remember_me")}</span>
          </label>
        </div>
        <AppButton
          type="submit"
          color="primary"
          disabled={loading}
          className="py-5!"
        >
          {loading ? t("labels.login.logging") : t("labels.login.button")}
        </AppButton>
      </form>

      {unverifiedEmail && (
        <div className="mt-4 p-3.5 rounded-xs border border-primary/30 bg-primary/5 flex flex-col gap-2">
          <p className="text-sm text-foreground/90">
            {t("errors.auth.errorEmailNotVerified")}
          </p>
          <AppButton
            type="button"
            color="primary"
            flat
            disabled={resendCooldown > 0 || resending}
            onClick={handleResend}
            className="self-start px-3.5 py-2 h-auto text-sm"
          >
            {resendCooldown > 0
              ? t("labels.register_success.resend_cooldown", {
                  seconds: resendCooldown,
                })
              : resending
                ? t("labels.verify_email.resending")
                : t("labels.verify_email.resend_button")}
          </AppButton>
        </div>
      )}

      <p className="text-label mt-6">
        {t("labels.login.no_account")}{" "}
        <Link
          href="/register"
          className="text-primary hover:underline font-semibold transition-colors"
        >
          {t("labels.login.create_account")}
        </Link>
      </p>
    </div>
  );
}
