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
  const router = useRouter();
  const { token, setTokenData } = useTokenStore();
  const { openDialog } = useDialogStore();
  const [mounted, setMounted] = useState(false);
  const {mode} = useColorModeStore()

  const isDark = mode == 'dark'

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
    if (token) {
      router.push("/");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
      openDialog({
        variant: "error",
        message: t(code ? `errors.auth.${code}` : "errors.all.generic"),
      });
    } finally {
      setLoading(false);
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
          label="Email"
          type="email"
          placeholder={t("labels.all.email")}
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
          color='primary-3'
          disabled={loading}
        >
          {loading ? t("labels.login.logging") : t("labels.login.button")}
        </AppButton>
      </form>

      <p className="text-label mt-6">
        {t("labels.login.no_account")}{" "}
        <Link
          href="/register"
          className="text-primary-3 dark:text-primary hover:underline font-semibold transition-colors"
        >
          {t("labels.login.create_account")}
        </Link>
      </p>
    </div>
  );
}
