"use client";

import { SearchOutlined } from "@mui/icons-material";
import AppInputText from "./AppInputText";

export interface AppSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AppSearchInput({
  value,
  onChange,
  onSearch,
  placeholder,
  className = "",
}: AppSearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-label z-10">
        <SearchOutlined style={{ fontSize: 18 }} />
      </div>
      <AppInputText
        type="text"
        className="pl-10!"
        placeholder={placeholder}
        value={value}
        onChange={(e: any) => onChange(e.target.value as string)}
        onBlur={() => onSearch?.(value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSearch?.(value);
          }
        }}
      />
    </div>
  );
}
