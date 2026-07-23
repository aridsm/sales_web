"use client";

import { CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useCallback, useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useAppSelect, SelectOption } from "./AppSelectContext";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function AppSelectDropdown<T extends SelectOption>() {
  const {
    listRef,
    loading,
    pageData,
    load,
    multiple,
    value,
    onChange,
    setIsOpen,
    search,
    searchInputRef,
    searchTerm,
    setSearchTerm,
    items,
    containerRef,
  } = useAppSelect<T>();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; isAbove: boolean } | null>(null);

  const updateCoords = () => {
    if (!containerRef?.current) return;
    const parentRect = containerRef.current.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    const menuWidth = parentRect.width;
    let menuHeight = items.length * 40 + (search ? 48 : 0) + 8;
    menuHeight = Math.min(menuHeight, 260);

    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      menuHeight = rect.height || menuHeight;
    }

    let left = parentRect.left;
    if (left + menuWidth > viewportWidth - 12) {
      left = viewportWidth - menuWidth - 12;
    }
    if (left < 12) {
      left = 12;
    }

    let top = parentRect.bottom + 4;
    let isAbove = false;
    if (top + menuHeight > viewportHeight - 12) {
      const topAbove = parentRect.top - menuHeight - 4;
      if (topAbove >= 12) {
        top = topAbove;
        isAbove = true;
      } else {
        top = Math.max(12, viewportHeight - menuHeight - 12);
        isAbove = top < parentRect.top;
      }
    }

    setCoords({ top, left, width: menuWidth, isAbove });
  };

  useIsomorphicLayoutEffect(() => {
    updateCoords();
    window.addEventListener("resize", updateCoords);
    window.addEventListener("scroll", updateCoords, { capture: true });
    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, { capture: true });
    };
  }, [items.length]);

  const handleScroll = useCallback(() => {
    if (!listRef.current || loading || pageData.page >= pageData.total_pages)
      return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      load({ params: { page: pageData.page + 1 }, append: true });
    }
  }, [loading, pageData, load, listRef]);

  const handleSelect = (option: T) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const isSelected = currentValues.includes(option.id as T["id"]);
      const newValues = isSelected
        ? currentValues.filter((v: T["id"]) => v !== option.id)
        : [...currentValues, option.id];
      onChange?.(newValues);
    } else {
      onChange?.(option.id);
      setIsOpen(false);
    }
  };

  if (!coords || typeof window === "undefined") return null;

  return createPortal(
    <div
      ref={dropdownRef}
      data-portal="true"
      style={{
        position: "fixed",
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        width: `${coords.width}px`,
        zIndex: 9999,
      }}
      className={`bg-background-2 border border-border rounded-md shadow-dropdown overflow-hidden ${
        coords.isAbove ? "animate-dropdown-open-above" : "animate-dropdown-open"
      }`}
    >
      {search && (
        <div className="px-3 border-b border-border flex items-center gap-2 sticky top-0 bg-background-2 z-10">
          <SearchIcon
            className="text-foreground"
            style={{ fontSize: "20px" }}
          />
          <input
            ref={searchInputRef}
            type="text"
            className="w-full outline-none border-none transition-all py-3"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="max-h-60 overflow-y-auto"
      >
        {items.length > 0 ? (
          <>
            {items.map((option) => {
              const isSelected = multiple
                ? Array.isArray(value) && value.includes(option.id as T["id"])
                : value === option.id;

              return (
                <div
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className={`
                                                        px-3 py-3 cursor-pointer flex items-center justify-between transition-colors
                                                        ${isSelected ? "bg-foreground/5 text-foreground" : "text-label hover:bg-foreground/5"}
                                                    `}
                >
                  <span className="truncate">{option.name}</span>
                </div>
              );
            })}
            {loading && (
              <div className="p-4 flex justify-center sticky bottom-0 bg-background/80 backdrop-blur-sm">
                <CircularProgress size={24} />
              </div>
            )}
          </>
        ) : (
          <div className="px-3 py-10 text-center text-gray-400 text-sm italic flex flex-col items-center gap-2">
            {loading ? (
              <CircularProgress size={32} />
            ) : (
              "Nenhum resultado encontrado"
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
