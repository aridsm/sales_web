"use client";

import AppInputText from "./AppInputText";
import AppLabel from "../AppLabel";
import { currencyFormatter } from "../../utils/formatters/currency";

export interface AppAmountRangeValue {
  start?: number;
  end?: number;
}

interface AppAmountRangeProps {
  value?: AppAmountRangeValue;
  error?: string;
  label?: string;
  placeholderStart?: string;
  placeholderEnd?: string;
  onChange?: (value: AppAmountRangeValue) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function AppAmountRange({
  value,
  error,
  label,
  placeholderStart = "Min",
  placeholderEnd = "Max",
  onChange,
  onBlur,
  disabled,
  className = "",
}: AppAmountRangeProps) {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && <AppLabel>{label}</AppLabel>}
      <div className="flex gap-2 items-center">
        <div className="flex-1 min-w-0">
          <AppInputText
            value={value?.start ?? ""}
            placeholder={placeholderStart}
            onChange={(e) => {
              const val = e.target.value as number | undefined;
              onChange?.({ ...value, start: val });
            }}
            onBlur={onBlur}
            disabled={disabled}
            mask={currencyFormatter as any}
          />
        </div>
        <span className="text-label shrink-0">-</span>
        <div className="flex-1 min-w-0">
          <AppInputText
            value={value?.end ?? ""}
            placeholder={placeholderEnd}
            onChange={(e) => {
              const val = e.target.value as number | undefined;
              onChange?.({ ...value, end: val });
            }}
            onBlur={onBlur}
            disabled={disabled}
            mask={currencyFormatter as any}
          />
        </div>
      </div>
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
}
