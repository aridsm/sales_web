import { create } from "zustand";

export type DialogVariant = "confirm" | "error" | "alert" | "success";

interface DialogOptions {
  title?: string;
  message: string;
  variant?: DialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface DialogState {
  open: boolean;
  options: DialogOptions;
  openDialog: (options: DialogOptions) => void;
  closeDialog: () => void;
}

const defaultOptions: DialogOptions = {
  message: "",
  variant: "alert",
};

export const useDialogStore = create<DialogState>((set) => ({
  open: false,
  options: defaultOptions,
  openDialog: (options) => set({ open: true, options }),
  closeDialog: () => set({ open: false }),
}));
