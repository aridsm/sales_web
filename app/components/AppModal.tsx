"use client";

import { useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
import AppButton from "./AppButton";
import { useFocusTrap } from "../utils/useFocusTrap";

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function AppModal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: AppModalProps) {
  const [mounted, setMounted] = useState(false);
  const trapRef = useFocusTrap(isOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        ref={trapRef as React.RefObject<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={`relative w-full max-w-md bg-background-2 dark:bg-background rounded-xs border border-border shadow-2xl shadow-black/15 p-3 md:p-4 flex flex-col gap-3 md:gap-4 animate-in fade-in zoom-in-95 duration-200 ${className || ""}`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2
              id="modal-title"
              className="text-base md:text-lg font-semibold text-foreground"
            >
              {title}
            </h2>
            <AppButton
              onClick={onClose}
              color="transparent"
              flat
              rounded
              className="w-8 h-8"
              aria-label="Close modal"
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
