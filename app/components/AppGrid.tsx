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
}

export default function AppGrid<T>({ columns, pagination, onNew, selectedRows, onSelectedChange, onDeleteSelected, actions, filter }: AppGridProps<T>) {
  const { items, loading, load } = pagination;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasSelection = selectedRows !== undefined && onSelectedChange !== undefined;

  const isSelected = (row: T) => selectedRows?.some(r => r === row || (r as any).id === (row as any).id);

  function handleSelectRow(row: T, checked: boolean) {
    if (!hasSelection) return;
    if (checked) {
      onSelectedChange([...(selectedRows || []), row]);
    } else {
      onSelectedChange((selectedRows || []).filter(r => !(r === row || (r as any).id === (row as any).id)));
    }
  };

  const isAllSelected = items.length > 0 && items.every((item) => isSelected(item));

  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!hasSelection) return;
      if (e.target.checked) {
        const newSelected = [...(selectedRows || [])];
        items.forEach((item) => {
          if (!newSelected.some(r => r === item || (r as any).id === (item as any).id)) {
            newSelected.push(item);
          }
        });
        onSelectedChange(newSelected);
      } else {
        const newSelected = (selectedRows || []).filter(r => !items.some(item => item === r || (item as any).id === (r as any).id));
        onSelectedChange(newSelected);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [searchInput, setSearchInput] = React.useState(() => searchParams.get("search") || "");

  React.useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
  }, [searchParams]);

  function handleSearch() {
    try {
      const newParams = new URLSearchParams(searchParams.toString());
      if (searchInput) {
        newParams.set("search", searchInput);
      } else {
        newParams.delete("search");
      }
      newParams.set("page", "1");
      router.push(`${pathname}?${newParams.toString()}`);
      load({ params: { search: searchInput, page: 1 } });
    } catch (error) {
      console.error(error);
    }
  };

  const [colWidths, setColWidths] = React.useState<number[]>(
    columns.map((c) => c.size || 140)
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
    };

    function handleMouseUp() {
      setResizingIndex(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "e-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };


  const tableWidth = colWidths.reduce((acc, w) => acc + w, 0);

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 flex-1 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center py-3 gap-4">
        <div className="relative w-full sm:max-w-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 z-10">
            <Search fontSize="small" />
          </div>
          <AppInputText
            type="text"
            className="pl-10!"
            placeholder="Buscar..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onBlur={handleSearch}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {hasSelection && selectedRows && selectedRows.length > 0 && (
            <span className="font-medium text-sm whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-200">
              {selectedRows.length} {selectedRows.length === 1 ? "item selecionado" : "itens selecionados"}
            </span>
          )}
          <div className="flex gap-2 w-full sm:w-auto">
            {hasSelection && selectedRows && selectedRows.length > 0 && onDeleteSelected && (
              <AppButton
                color="red"
                onClick={onDeleteSelected}
                className="px-4 shrink-0 w-full sm:w-auto"
              >
                <DeleteOutlined fontSize="small" />
                Excluir
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
                Adicionar item
              </AppButton>
            )}
          </div>
        </div>
      </div>
      <div className="overflow-auto flex-1 min-w-0 w-full">
        <table className="table-fixed max-w-none border-separate border-spacing-0" style={{ width: "100%", minWidth: tableWidth > 0 ? tableWidth : "100%" }}>
          <thead className="uppercase text-xs tracking-wide sticky top-0 z-20 text-foreground">
            <tr>
              {hasSelection && (
                <th className="border-slate-200 border-y border-r first:border-l first:rounded-tl-md! p-2 text-center sticky left-0 z-30 bg-background-3 w-12">
                  <AppCheckbox
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`border-slate-200 border-y border-r ${!hasSelection ? "first:border-l first:rounded-tl-md!" : ""} p-2 text-left relative overflow-hidden bg-background-3 ${resizingIndex === index ? "text-primary" : ""}`}
                  style={{ width: colWidths[index] || col.size || 140 }}
                >
                  {col.column}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, index)}
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize z-10"
                  />
                </th>
              ))}
              <th className={`bg-background-3 border-y border-slate-200 ${!actions ? "rounded-tr-md! border-r" : ""}`}></th>
              {actions && (
                <th className="border-slate-200 border-y border-l border-r p-2 text-center bg-background-3 sticky right-0 z-30 w-12 rounded-tr-md!">
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (hasSelection ? 1 : 0) + (actions ? 1 : 0) + 1} className="p-4 text-center border-x border-slate-200">
                  Carregando...
                </td>
              </tr>
            ) : (
              items.map((row: T, rowIndex: number) => {
                const selected = isSelected(row);
                return (
                  <tr key={rowIndex} className={`group hover:bg-background-3 transition-colors ${selected ? "bg-background-3" : ""}`}>
                    {hasSelection && (
                      <td className={`p-2 w-12 border-r border-slate-200 first:border-l border-b sticky left-0 z-10 text-center transition-colors ${selected ? 'bg-background-3' : 'bg-background'} group-hover:bg-background-3`}>
                        <AppCheckbox
                          checked={selected}
                          onChange={(e) => handleSelectRow(row, e.target.checked)}
                        />
                      </td>
                    )}
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className={`p-3 overflow-hidden border-r border-slate-200 ${!hasSelection ? "first:border-l" : ""} border-b ${rowIndex === items.length - 1 ? "" : "border-b"} ${resizingIndex === colIndex ? "bg-background-3" : ""}`}
                        style={{ width: colWidths[colIndex] || col.size || 140 }}
                      >
                        {col.cell({ row })}
                      </td>
                    ))}
                    <td className={`border-b border-slate-200 ${!actions ? "border-r" : ""}`}></td>
                    {actions && (
                      <td className={`p-2 border-l border-r border-slate-200 border-b text-center w-12 sticky right-0 z-10 has-[button[aria-expanded="true"]]:z-50 transition-colors ${selected ? 'bg-background-3' : 'bg-background'} group-hover:bg-background-3`}>
                        <AppActions item={row} actions={actions} />
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <AppPagination pagination={pagination} />
    </div>
  );
}
