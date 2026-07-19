"use client";

import { useState, useRef, ReactNode, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVert } from "@mui/icons-material";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

export default function AppActions<T>({
  item,
  actions,
  className = "",
}: AppActionsProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateCoords = (isOpening: boolean | Event = false) => {
    if (!buttonRef.current) return;
    const buttonRect = buttonRef.current.getBoundingClientRect();

    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    let menuWidth = 224;
    let menuHeight = actions.length * 44 + 10;

    const opening = typeof isOpening === "boolean" ? isOpening : false;
    if (!opening && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      menuWidth = rect.width || menuWidth;
      menuHeight = rect.height || menuHeight;
    }

    let left = buttonRect.right - menuWidth;
    if (left + menuWidth > viewportWidth - 12) {
      left = viewportWidth - menuWidth - 12;
    }
    if (left < 12) {
      left = 12;
    }

    let top = buttonRect.bottom + 4;
    if (top + menuHeight > viewportHeight - 12) {
      const topAbove = buttonRect.top - menuHeight - 4;
      if (topAbove >= 12) {
        top = topAbove;
      } else {
        top = Math.max(12, viewportHeight - menuHeight - 12);
      }
    }

    setCoords({ top, left });
  };

  function toggleDropdown() {
    if (!isOpen) {
      updateCoords(true);
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setCoords(null);
    }
  }

  useIsomorphicLayoutEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("resize", updateCoords);
      window.addEventListener("scroll", updateCoords, { capture: true });
    } else {
      setCoords(null);
    }
    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, { capture: true });
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
      setCoords(null);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [isOpen]);

  return (
    <div
      className={`relative inline-block ${className} ${isOpen ? "z-50" : ""}`}
      ref={containerRef}
    >
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className={`
          flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 cursor-pointer
          hover:bg-primary/10 hover:text-primary dark:hover:bg-foreground/10 dark:hover:text-foreground
          ${isOpen ? "bg-primary/10 text-primary dark:bg-foreground/10 dark:text-foreground" : ""}
        `}
        aria-label="Ações"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <MoreVert fontSize="small" />
      </button>

      {isOpen &&
        coords &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            className="z-[9999] w-56 rounded-md bg-background-2 border border-border shadow-xl py-1 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200"
            role="menu"
          >
            {actions.map((action, index) => {
              const isDisabled = action.disabled
                ? action.disabled(item)
                : false;

              return (
                <button
                  key={index}
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) {
                      action.click(item);
                      setIsOpen(false);
                      setCoords(null);
                    }
                  }}
                  className={`
                  w-full flex items-center px-4 py-2.5 transition-colors text-left
                  ${
                    isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-background-3 dark:hover:bg-foreground/10 cursor-pointer active:bg-slate-100"
                  }
                  ${action.class || ""}
                `}
                  role="menuitem"
                >
                  {action.preText && (
                    <span
                      className={`mr-3 flex items-center shrink-0 ${isDisabled ? "opacity-50" : ""}`}
                    >
                      {action.preText}
                    </span>
                  )}
                  <span className="truncate">{action.text}</span>
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}
