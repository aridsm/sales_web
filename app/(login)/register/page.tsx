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

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      openDialog({
        variant: "error",
        message: "As senhas não coincidem.",
      });
      return;
    }

    if (password.length < 6) {
      openDialog({
        variant: "error",
        message: "A senha deve ter pelo menos 6 caracteres.",
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
    } catch (err: any) {
      openDialog({
        variant: "error",
        message: t(`errors.auth.${err.response.data.detail.error}`),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="flex items-center justify-end gap-4 mb-2">
        <AppDarkModeToggle />
        <AppLanguageSelect />
      </div>

      <AppCard className="p-8">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-12 h-12 flex items-center justify-center rounded-md bg-primary/10 p-2 text-primary">
            <AppLogo />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {t("labels.register.title")}
            </h1>
            <p className="text-label text-sm mt-1.5">
              {t("labels.register.description")}
            </p>
          </div>
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
            color="primary"
            disabled={loading}
            className="w-full h-12 mt-4 text-sm"
          >
            {loading
              ? t("labels.register.creating")
              : t("labels.register.create")}
          </AppButton>
        </form>

        <p className="text-center text-sm text-label mt-6">
          {t("labels.register.have_account")}{" "}
          <Link
            href="/login"
            className="text-primary hover:text-primary-2 hover:underline font-semibold transition-colors"
          >
            {t("labels.all.enter")}
          </Link>
        </p>
      </AppCard>

      <p className="text-center text-xs text-label mt-8">
        © {new Date().getFullYear()} Kivo. {t("labels.all.all_rights")}.
      </p>
    </div>
  );
}
