"use client";

import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PaginationResult } from "../utils/usePagination";
import { Close } from "@mui/icons-material";
import AppPagination from "./AppPagination";
import AppCheckbox from "./inputs/AppCheckbox";
import AppActions, { ActionItem } from "./AppActions";
import AppLoading from "./AppLoading";
import { useDialogStore } from "@/stores/dialogStore";
import { useTranslation } from "@/app/utils/i18n";
import AppEmptyState from "./AppEmptyState";
import { usePermission } from "../utils/usePermission";

interface Column<T> {
  column: React.ReactNode | string;
  cell: (props: { row: T }) => React.ReactNode | string;
  size?: number;
}

interface AppGridProps<T> {
  columns: Column<T>[];
  pagination: PaginationResult<T>;

  selectedRows?: T[];
  onSelectedChange?: (rows: T[]) => void;
  actions?: ActionItem<T>[];

  hideSelectionCount?: boolean;
  className?: string;
}

export default function AppGrid<T>({
  columns,
  pagination,

  selectedRows,
  onSelectedChange,
  actions,

  hideSelectionCount,
  className,
}: AppGridProps<T>) {
  const { t } = useTranslation();
  const { items, loading, loaded, load } = pagination;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { openDialog } = useDialogStore();
  const { canEdit } = usePermission();

  const hasSelection =
    canEdit && selectedRows !== undefined && onSelectedChange !== undefined;

  const isSelected = (row: T) =>
    selectedRows?.some(
      (r) =>
        r === row ||
        (r as Record<string, unknown>).id ===
          (row as Record<string, unknown>).id,
    );

  function handleSelectRow(row: T, checked: boolean) {
    if (!hasSelection) return;
    if (checked) {
      onSelectedChange([...(selectedRows || []), row]);
    } else {
      onSelectedChange(
        (selectedRows || []).filter(
          (r) =>
            !(
              r === row ||
              (r as Record<string, unknown>).id ===
                (row as Record<string, unknown>).id
            ),
        ),
      );
    }
  }

  const isAllSelected =
    items.length > 0 && items.every((item) => isSelected(item));

  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!hasSelection) return;
      if (e.target.checked) {
        const newSelected = [...(selectedRows || [])];
        items.forEach((item) => {
          if (
            !newSelected.some(
              (r) =>
                r === item ||
                (r as Record<string, unknown>).id ===
                  (item as Record<string, unknown>).id,
            )
          ) {
            newSelected.push(item);
          }
        });
        onSelectedChange(newSelected);
      } else {
        const newSelected = (selectedRows || []).filter(
          (r) =>
            !items.some(
              (item) =>
                item === r ||
                (item as Record<string, unknown>).id ===
                  (r as Record<string, unknown>).id,
            ),
        );
        onSelectedChange(newSelected);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const [delayedLoading, setDelayedLoading] = React.useState(false);
  const [hasStartedLoading, setHasStartedLoading] = React.useState(
    loaded || items.length > 0,
  );

  React.useEffect(() => {
    let timer: NodeJS.Timeout;

    if (loading) {
      setHasStartedLoading(true);
      timer = setTimeout(() => {
        setDelayedLoading(true);
      }, 300);
    } else {
      setDelayedLoading(false);
      if (loaded) {
        setHasStartedLoading(true);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading, loaded]);

  const [colWidths, setColWidths] = React.useState<number[]>(
    columns.map((c) => c.size || 140),
  );

  React.useEffect(() => {
    setColWidths((prev) => {
      if (prev.length !== columns.length) {
        return columns.map((c) => c.size || 140);
      }
      return prev;
    });
  }, [columns]);

  const [resizingIndex, setResizingIndex] = React.useState<number | null>(null);

  function handleMouseDown(e: React.MouseEvent, index: number) {
    e.preventDefault();
    setResizingIndex(index);
    const startX = e.clientX;
    const startWidth = colWidths[index] || columns[index].size || 140;

    function handleMouseMove(moveEvent: MouseEvent) {
      const deltaX = moveEvent.clientX - startX;
      setColWidths((prev) => {
        const newWidths = [...prev];
        newWidths[index] = Math.max(50, startWidth + deltaX);
        return newWidths;
      });
    }

    function handleMouseUp() {
      setResizingIndex(null);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  const tableWidth = colWidths.reduce((acc, w) => acc + w, 0);

  return (
    <div
      className={`flex flex-col h-full min-h-0 min-w-0 flex-1 w-full ${className || ""}`}
    >
      {hasSelection && selectedRows && selectedRows.length > 0 && (
        <div className="flex flex-col border-l-3 border-y border-r border-emerald-600/20 border-l-emerald-400 sm:flex-row items-center justify-between bg-emerald-500/5 dark:bg-emerald-500/10 rounded-r-lg p-2.5 px-4 mb-3 animate-in fade-in zoom-in-95 duration-200 gap-3">
          <div className="flex items-center gap-3 w-full">
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-emerald-400 text-white dark:text-emerald-950 font-bold text-sm">
              {selectedRows.length}
            </div>
            <span className="font-medium text-emerald-700 dark:text-emerald-400">
              {!hideSelectionCount && (
                <>
                  {selectedRows.length === 1
                    ? t("labels.grid.item_selected_singular")
                    : t("labels.grid.item_selected_plural")}
                </>
              )}
            </span>
            {onSelectedChange && (
              <button
                onClick={() => onSelectedChange([])}
                className="w-6 h-6 text-emerald-700 dark:text-emerald-400 ml-auto cursor-pointer"
                title={t("labels.all.clear") || "Limpar"}
              >
                <Close style={{ fontSize: 16 }} />
              </button>
            )}
          </div>
        </div>
      )}
      <div className="flex-1 min-h-0 min-w-0 w-full flex flex-col">
        {!hasStartedLoading || (loading && items.length === 0) ? (
          delayedLoading ? (
            <div className="flex justify-center items-center h-full flex-1">
              <AppLoading className="p-10" />
            </div>
          ) : (
            <div className="h-full w-full flex-1" />
          )
        ) : (
          <div className="overflow-auto min-h-0 border border-border rounded-lg bg-white dark:bg-background">
            <table
              className="table-fixed max-w-none border-separate border-spacing-0"
              style={{
                width: "100%",
                minWidth:
                  items.length > 0 && tableWidth > 0 ? tableWidth : "100%",
              }}
            >
              <thead className="text-sm sticky top-0 z-20 text-label bg-background-3 dark:bg-background-3">
                <tr>
                  {hasSelection && (
                    <th className="p-3 text-center sticky left-0 z-30 w-12 border-b border-border bg-background-3 dark:bg-background-3">
                      {items.length > 0 && (
                        <AppCheckbox
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                        />
                      )}
                    </th>
                  )}
                  {columns.map((col, index) => (
                    <th
                      key={index}
                      className={`py-3 px-4 text-left relative border-b border-border font-medium ${resizingIndex === index ? "text-primary-3 dark:text-primary" : ""}`}
                      style={{ width: colWidths[index] || col.size || 140 }}
                    >
                      {col.column}
                      {items.length > 0 && (
                        <div
                          onMouseDown={(e) => handleMouseDown(e, index)}
                          className="absolute right-0 top-0 bottom-0 w-5 cursor-col-resize z-10 flex items-center justify-center group/resize"
                        >
                          <div className="w-[2px] h-6 rounded-full bg-border/50 group-hover/resize:bg-primary transition-colors" />
                        </div>
                      )}
                    </th>
                  ))}
                  <th className="border-b border-border"></th>
                  {actions && items.length > 0 && (
                    <th className="p-3 text-center sticky right-0 z-30 w-12 border-b border-border"></th>
                  )}
                </tr>
              </thead>
              {items.length > 0 && (
                <tbody
                  className={
                    delayedLoading
                      ? "opacity-50 transition-opacity pointer-events-none "
                      : ""
                  }
                >
                  {items.map((row: T, rowIndex: number) => {
                    const selected = isSelected(row);
                    const rowBgClass = "bg-white dark:bg-background";
                    const hoverBgClass =
                      "hover:bg-background dark:hover:bg-background-3";
                    const groupHoverBgClass =
                      "group-hover:bg-background dark:group-hover:bg-background-3";
                    const borderBClass =
                      rowIndex === items.length - 1 ? "" : "border-b";

                    return (
                      <tr
                        key={rowIndex}
                        className={`group transition-colors duration-100 ${
                          selected
                            ? "bg-primary-4 dark:bg-background-3 hover:bg-primary-4 dark:hover:bg-background-3"
                            : `${rowBgClass} ${hoverBgClass}`
                        }`}
                      >
                        {hasSelection && (
                          <td
                            className={`border-border p-3 w-12 sticky left-0 z-10 text-center ${borderBClass} transition-colors ${
                              selected
                                ? "bg-primary-4 dark:bg-background-3 group-hover:bg-primary-4 dark:group-hover:bg-background-3"
                                : `${rowBgClass} ${groupHoverBgClass}`
                            }`}
                          >
                            <AppCheckbox
                              checked={selected}
                              onChange={(e) =>
                                handleSelectRow(row, e.target.checked)
                              }
                            />
                          </td>
                        )}
                        {columns.map((col, colIndex) => (
                          <td
                            key={colIndex}
                            className={`py-3.5 px-4 border-border overflow-hidden ${borderBClass} text-foreground transition-colors ${
                              selected ? "text-foreground" : ""
                            }`}
                            style={{
                              width: colWidths[colIndex] || col.size || 140,
                            }}
                          >
                            {col.cell({ row })}
                          </td>
                        ))}
                        <td
                          className={`${borderBClass} transition-colors border-border`}
                        ></td>
                        {actions && (
                          <td
                            className={`p-3 ${borderBClass} border-border text-center w-12 sticky right-0 z-10 transition-colors ${
                              selected
                                ? "bg-primary-4 dark:bg-background-3 group-hover:bg-primary-4 dark:group-hover:bg-background-3"
                                : `${rowBgClass} ${groupHoverBgClass} border-border`
                            }`}
                          >
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <AppActions item={row} actions={actions} />
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              )}
            </table>
            {items.length === 0 && (
              <AppEmptyState className="flex-1 p-14 border-b border-border bg-white dark:bg-background" />
            )}
          </div>
        )}
      </div>
      <AppPagination pagination={pagination} />
    </div>
  );
}
