"use client";

import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import AppLabel from "../AppLabel";
import { ChevronLeft } from "@mui/icons-material";
import CheckIcon from "@mui/icons-material/Check";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

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
  value?: any;
  onChange?: (value: any) => void;
  className?: string;
  size?: "default" | "small";
  triggerTemplate?: (selectedOption: any) => React.ReactNode;
}

const AppSelect = forwardRef<HTMLDivElement, AppSelectProps>(
  (
    {
      label,
      options = [],
      error,
      search = false,
      multiple = false,
      placeholder = "Selecione...",
      disabled = false,
      value,
      onChange,
      className = "",
      size = "default",
      triggerTemplate,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    const toggleDropdown = () => {
      if (!disabled) setIsOpen(!isOpen);
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
      if (isOpen && search && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, search]);

    const filteredOptions = options.filter((option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleSelect = (option: AppSelectOption) => {
      if (multiple) {
        const currentValues = Array.isArray(value)
          ? value
          : value !== undefined && value !== null
            ? [value]
            : [];
        const isSelected = currentValues.includes(option.id);
        const newValues = isSelected
          ? currentValues.filter((v: any) => v !== option.id)
          : [...currentValues, option.id];
        onChange?.(newValues);
      } else {
        onChange?.(option.id);
        setIsOpen(false);
      }
    };

    const getSelectedNames = () => {
      if (multiple) {
        const currentValues = Array.isArray(value)
          ? value
          : value !== undefined && value !== null
            ? [value]
            : [];
        if (currentValues.length === 0) return placeholder;
        const names = options
          .filter((opt) => currentValues.includes(opt.id))
          .map((opt) => opt.name);
        return names.join(", ");
      } else {
        const selected = options.find((opt) => opt.id === value);
        return selected ? selected.name : placeholder;
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

    const removeValue = (e: React.MouseEvent, id: any) => {
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
      <div
        className={`flex flex-col gap-1 w-full ${className}`}
        ref={containerRef}
      >
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
                        onClick={(e) => removeValue(e, v)}
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
            <ChevronLeft
              className={`text-foreground/40 transition-all! duration-200 ${isOpen ? "-rotate-90" : "rotate-0"} ${size === "small" ? "w-4! h-4!" : ""}`}
            />
          </div>
          )}

          {isOpen && (
            <div className="absolute z-50 w-full min-w-max mt-1 bg-background-2 border border-border rounded-md shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
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
                    placeholder="Pesquisar..."
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
                        className={` cursor-pointer flex items-center justify-between transition-colors ${size === "small" ? "text-sm px-2 py-2" : "px-3 py-3"} ${isSelected ? "bg-primary/6 text-primary dark:text-foreground dark:bg-foreground/5" : "text-label hover:bg-primary/6 dark:hover:bg-foreground/5"}`}
                      >
                        <span className="truncate pr-4">{option.name}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-3 py-4 text-center text-foreground/40 text-sm italic">
                    Nenhum resultado encontrado
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  },
);

AppSelect.displayName = "AppSelect";

export default AppSelect;
