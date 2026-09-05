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
      ? "w-7 h-7 text-[11px]"
      : "w-8 h-8 text-xs";

  return (
    <div className={`flex items-center gap-2.5 py-0.5 min-w-0 ${className}`}>
      <div
        className={`${sizeClasses} rounded-full flex items-center justify-center font-bold shrink-0 select-none shadow-xs ${getUserColor(avatarIdentifier)}`}
      >
        {getUserInitials(avatarIdentifier)}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-foreground font-medium whitespace-nowrap">
          {formatCreatedBy(name, date)}
        </span>
        {email && (
          <span className="text-xs text-label whitespace-nowrap">
            {email}
          </span>
        )}
      </div>
    </div>
  );
}
