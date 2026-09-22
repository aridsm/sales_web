import React from "react";
import { formatCreatedBy } from "@/app/utils/formatters/date";
import { getUserInitials, getUserColor } from "@/app/utils/user";

interface AppCreatedByProps {
  name?: string | null;
  date?: string | Date | null;
  email?: string | null;
  avatarSize?: "sm" | "md";
  className?: string;
}

export default function AppCreatedBy({
  name,
  date,
  email,
  avatarSize = "sm",
  className = "",
}: AppCreatedByProps) {
  const avatarIdentifier = name || email;
  const sizeClasses =
    avatarSize === "sm"
      ? "w-8 h-8 text-xs"
      : "w-9 h-9 text-sm";

  return (
    <div className={`flex items-center gap-2.5 py-0.5 min-w-0 ${className}`}>
      <div
        className={`${sizeClasses} rounded-full flex items-center justify-center font-bold shrink-0 select-none shadow-xs ${getUserColor(avatarIdentifier)}`}
      >
        {getUserInitials(avatarIdentifier)}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span
          className="text-sm text-foreground font-medium truncate"
          title={formatCreatedBy(name, date)}
        >
          {formatCreatedBy(name, date)}
        </span>
        {email && (
          <span className="text-[13px] text-label truncate" title={email}>
            {email}
          </span>
        )}
      </div>
    </div>
  );
}
