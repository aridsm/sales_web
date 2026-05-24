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
import Link from "next/link";
import AppCard from "@/app/components/AppCard";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { token, setTokenData } = useTokenStore();
  const { openDialog } = useDialogStore();

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
        message:
          err.response?.data?.message ||
          "Falha ao realizar login. Verifique suas credenciais.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return null;
  }

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
            <h1 className="text-2xl font-bold tracking-tight">
              Bem-vindo de volta!
            </h1>
            <p className="text-label text-sm mt-1.5">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AppInputText
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={username}
            onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
            required
          />

          <div className="flex flex-col gap-1">
            <AppInputText
              label="Senha"
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
            {loading ? "Entrando..." : "Entrar"}
          </AppButton>
        </form>

        <p className="text-center text-sm text-label mt-6">
          Não tem uma conta?{" "}
          <Link
            href="/register"
            className="text-primary hover:text-primary-2 hover:underline font-semibold transition-colors"
          >
            Criar conta
          </Link>
        </p>
      </AppCard>

      <p className="text-center text-xs text-label mt-8">
        © {new Date().getFullYear()} Sales App. Todos os direitos reservados.
      </p>
    </div>
  );
}
