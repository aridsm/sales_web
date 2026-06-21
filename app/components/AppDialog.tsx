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
import { useTranslation } from "@/app/utils/i18n";
import { useFocusTrap } from "../utils/useFocusTrap";

const variantConfig: Record<
  DialogVariant,
  {
    icon: React.ReactNode;
    iconColor: string;
    iconBg: string;
    titleKey: string;
  }
> = {
  success: {
    icon: <CheckCircleOutlined fontSize="large" />,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    titleKey: "labels.dialog.success",
  },
  error: {
    icon: <CancelOutlined fontSize="large" />,
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10",
    titleKey: "labels.dialog.error",
  },
  alert: {
    icon: <WarningAmberOutlined fontSize="large" />,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
    titleKey: "labels.dialog.alert",
  },
  confirm: {
    icon: <NewReleasesOutlined fontSize="large" />,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    titleKey: "labels.dialog.confirm",
  },
};

export default function AppDialog() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const { open, options, closeDialog } = useDialogStore();
  const trapRef = useFocusTrap(open);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const variant: DialogVariant = options.variant ?? "alert";
  const { icon, iconColor, iconBg, titleKey } = variantConfig[variant];
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

      <div
        ref={trapRef as React.RefObject<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        className="relative w-full max-w-sm bg-background-2 dark:bg-background rounded-lg border border-border shadow-2xl shadow-black/15 p-6 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200"
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg} ${iconColor} mt-1`}
        >
          {icon}
        </div>

        <h2 id="dialog-title" className="text-lg font-semibold text-foreground text-center">
          {options.title ?? t(titleKey)}
        </h2>

        <p id="dialog-description" className="text-label text-center leading-relaxed">
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
              {options.cancelLabel ?? t("labels.all.cancel")}
            </AppButton>
          )}
          <AppButton
            type="button"
            color={variant === "error" ? "red" : "primary"}
            className="flex-1 px-5"
            onClick={isConfirm ? handleConfirm : handleCancel}
          >
            {options.confirmLabel ?? (isConfirm ? t("labels.all.confirm") : t("labels.dialog.ok"))}
          </AppButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}
