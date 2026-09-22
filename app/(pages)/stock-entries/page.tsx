"use client";

import { useTranslation } from "@/app/utils/i18n";
import { ArrowForwardOutlined, LocalShippingOutlined } from "@mui/icons-material";

export default function StockEntryPage() {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:flex flex-1 items-center justify-center h-full text-label border border-border rounded-xs bg-background-2 dark:bg-background-3 border-dashed">
      <div className="flex flex-col items-center gap-3">
        <LocalShippingOutlined style={{ fontSize: 48 }} className="opacity-30" />
        <span className="text-sm font-medium">{t("labels.stock_entries.title")}</span>
        <span className="flex items-center gap-1.5 text-xs opacity-70">
          <ArrowForwardOutlined style={{ fontSize: 14 }} />
          {t("labels.stock_entries.detail.select_entry") || "Selecione uma entrada ao lado para ver os detalhes"}
        </span>
      </div>
    </div>
  );
}
