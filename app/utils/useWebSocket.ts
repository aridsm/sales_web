"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTokenStore } from "@/stores/tokenStore";
import { useDialogStore } from "@/stores/dialogStore";
import { useUserStore } from "@/stores/userStore";
import { useTranslation } from "./i18n";

function getWebSocketUrl(token: string): string {
  const envWs = process.env.NEXT_PUBLIC_WS_URL;
  if (envWs) {
    const base = envWs.replace(/\/+$/, "");
    return `${base}/ws?token=${encodeURIComponent(token)}`;
  }
  const baseApi = process.env.NEXT_PUBLIC_BASE_API;
  if (baseApi) {
    const wsBase = baseApi.replace(/^http/, "ws").replace(/\/+$/, "");
    return `${wsBase}/ws?token=${encodeURIComponent(token)}`;
  }
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.hostname}:8000/ws?token=${encodeURIComponent(token)}`;
  }
  return `ws://localhost:8000/ws?token=${encodeURIComponent(token)}`;
}

export function useWebSocket() {
  const { t } = useTranslation();
  const router = useRouter();
  const token = useTokenStore((state) => state.token);
  const { openDialog } = useDialogStore();
  const fetchUserData = useUserStore((state) => state.fetchUserData);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    let isUnmounted = false;

    function connect() {
      if (isUnmounted || !token) return;

      const wsUrl = getWebSocketUrl(token);
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.type === "company_invitation") {
            fetchUserData();
            openDialog({
              variant: "confirm",
              title: t("labels.account.new_invitation_received"),
              message: data.invited_by
                ? `${data.invited_by} convidou você para fazer parte de uma empresa.`
                : t("labels.account.new_invitation_received"),
              confirmLabel: t("labels.account.view_invitations"),
              onConfirm: () => {
                router.push("/account");
              },
            });
          }
        } catch {
          // ignore non-json messages
        }
      };

      ws.onclose = (event) => {
        socketRef.current = null;
        if (isUnmounted) return;

        // Code 4001 means unauthorized / invalid token
        if (event.code === 4001) {
          return;
        }

        // Exponential backoff reconnect
        const delay = Math.min(
          30000,
          1000 * Math.pow(2, reconnectAttemptsRef.current) + Math.random() * 1000,
        );
        reconnectAttemptsRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        // ws.close() triggers onclose which handles reconnect
      };
    }

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [token, t, router, openDialog, fetchUserData]);
}
