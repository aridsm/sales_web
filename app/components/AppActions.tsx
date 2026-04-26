"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { MoreVert } from "@mui/icons-material";

export interface ActionItem<T> {
  text: string;
  class?: string;
  preText?: ReactNode;
  click: (item: T) => void;
  disabled?: (item: T) => boolean;
}

export interface AppActionsProps<T> {
  item: T;
  actions: ActionItem<T>[];
  className?: string;
}

export default function AppActions<T>({ item, actions, className = "" }: AppActionsProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className} ${isOpen ? "z-50" : ""}`} ref={containerRef}>
      <button
        onClick={toggleDropdown}
        className={`
          flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 cursor-pointer
          hover:bg-primary/10 hover:text-primary
          ${isOpen ? "bg-primary/10 text-primary" : ""}
        `}
        aria-label="Ações"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <MoreVert fontSize="small" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-80 mt-1 w-56 origin-top-right rounded-sm bg-background-2 border border-slate-200 shadow-xl py-1 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200"
          role="menu"
        >
          {actions.map((action, index) => {
            const isDisabled = action.disabled ? action.disabled(item) : false;

            return (
              <button
                key={index}
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) {
                    action.click(item);
                    setIsOpen(false);
                  }
                }}
                className={`
                  w-full flex items-center px-4 py-2.5 transition-colors text-left
                  ${isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : " hover:bg-slate-50 cursor-pointer active:bg-slate-100"}
                  ${action.class || ""}
                `}
                role="menuitem"
              >
                {action.preText && (
                  <span className={`mr-3 flex items-center shrink-0 ${isDisabled ? "opacity-50" : ""}`}>
                    {action.preText}
                  </span>
                )}
                <span className="truncate">{action.text}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
