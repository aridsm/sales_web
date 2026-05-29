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
    removeValue,
    getSelectedNames,
  } = useAppSelect<T>();

  return (
    <div
      onClick={toggleDropdown}
      className={`
        input-field min-h-12! h-auto! py-2 cursor-pointer flex items-center justify-between gap-2 transition-all duration-200
        ${disabled ? "bg-background-2 cursor-not-allowed opacity-60" : ""}
        ${error ? "border-red-500 ring-1 ring-red-500" : "border-border hover:border-primary/50"}
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
                className="bg-primary/10 text-primary dark:text-foreground dark:bg-foreground/5 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 animate-in fade-in zoom-in duration-200"
              >
                {opt ? opt.name : `ID: ${v}`}
                <CloseIcon
                  className="w-3 h-3 cursor-pointer hover:text-primary-dark"
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
      <ChevronLeft
        className={`text-foreground/40 transition-all! duration-200 ${isOpen ? "-rotate-90" : "rotate-0"}`}
      />
    </div>
  );
}
