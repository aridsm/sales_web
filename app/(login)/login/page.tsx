"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usersService } from "@/api/services/UserService";
import { useTokenStore } from "@/stores/tokenStore";
import { useDialogStore } from "@/stores/dialogStore";
import AppLogo from "@/app/components/AppLogo";
import AppButton from "@/app/components/AppButton";
import AppInputText from "@/app/components/inputs/AppInputText";
import AppDarkModeToggle from "@/app/components/AppDarkModeToggle";
import AppLanguageSelect from "@/app/components/AppLanguageSelect";
import Link from "next/link";
import AppCard from "@/app/components/AppCard";
import { useTranslation } from "@/app/utils/i18n";

export default function LoginPage() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { token, setTokenData } = useTokenStore();
  const { openDialog } = useDialogStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
        await usersService.login(formData.toString() as any);
      setTokenData(access_token, refresh_token, expires_at);
      router.push("/");
    } catch (err: any) {
      openDialog({
        variant: "error",
        message: t(`errors.auth.${err.response.data.detail.error}`),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || token) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="flex items-center justify-between gap-4 mb-2">
        <AppDarkModeToggle />
        <AppLanguageSelect />
      </div>

      <AppCard className="p-8">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-12 h-12 flex items-center justify-center rounded-md bg-primary/10 p-2 text-primary">
            <AppLogo />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              {t("labels.login.title")}
            </h1>
            <p className="text-label text-sm mt-1.5">
              {t("labels.login.subtitle")}
            </p>
          </div>
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
              onChange={(e) =>
                setPassword((e.target as HTMLInputElement).value)
              }
              required
            />
          </div>

          <AppButton
            type="submit"
            color="primary"
            disabled={loading}
            className="w-full h-12 mt-4 text-sm"
          >
            {loading ? t("labels.login.logging") : t("labels.login.button")}
          </AppButton>
        </form>

        <p className="text-center text-sm text-label mt-6">
          {t("labels.login.no_account")}{" "}
          <Link
            href="/register"
            className="text-primary dark:text-amber-300 hover:underline font-semibold"
          >
            {t("labels.login.create_account")}
          </Link>
        </p>
      </AppCard>

      <p className="text-center text-xs text-label mt-8">
        © {new Date().getFullYear()} Sales App. {t("labels.all.all_rights")}.
      </p>
    </div>
  );
}
