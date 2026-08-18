"use client";

import { useTranslation } from "@/app/utils/i18n";
import { ArrowForwardOutlined, InventoryOutlined } from "@mui/icons-material";

export default function SalePage() {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:flex flex-1 items-center justify-center h-full text-label border border-border rounded-xl bg-background-2 dark:bg-background-3 border-dashed">
      <div className="flex flex-col items-center gap-3">
        <InventoryOutlined style={{ fontSize: 48 }} className="opacity-30" />
        <span className="text-sm font-medium">{t("labels.sales.title")}</span>
        <span className="flex items-center gap-1.5 text-xs opacity-70">
          <ArrowForwardOutlined style={{ fontSize: 14 }} />
          {t("labels.sales.detail.select_sale")}
        </span>
      </div>
    </div>
  );
}
