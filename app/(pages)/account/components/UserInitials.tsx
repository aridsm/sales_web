import React, { useState, useEffect } from "react";
import { getImageUrl } from "@/app/utils/image";
import { getUserInitials, getUserColor } from "@/app/utils/user";

interface UserInitialsProps {
  name: string;
  imageUrl?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "colored" | "primary-soft" | "primary";
}

export default function UserInitials({
  name,
  imageUrl,
  className = "",
  size = "md",
  variant = "colored",
}: UserInitialsProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const initials = getUserInitials(name);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 sm:w-11 sm:h-11 text-base",
    lg: "w-14 h-14 sm:w-14 sm:h-14 text-lg sm:text-xl",
    xl: "w-18 h-18 text-2xl font-bold",
  }[size];

  const resolvedUrl = getImageUrl(imageUrl);

  if (resolvedUrl && !imageError) {
    return (
      <div
        className={`${sizeClasses} rounded-full overflow-hidden shrink-0 border border-border bg-background-3 ${className}`}
      >
        <img
          src={resolvedUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  const colorClass =
    variant === "primary-soft"
      ? "bg-primary/10 text-primary"
      : variant === "primary"
        ? "bg-primary-3 text-white"
        : getUserColor(name);

  return (
    <div
      className={`${sizeClasses} rounded-full ${colorClass} flex items-center justify-center font-semibold shrink-0 shadow-xs animate-in fade-in duration-200 select-none ${className}`}
    >
      {initials}
    </div>
  );
}
