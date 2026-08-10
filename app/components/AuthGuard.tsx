"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTokenStore } from "@/stores/tokenStore";
import AppLoading from "./AppLoading";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useTokenStore((state) => state.token);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !token) {
      router.push("/login");
    }
  }, [isMounted, token, router]);

  if (!isMounted || !token) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <AppLoading />
      </div>
    );
  }

  return <>{children}</>;
}
