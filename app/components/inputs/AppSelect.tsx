"use client";

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { createPortal } from "react-dom";
import AppLabel from "../AppLabel";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
import { ChevronLeft } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "@/app/utils/i18n";

export interface AppSelectOption {
  id: string | number;
  name: string;
}

export interface AppSelectProps {
  label?: string;
  options: AppSelectOption[];
  error?: string;
  search?: boolean;
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  value?: AppSelectOption["id"] | AppSelectOption["id"][];
  clearable?: boolean;
  onChange?: (value: AppSelectOption["id"] | AppSelectOption["id"][]) => void;
  className?: string;
  size?: "default" | "small";
  triggerTemplate?: (selectedOption: AppSelectOption | AppSelectOption[] | null) => React.ReactNode;
}

const AppSelect = forwardRef<HTMLDivElement, AppSelectProps>(
  (
    {
      label,
      options = [],
      error,
      search = false,
      multiple = false,
      placeholder,
      disabled = false,
      value,
      clearable = false,
      onChange,
      className = "",
      size = "default",
      triggerTemplate,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const effectivePlaceholder = placeholder ?? t("labels.select.placeholder");
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number; isAbove: boolean } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter((option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const updateCoords = () => {
      if (!containerRef.current) return;
      const parentRect = containerRef.current.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;

      const menuWidth = parentRect.width;
      let menuHeight = filteredOptions.length * 40 + (search ? 48 : 0) + 8;
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
    }, [isOpen, filteredOptions.length]);

    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    const toggleDropdown = () => {
      if (!disabled) {
        if (!isOpen) {
          updateCoords();
          setIsOpen(true);
        } else {
          setIsOpen(false);
          setCoords(null);
        }
      }
    };

    useEffect(() => {
      if (!isOpen) return;

      const listener = (event: MouseEvent | TouchEvent) => {
        const target = event.target as HTMLElement;
        if (
          containerRef.current?.contains(target) ||
          dropdownRef.current?.contains(target) ||
          target.closest?.("[data-portal]")
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

    useEffect(() => {
      if (isOpen && search && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, search]);

    const handleSelect = (option: AppSelectOption) => {
      if (multiple) {
        const currentValues = Array.isArray(value)
          ? value
          : value !== undefined && value !== null
            ? [value]
            : [];
        const isSelected = currentValues.includes(option.id);
        const newValues = isSelected
          ? currentValues.filter((v: AppSelectOption["id"]) => v !== option.id)
          : [...currentValues, option.id];
        onChange?.(newValues);
      } else {
        onChange?.(option.id);
        setIsOpen(false);
        setCoords(null);
      }
    };

    const getSelectedNames = () => {
      if (multiple) {
        const currentValues = Array.isArray(value)
          ? value
          : value !== undefined && value !== null
            ? [value]
            : [];
        if (currentValues.length === 0) return effectivePlaceholder;
        const names = options
          .filter((opt) => currentValues.includes(opt.id))
          .map((opt) => opt.name);
        return names.join(", ");
      } else {
        const selected = options.find((opt) => opt.id === value);
        return selected ? selected.name : effectivePlaceholder;
      }
    };

    const getSelectedOptionsForTemplate = () => {
      if (multiple) {
        const currentValues = Array.isArray(value)
          ? value
          : value !== undefined && value !== null
            ? [value]
            : [];
        return options.filter((opt) => currentValues.includes(opt.id));
      } else {
        return options.find((opt) => opt.id === value) || null;
      }
    };

    const removeValue = (e: React.MouseEvent, id: AppSelectOption["id"]) => {
      e.stopPropagation();
      if (multiple) {
        const currentValues = Array.isArray(value)
          ? value
          : value !== undefined && value !== null
            ? [value]
            : [];
        onChange?.(currentValues.filter((v) => v !== id));
      }
    };

    return (
      <div className={`flex flex-col gap-1 ${className}`} ref={containerRef}>
        {label && <AppLabel htmlFor={label}>{label}</AppLabel>}
        <div className="relative">
          {triggerTemplate ? (
            <div
              onClick={toggleDropdown}
              className={`cursor-pointer transition-all duration-200 ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {triggerTemplate(getSelectedOptionsForTemplate())}
            </div>
          ) : (
            <div
              onClick={toggleDropdown}
              className={`
                             input-field cursor-pointer flex items-center justify-between transition-all duration-200
                            ${size === "small" ? "h-8! px-1.5! text-xs! gap-1" : "gap-2"}
                            ${disabled ? "bg-slate-100 cursor-not-allowed opacity-60" : ""}
                            ${error ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"}
                            ${isOpen && !error ? "active" : ""}
                        `}
            >
              <div className="flex flex-wrap gap-1 items-center flex-1 overflow-hidden">
                {multiple &&
                (Array.isArray(value)
                  ? value.length > 0
                  : value !== undefined && value !== null && value !== "") ? (
                  (Array.isArray(value) ? value : [value]).map((v) => {
                    const opt = options.find((o) => o.id === v);
                    if (!opt) return null;
                    return (
                      <span
                        key={v}
                        className="bg-primary/10 text-primary dark:text-foreground dark:bg-foreground/5 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 animate-in fade-in zoom-in duration-200"
                      >
                        {opt.name}
                        <CloseIcon
                          className="w-3 h-3 cursor-pointer hover:text-primary-dark"
                          onClick={(e) => removeValue(e, v as string | number)}
                          style={{ fontSize: "14px" }}
                        />
                      </span>
                    );
                  })
                ) : (
                  <span
                    className={`${size === "small" ? "" : "truncate"} ${(!value && value !== 0) || (Array.isArray(value) && value.length === 0) ? "text-foreground/40" : ""}`}
                  >
                    {getSelectedNames()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {clearable && (value !== undefined && value !== null && value !== "") && (!Array.isArray(value) || value.length > 0) && !disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange?.(multiple ? [] : undefined as any);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    tabIndex={-1}
                  >
                    <CloseIcon style={{ fontSize: size === "small" ? 14 : 16 }} />
                  </button>
                )}
                <ChevronLeft
                  className={`text-foreground/40 transition-all! duration-200 ${isOpen ? "-rotate-90" : "rotate-0"} ${size === "small" ? "w-4! h-4!" : ""}`}
                />
              </div>
            </div>
          )}

          {isOpen && coords && typeof window !== "undefined" && createPortal(
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
              role="menu"
            >
              {search && (
                <div className="px-3 border-b border-slate-100 flex items-center gap-2 sticky top-0 bg-background-2 z-10">
                  <SearchIcon
                    className="text-slate-400"
                    style={{ fontSize: "20px" }}
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="w-full outline-none border-none transition-all py-3"
                    placeholder={t("labels.select.search_placeholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              <div className="max-h-60 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => {
                    const isSelected = multiple
                      ? Array.isArray(value)
                        ? value.includes(option.id)
                        : value === option.id
                      : value === option.id;

                    return (
                      <div
                        key={option.id}
                        onClick={() => handleSelect(option)}
                        className={` cursor-pointer flex items-center justify-between transition-colors ${size === "small" ? "text-sm px-2 py-2" : "px-3 py-3"} ${isSelected ? "bg-foreground/5 text-foreground" : "text-label hover:bg-foreground/5"}`}
                      >
                        <span className="truncate pr-4">{option.name}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-3 py-4 text-center text-foreground/40 text-sm italic">
                    {t("labels.select.no_results")}
                  </div>
                )}
              </div>
            </div>,
            document.body
          )}
        </div>
        {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  },
);

AppSelect.displayName = "AppSelect";

export default AppSelect;
