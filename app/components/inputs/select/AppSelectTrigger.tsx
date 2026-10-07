"use client";

import { ChevronLeft, Close as CloseIcon } from "@mui/icons-material";
import React from "react";
import { useAppSelect, SelectOption } from "./AppSelectContext";

export default function AppSelectTrigger<T extends SelectOption>() {
  const {
    toggleDropdown,
    disabled,
    error,
    isOpen,
    multiple,
    value,
    items,
    clearable,
    removeValue,
    getSelectedNames,
    onChange,
  } = useAppSelect<T>();

  const hasMultipleTags =
    multiple &&
    (Array.isArray(value)
      ? value.length > 0
      : value !== undefined && value !== null && value !== "");

  return (
    <div
      onClick={toggleDropdown}
      className={`
        input-field ${hasMultipleTags ? "min-h-10! h-auto! py-1.5" : "h-10!"} px-3 sm:px-3.5 cursor-pointer flex items-center justify-between gap-2 transition-all duration-200
        ${disabled ? "bg-background-2 cursor-not-allowed opacity-60" : ""}
        ${error ? "border-red-500 ring-1 ring-red-500" : isOpen ? "border-primary" : "border-border hover:border-primary/50"}
        ${isOpen && !error ? "active" : ""}
      `}
    >
      <div className="flex flex-wrap gap-1 items-center flex-1 overflow-hidden">
        {multiple &&
        (Array.isArray(value)
          ? value.length > 0
          : value !== undefined && value !== null && value !== "") ? (
          (Array.isArray(value) ? value : [value]).map((v) => {
            const opt = items.find((o) => o.id === v);
            return (
              <span
                key={v as React.Key}
                className="bg-primary/10 text-primary dark:text-foreground dark:bg-foreground/5 px-2 py-0.5 rounded-full flex items-center gap-1 animate-in fade-in zoom-in duration-200"
              >
                {opt ? opt.name : `ID: ${v}`}
                <CloseIcon
                  className="w-3 h-3 cursor-pointer hover:text-primary-hover"
                  onClick={(e) => removeValue(e, v!)}
                  style={{ fontSize: "14px" }}
                />
              </span>
            );
          })
        ) : (
          <span
            className={`truncate ${(!value && value !== 0) || (Array.isArray(value) && value.length === 0) ? "text-foreground/40" : ""}`}
          >
            {getSelectedNames()}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {clearable &&
          value !== undefined &&
          value !== null &&
          value !== "" &&
          (!Array.isArray(value) || value.length > 0) &&
          !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.(multiple ? ([] as any) : (undefined as any));
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              tabIndex={-1}
            >
              <CloseIcon style={{ fontSize: 16 }} />
            </button>
          )}
        <ChevronLeft
          className={`text-foreground/40 transition-all! duration-200 ${isOpen ? "-rotate-90" : "rotate-0"}`}
        />
      </div>
    </div>
  );
}
