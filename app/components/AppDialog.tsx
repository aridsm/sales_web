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
  { icon: React.ReactNode; iconColor: string; defaultTitle: string }
> = {
  success: {
    icon: <CheckCircleOutlined fontSize="large" />,
    iconColor: "text-emerald-500",
    defaultTitle: "Sucesso",
  },
  error: {
    icon: <CancelOutlined fontSize="large" />,
    iconColor: "text-red-500",
    defaultTitle: "Erro",
  },
  alert: {
    icon: <WarningAmberOutlined fontSize="large" />,
    iconColor: "text-amber-500",
    defaultTitle: "Atenção",
  },
  confirm: {
    icon: <NewReleasesOutlined fontSize="large" />,
    iconColor: "text-primary",
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
  const { icon, iconColor, defaultTitle } = variantConfig[variant];
  const isConfirm = variant === "confirm";

  async function handleConfirm() {
    if (options.onConfirm) {
      await options.onConfirm();
    }
    closeDialog();
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

      <div className="relative w-full max-w-sm bg-background rounded-xl shadow-2xl p-6 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div className={`${iconColor} mt-1`}>{icon}</div>

        <h2 className="text-lg font-semibold text-foreground text-center">
          {options.title ?? defaultTitle}
        </h2>

        <p className="text-label text-center leading-relaxed">
          {options.message}
        </p>

        <div className="flex gap-3 w-full mt-2">
          {isConfirm && (
            <AppButton
              type="button"
              color="background"
              className="flex-1 px-4"
              onClick={handleCancel}
              flat={false}
            >
              {options.cancelLabel ?? "Cancelar"}
            </AppButton>
          )}
          <AppButton
            type="button"
            color={variant === "error" ? "red" : "primary"}
            className="flex-1 px-4"
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
