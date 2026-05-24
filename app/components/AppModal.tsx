"use client";

import { useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
import AppButton from "./AppButton";

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function AppModal({
  isOpen,
  onClose,
  title,
  children,
}: AppModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-background-2 dark:bg-background rounded-lg border border-border shadow-2xl shadow-black/15 p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        {title && (
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <AppButton
              onClick={onClose}
              color="transparent"
              flat
              rounded
              className="w-8 h-8"
            >
              ✕
            </AppButton>
          </div>
        )}

        <div className=" text-label">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
