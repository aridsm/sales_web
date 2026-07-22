"use client";

import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PaginationResult } from "../utils/usePagination";
import { Search, Add, DeleteOutlined } from "@mui/icons-material";
import AppPagination from "./AppPagination";
import AppButton from "./AppButton";
import AppCheckbox from "./inputs/AppCheckbox";
import AppInputText from "./inputs/AppInputText";
import AppActions, { ActionItem } from "./AppActions";
import AppLoading from "./AppLoading";
import { useDialogStore } from "@/stores/dialogStore";
import { useTranslation } from "@/app/utils/i18n";
import AppEmptyState from "./AppEmptyState";

interface Column<T> {
  column: React.ReactNode | string;
  cell: (props: { row: T }) => React.ReactNode | string;
  size?: number;
}

interface AppGridProps<T> {
  columns: Column<T>[];
  pagination: PaginationResult<T>;
  onNew?: () => void;
  selectedRows?: T[];
  onSelectedChange?: (rows: T[]) => void;
  onDeleteSelected?: () => void;
  actions?: ActionItem<T>[];
  filter?: React.ReactNode;
  search?: boolean;
  searchKey?: string;
  hideSelectionCount?: boolean;
  className?: string;
}

export default function AppGrid<T>({
  columns,
  pagination,
  onNew,
  selectedRows,
  onSelectedChange,
  onDeleteSelected,
  actions,
  filter,
  search,
  searchKey = "search",
  hideSelectionCount,
  className,
}: AppGridProps<T>) {
  const { t } = useTranslation();
  const { items, loading, loaded, load } = pagination;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { openDialog } = useDialogStore();

  const hasSelection =
    selectedRows !== undefined && onSelectedChange !== undefined;

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

  const [searchInput, setSearchInput] = React.useState(
    () => searchParams.get(searchKey) || "",
  );

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

  React.useEffect(() => {
    setSearchInput(searchParams.get(searchKey) || "");
  }, [searchParams, searchKey]);

  function handleSearch() {
    try {
      const newParams = new URLSearchParams(searchParams.toString());
      if (searchInput) {
        newParams.set(searchKey, searchInput);
      } else {
        newParams.delete(searchKey);
      }
      newParams.set("page", "1");
      router.push(`${pathname}?${newParams.toString()}`);
      load({ params: { [searchKey]: searchInput, page: 1 } });
    } catch (error) {
      console.error(error);
      openDialog({
        variant: "error",
        message: t("labels.grid.search_error"),
      });
    }
  }

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
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    document.body.style.cursor = "e-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  const tableWidth = colWidths.reduce((acc, w) => acc + w, 0);

  return (
    <div
      className={`flex flex-col h-full min-h-0 min-w-0 flex-1 w-full ${className || ""}`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center pb-3 gap-4">
        {search && (
          <div className="relative w-full sm:max-w-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-foreground z-10">
              <Search fontSize="small" />
            </div>
            <AppInputText
              type="text"
              className="pl-10!"
              placeholder={t("labels.grid.search_placeholder")}
              value={searchInput}
              onChange={(e: any) => setSearchInput(e.target.value as string)}
              onBlur={handleSearch}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto ml-auto">
          {hasSelection &&
            selectedRows &&
            selectedRows.length > 0 &&
            !hideSelectionCount && (
              <span className="font-medium text-sm whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-200">
                {selectedRows.length}{" "}
                {selectedRows.length === 1
                  ? t("labels.grid.item_selected_singular")
                  : t("labels.grid.item_selected_plural")}
              </span>
            )}
          <div className="flex gap-3 w-full sm:w-auto">
            {hasSelection &&
              selectedRows &&
              selectedRows.length > 0 &&
              onDeleteSelected && (
                <AppButton
                  color="red"
                  onClick={onDeleteSelected}
                  className="px-4 shrink-0 w-full sm:w-auto"
                >
                  <DeleteOutlined fontSize="small" />
                  {t("labels.all.delete")}
                </AppButton>
              )}
            {filter}

            {onNew && (
              <AppButton
                color="primary"
                onClick={onNew}
                className="px-4 py-2 shrink-0 w-full sm:w-auto"
              >
                <Add fontSize="small" />
                {t("labels.grid.add_item")}
              </AppButton>
            )}
          </div>
        </div>
      </div>
      <div className="overflow-auto flex-1 min-h-0 min-w-0 w-full flex flex-col">
        {!hasStartedLoading || (loading && items.length === 0) ? (
          delayedLoading ? (
            <div className="flex justify-center items-center h-full flex-1">
              <AppLoading className="p-10" />
            </div>
          ) : (
            <div className="h-full w-full flex-1" />
          )
        ) : (
          <div className="flex flex-col flex-1">
            <table
              className="table-fixed max-w-none border-separate border-spacing-0"
              style={{
                width: "100%",
                minWidth:
                  items.length > 0 && tableWidth > 0 ? tableWidth : "100%",
              }}
            >
              <thead className="text-sm font-semibold sticky top-0 z-20 text-foreground">
                <tr>
                  {hasSelection && (
                    <th className="font-semibold border-border border-y border-r first:border-l first:rounded-tl-md! p-2 text-center sticky left-0 z-30 bg-background-3 w-12">
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
                      className={`font-semibold border-border border-y border-r ${!hasSelection ? "first:border-l first:rounded-tl-md!" : ""} p-2 text-left relative overflow-hidden bg-background-3 ${resizingIndex === index ? "text-primary-3 dark:text-primary" : ""}`}
                      style={{ width: colWidths[index] || col.size || 140 }}
                    >
                      {col.column}
                      {items.length > 0 && (
                        <div
                          onMouseDown={(e) => handleMouseDown(e, index)}
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize z-10"
                        />
                      )}
                    </th>
                  ))}
                  <th
                    className={`font-semibold bg-background-3 border-y border-border ${!actions || items.length === 0 ? "rounded-tr-md! border-r" : ""}`}
                  ></th>
                  {actions && items.length > 0 && (
                    <th className="font-semibold border-border border-y border-l border-r p-2 text-center bg-background-3 sticky right-0 z-30 w-12 rounded-tr-md!"></th>
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
                    const isPrevSelected =
                      selected &&
                      rowIndex > 0 &&
                      isSelected(items[rowIndex - 1]);
                    const isNextSelected =
                      selected &&
                      rowIndex < items.length - 1 &&
                      isSelected(items[rowIndex + 1]);
                    return (
                      <tr
                        key={rowIndex}
                        className={`group hover:bg-background-3 transition-colors ${selected ? "bg-primary-4 hover:bg-primary-4" : ""}`}
                      >
                        {hasSelection && (
                          <td
                            className={`p-2 w-12 border-r first:border-l border-b sticky left-0 z-10 text-center transition-colors ${
                              selected
                                ? `bg-primary-4 group-hover:bg-primary-4 border-border ${isNextSelected ? "border-b-border" : "border-b-primary-3"} border-l-primary-3 ${!isPrevSelected ? "shadow-[inset_0_1px_0_0_var(--primary-3)]" : ""}`
                                : "bg-background group-hover:bg-background-3 border-border"
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
                            className={`p-3 overflow-hidden border-r border-b ${!hasSelection ? "first:border-l" : ""} ${
                              selected
                                ? `border-border ${isNextSelected ? "border-b-border" : "border-b-primary-3"} ${!isPrevSelected ? "shadow-[inset_0_1px_0_0_var(--primary-3)]" : ""} ${!hasSelection ? "first:border-l-primary-3" : ""}`
                                : "border-border"
                            } ${resizingIndex === colIndex ? "bg-background-3" : ""}`}
                            style={{
                              width: colWidths[colIndex] || col.size || 140,
                            }}
                          >
                            {col.cell({ row })}
                          </td>
                        ))}
                        <td
                          className={`border-b ${!actions ? "border-r" : ""} ${
                            selected
                              ? `border-border ${isNextSelected ? "border-b-border" : "border-b-primary-3"} ${!isPrevSelected ? "shadow-[inset_0_1px_0_0_var(--primary-3)]" : ""} ${!actions ? "border-r-primary-3" : ""}`
                              : "border-border"
                          }`}
                        ></td>
                        {actions && (
                          <td
                            className={`p-2 border-l border-r border-b text-center w-12 sticky right-0 z-10 has-[button[aria-expanded="true"]]:z-50 transition-colors ${
                              selected
                                ? `bg-primary-4 group-hover:bg-primary-4 border-border ${isNextSelected ? "border-b-border" : "border-b-primary-3"} border-r-primary-3 ${!isPrevSelected ? "shadow-[inset_0_1px_0_0_var(--primary-3)]" : ""}`
                                : "bg-background group-hover:bg-background-3 border-border"
                            }`}
                          >
                            <AppActions item={row} actions={actions} />
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              )}
            </table>
            {items.length === 0 && (
              <AppEmptyState className="flex-1 p-14 border-x border-b border-border rounded-t-none bg-background-2 dark:bg-background" />
            )}
          </div>
        )}
      </div>
      <AppPagination pagination={pagination} />
    </div>
  );
}
