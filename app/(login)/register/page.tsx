"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usersService } from "@/api/services/UserService";
import { getApiError } from "@/api/schemas";
import { useTokenStore } from "@/stores/tokenStore";
import { useDialogStore } from "@/stores/dialogStore";
import AppButton from "@/app/components/AppButton";
import AppInputText from "@/app/components/inputs/AppInputText";
import Link from "next/link";
import { useTranslation } from "@/app/utils/i18n";
import { useColorModeStore } from "@/stores/colorModeStore";

export default function RegisterPage() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setTokenData } = useTokenStore();
  const { openDialog } = useDialogStore();
  const [mounted, setMounted] = useState(false);
  const {mode} = useColorModeStore()

  const isDark = mode == 'dark'

  useEffect(() => {
    setMounted(true);
  }, []);

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
      const { access_token, refresh_token, expires_at } =
        await usersService.signup({ name, email, password });
      setTokenData(
        access_token || null,
        refresh_token || null,
        expires_at || null,
      );
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

  if (!mounted) {
    return null;
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
          label="Email"
          type="email"
          placeholder={t("labels.all.email")}
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
          color='primary-3'
          disabled={loading}
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
          className="text-primary-3 dark:text-primary hover:underline font-semibold transition-colors"
        >
          {t("labels.all.enter")}
        </Link>
      </p>
    </div>
  );
}
