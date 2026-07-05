"use client";

import AppDate from "./AppDate";
import AppLabel from "../AppLabel";

export interface AppDateRangeValue {
  start?: string;
  end?: string;
}

interface AppDateRangeProps {
  value?: AppDateRangeValue;
  error?: string;
  label?: string;
  onChange?: (value: AppDateRangeValue) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function AppDateRange({
  value,
  error,
  label,
  onChange,
  onBlur,
  disabled,
  className = "",
}: AppDateRangeProps) {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && <AppLabel>{label}</AppLabel>}
      <div className="flex gap-2 items-center">
        <AppDate
          value={value?.start}
          onChange={(val) => {
            if (!val) {
              onChange?.({ ...value, start: val });
              return;
            }
            const date = new Date(val);
            date.setHours(0, 0, 0, 0);
            onChange?.({ ...value, start: date.toISOString() });
          }}
          onBlur={onBlur}
          disabled={disabled}
        />
        <span className="text-label">-</span>
        <AppDate
          value={value?.end}
          onChange={(val) => {
            if (!val) {
              onChange?.({ ...value, end: val });
              return;
            }
            const date = new Date(val);
            date.setHours(23, 59, 59, 999);
            onChange?.({ ...value, end: date.toISOString() });
          }}
          onBlur={onBlur}
          disabled={disabled}
        />
      </div>
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
}
