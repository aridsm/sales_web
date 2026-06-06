"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDialogStore, DialogVariant } from "@/stores/dialogStore";
import AppButton from "./AppButton";
import {
  CheckCircleOutlined,
  CancelOutlined,
  NewReleasesOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";

const variantConfig: Record<
  DialogVariant,
  {
    icon: React.ReactNode;
    iconColor: string;
    iconBg: string;
    defaultTitle: string;
  }
> = {
  success: {
    icon: <CheckCircleOutlined fontSize="large" />,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    defaultTitle: "Sucesso",
  },
  error: {
    icon: <CancelOutlined fontSize="large" />,
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10",
    defaultTitle: "Erro",
  },
  alert: {
    icon: <WarningAmberOutlined fontSize="large" />,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
    defaultTitle: "Atenção",
  },
  confirm: {
    icon: <NewReleasesOutlined fontSize="large" />,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    defaultTitle: "Confirmação",
  },
};

export default function AppDialog() {
  const [mounted, setMounted] = useState(false);
  const { open, options, closeDialog } = useDialogStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const variant: DialogVariant = options.variant ?? "alert";
  const { icon, iconColor, iconBg, defaultTitle } = variantConfig[variant];
  const isConfirm = variant === "confirm";

  async function handleConfirm() {
    closeDialog();
    if (options.onConfirm) {
      await options.onConfirm();
    }
  }

  function handleCancel() {
    if (options.onCancel) {
      options.onCancel();
    }
    closeDialog();
  }

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isConfirm ? undefined : handleCancel}
      />

      <div className="relative w-full max-w-sm bg-background-2 dark:bg-background rounded-lg border border-border shadow-2xl shadow-black/15 p-6 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg} ${iconColor} mt-1`}
        >
          {icon}
        </div>

        <h2 className="text-lg font-semibold text-foreground text-center">
          {options.title ?? defaultTitle}
        </h2>

        <p className="text-label text-center leading-relaxed">
          {options.message}
        </p>

        <div className="flex gap-3 mt-2 mx-auto">
          {isConfirm && (
            <AppButton
              type="button"
              color="background"
              className="flex-1 px-4"
              onClick={handleCancel}
            >
              {options.cancelLabel ?? "Cancelar"}
            </AppButton>
          )}
          <AppButton
            type="button"
            color={variant === "error" ? "red" : "primary"}
            className="flex-1 px-5"
            onClick={isConfirm ? handleConfirm : handleCancel}
          >
            {options.confirmLabel ?? (isConfirm ? "Confirmar" : "OK")}
          </AppButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}
