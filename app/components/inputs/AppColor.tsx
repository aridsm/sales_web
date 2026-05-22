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
import { HexColorPicker } from "react-colorful";

export interface AppColorProps {
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const AppColor = forwardRef<HTMLDivElement, AppColorProps>(
  (
    {
      label,
      error,
      placeholder = "Selecione uma cor...",
      disabled = false,
      value,
      onChange,
      className = "",
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

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

    return (
      <div
        className={`flex flex-col gap-1 w-full ${className}`}
        ref={containerRef}
      >
        {label && <AppLabel htmlFor={label}>{label}</AppLabel>}
        <div className="relative">
          <div
            onClick={toggleDropdown}
            className={`
                             input-field cursor-pointer flex items-center justify-between gap-2 transition-all duration-200
                            ${disabled ? "bg-slate-100 cursor-not-allowed opacity-60" : ""}
                            ${error ? "border-red-500 ring-1 ring-red-500" : "border-slate-300 hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"}
                            ${isOpen && !error ? "active" : ""}
                        `}
          >
            <div className="flex items-center gap-2 flex-1 overflow-hidden">
              {value ? (
                <>
                  <div
                    className="w-4 h-4 rounded-sm border border-border shrink-0"
                    style={{ backgroundColor: value }}
                  />
                  <span className="truncate text-foreground uppercase tracking-wider text-sm">
                    {value}
                  </span>
                </>
              ) : (
                <span className="truncate text-foreground/40">
                  {placeholder}
                </span>
              )}
            </div>
            <ChevronLeft
              className={`text-foreground/40 transition-all! duration-200 ${isOpen ? "-rotate-90" : "rotate-0"}`}
            />
          </div>

          {isOpen && (
            <div className="absolute z-50 mt-1 p-3 bg-background-2 border border-border rounded-sm shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
              <HexColorPicker
                color={value || "#ffffff"}
                onChange={onChange}
                className="w-full! max-w-[200px]!"
              />
              <div className="mt-3 flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border border-border shrink-0"
                  style={{ backgroundColor: value || "#ffffff" }}
                />
                <input
                  type="text"
                  value={value || ""}
                  onChange={(e) => onChange?.(e.target.value)}
                  placeholder="#000000"
                  className="w-full text-xs uppercase outline-none border-b border-border focus:border-primary py-1 bg-transparent text-foreground"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
        </div>
        {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  },
);

AppColor.displayName = "AppColor";

export default AppColor;
