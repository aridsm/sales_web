import React, { useState } from "react";
import { formatCreatedBy } from "@/app/utils/formatters/date";
import { getUserInitials, getUserColor } from "@/app/utils/user";
import { getImageUrl } from "@/app/utils/image";

interface AppCreatedByProps {
  name?: string | null;
  date?: string | Date | null;
  email?: string | null;
  avatarUrl?: string | null;
  imageUrl?: string | null;
  avatarSize?: "sm" | "md";
  className?: string;
}

export default function AppCreatedBy({
  name,
  date,
  email,
  avatarUrl,
  imageUrl,
  avatarSize = "sm",
  className = "",
}: AppCreatedByProps) {
  const [avatarError, setAvatarError] = useState(false);
  const avatarIdentifier = name || email;
  const sizeClasses = avatarSize === "sm" ? "w-8 h-8 text-xs" : "w-9 h-9 text-xs sm:text-sm";
  const resolvedImageUrl = getImageUrl(avatarUrl || imageUrl);

  return (
    <div className={`flex items-center gap-2.5 py-0.5 min-w-0 ${className}`}>
      {resolvedImageUrl && !avatarError ? (
        <div
          className={`${sizeClasses} rounded-full overflow-hidden shrink-0 border border-border bg-background-3 shadow-xs select-none`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedImageUrl}
            alt={avatarIdentifier || "User"}
            onError={() => setAvatarError(true)}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className={`${sizeClasses} rounded-full flex items-center justify-center font-bold shrink-0 select-none shadow-xs ${getUserColor(avatarIdentifier)}`}
        >
          {getUserInitials(avatarIdentifier)}
        </div>
      )}
      <div className="flex flex-col min-w-0 flex-1">
        <span
          className="text-foreground truncate"
          title={formatCreatedBy(name, date)}
        >
          {formatCreatedBy(name, date)}
        </span>
        {email && (
          <span
            className="text-xs md:text-sm text-label truncate"
            title={email}
          >
            {email}
          </span>
        )}
      </div>
    </div>
  );
}
