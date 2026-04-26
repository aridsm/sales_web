"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usersService } from "@/api/services/UserService";
import { useTokenStore } from "@/stores/tokenStore";
import { useDialogStore } from "@/stores/dialogStore";

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
      const response = await usersService.login(formData.toString());
      const { token, access_token, refresh_token, expires_at } = response.data;
      setTokenData(token || access_token || null, refresh_token || null, expires_at || null);
      router.push("/");
    } catch (err: any) {
      openDialog({
        variant: "error",
        message: err.response?.data?.message || "Falha ao realizar login. Verifique suas credenciais.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return <div>Redirecionando...</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Senha
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
