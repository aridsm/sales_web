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

export default function AppModal({ isOpen, onClose, title, children }: AppModalProps) {
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

      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        {title && (
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <AppButton
              onClick={onClose}
              color="background"
              className="px-2 py-1!"
            >
              ✕
            </AppButton>
          </div>
        )}

        <div className="mt-2 text-gray-600">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
