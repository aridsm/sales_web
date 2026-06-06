"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usersService } from "@/api/services/UserService";
import { useTokenStore } from "@/stores/tokenStore";
import { useDialogStore } from "@/stores/dialogStore";
import AppLogo from "@/app/components/AppLogo";
import AppButton from "@/app/components/AppButton";
import AppInputText from "@/app/components/inputs/AppInputText";
import AppDarkModeToggle from "@/app/components/AppDarkModeToggle";
import Link from "next/link";
import AppCard from "@/app/components/AppCard";
import { getLabel } from "@/app/utils/i18n";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setTokenData } = useTokenStore();
  const { openDialog } = useDialogStore();

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
        message: getLabel(`errors.auth.${err.detail.error}`),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="flex justify-end mb-6">
        <AppDarkModeToggle />
      </div>

      <AppCard className="p-8">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-12 h-12 flex items-center justify-center rounded-md bg-primary/10 p-2 text-primary">
            <AppLogo />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Criar sua conta
            </h1>
            <p className="text-label text-sm mt-1.5">
              Preencha os dados abaixo para começar
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AppInputText
            label="Nome"
            type="text"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName((e.target as HTMLInputElement).value)}
            required
          />

          <AppInputText
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
            required
          />

          <AppInputText
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
            required
          />

          <AppInputText
            label="Confirmar senha"
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
            {loading ? "Criando conta..." : "Criar conta"}
          </AppButton>
        </form>

        <p className="text-center text-sm text-label mt-6">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="text-primary hover:text-primary-2 hover:underline font-semibold transition-colors"
          >
            Entrar
          </Link>
        </p>
      </AppCard>

      <p className="text-center text-xs text-label mt-8">
        © {new Date().getFullYear()} Kivo. Todos os direitos reservados.
      </p>
    </div>
  );
}
