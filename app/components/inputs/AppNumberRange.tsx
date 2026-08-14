"use client";

import AppInputText from "./AppInputText";
import AppLabel from "../AppLabel";

export interface AppNumberRangeValue {
  start?: number;
  end?: number;
}

interface AppNumberRangeProps {
  value?: AppNumberRangeValue;
  error?: string;
  label?: string;
  placeholderStart?: string;
  placeholderEnd?: string;
  onChange?: (value: AppNumberRangeValue) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function AppNumberRange({
  value,
  error,
  label,
  placeholderStart = "Min",
  placeholderEnd = "Max",
  onChange,
  onBlur,
  disabled,
  className = "",
}: AppNumberRangeProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && <AppLabel>{label}</AppLabel>}
      <div className="flex gap-2 items-center">
        <div className="flex-1 min-w-0">
          <AppInputText
            type="number"
            value={value?.start ?? ""}
            placeholder={placeholderStart}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              onChange?.({ ...value, start: val });
            }}
            onBlur={onBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
        </div>
        <span className="text-label shrink-0">-</span>
        <div className="flex-1 min-w-0">
          <AppInputText
            type="number"
            value={value?.end ?? ""}
            placeholder={placeholderEnd}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              onChange?.({ ...value, end: val });
            }}
            onBlur={onBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
        </div>
      </div>
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
}
