import { ActionType } from "@/enums/ActionType";
import { SaleStatus } from "@/enums/SaleStatus";

export const ACTION_CONFIG: Record<
  ActionType,
  { labelKey: string; color: string; bg: string }
> = {
  [ActionType.CREATE]: {
    labelKey: "labels.history.actions.CREATE",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  [ActionType.UPDATE]: {
    labelKey: "labels.history.actions.UPDATE",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  [ActionType.DELETE]: {
    labelKey: "labels.history.actions.DELETE",
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-500/10",
  },
  [ActionType.CANCEL]: {
    labelKey: "labels.history.actions.CANCEL",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
  },
};

export const STATUS_CONFIG: Record<
  SaleStatus,
  { labelKey: string; color: string; bg: string }
> = {
  [SaleStatus.DONE]: {
    labelKey: "labels.sales.status.done",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  [SaleStatus.CANCELED]: {
    labelKey: "labels.sales.status.canceled",
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-500/10",
  },
};
