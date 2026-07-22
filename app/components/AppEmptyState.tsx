"use client";

import React from "react";
import { InboxOutlined } from "@mui/icons-material";
import { useTranslation } from "@/app/utils/i18n";

interface AppEmptyStateProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function AppEmptyState({
  title,
  subtitle,
  icon,
  className = "",
}: AppEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`flex flex-col items-center justify-center text-label gap-2 bg-transparent rounded-md ${className}`}
    >
      <div className="w-10 h-10 text-primary mb-2 rounded-full bg-primary-light flex items-center justify-center shrink-0">
        {icon || <InboxOutlined fontSize="medium" />}
      </div>
      <span className="font-normal text-foreground">
        {title || t("labels.grid.empty_title")}
      </span>
      {subtitle !== null && (
        <span className="text-sm text-center max-w-xs">
          {subtitle || t("labels.grid.empty_subtitle")}
        </span>
      )}
    </div>
  );
}
