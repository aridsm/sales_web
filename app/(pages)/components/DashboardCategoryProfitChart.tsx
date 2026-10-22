import { useState, useEffect } from "react";
import Link from "next/link";
import AppCard from "../../components/AppCard";
import AppTabs from "../../components/AppTabs";
import AppEmptyState from "../../components/AppEmptyState";
import { useTranslation } from "@/app/utils/i18n";
import { categoriesService } from "@/api/services/CategoryService";
import { CategoryAmount } from "@/api/schemas/Category";
import { CategoryType } from "@/enums/CategoryType";
import { formatCurrency } from "@/app/utils/formatters/currency";
import {
  ShoppingCartOutlined,
  ReceiptOutlined,
  Inventory2Outlined,
} from "@mui/icons-material";

export const DashboardCategoryProfitChart = ({
  startDate,
  endDate,
  activePeriod,
}: {
  startDate: string;
  endDate: string;
  activePeriod: string;
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("sales");
  const [loading, setLoading] = useState<boolean>(true);
  const [categoriesAmounts, setCategoriesAmounts] = useState<CategoryAmount>({
    items: [],
    total: 0,
  });

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    categoriesService
      .getAmounts({
        start_created_at: startDate,
        end_created_at: endDate,
        type: activeTab as unknown as CategoryType,
      })
      .then((res: CategoryAmount) => {
        if (!isCancelled) {
          if (res && Array.isArray(res.items)) {
            const sortedItems = [...res.items].sort(
              (a, b) => b.value - a.value,
            );
            setCategoriesAmounts({ items: sortedItems, total: res.total });
          } else {
            setCategoriesAmounts({ items: [], total: 0 });
          }
        }
      })
      .catch((err) => {
        console.error("Error loading category amounts:", err);
        if (!isCancelled) {
          setCategoriesAmounts({ items: [], total: 0 });
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [startDate, endDate, activeTab]);

  const emptyIcon =
    activeTab === "sales" ? (
      <ShoppingCartOutlined fontSize="medium" />
    ) : activeTab === "stock_entries" ? (
      <Inventory2Outlined fontSize="medium" />
    ) : (
      <ReceiptOutlined fontSize="medium" />
    );

  return (
    <AppCard className="px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:pt-4 lg:pb-4 flex flex-col lg:col-span-5 min-[1580px]:col-span-4 min-h-[360px] lg:min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-2.5 mb-2.5 shrink-0">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span className="font-semibold text-base sm:text-lg text-foreground truncate">
            {activeTab === "sales"
              ? t("labels.dashboard.charts.profit_by_category")
              : activeTab === "stock_entries"
                ? t("labels.dashboard.charts.stock_entries_by_category")
                : t("labels.dashboard.charts.expenses_by_category")}
          </span>
          <span className="px-2 py-0.5 rounded-xs border border-border text-xs font-medium text-foreground-2 shrink-0">
            {t(`labels.dashboard.periods.${activePeriod}`)}
          </span>
        </div>

        <AppTabs
          fullWidth
          className="w-full [&_button]:flex-auto [&_button]:px-1.5 sm:[&_button]:px-2.5 [&_button]:text-xs xl:[&_button]:text-sm"
          tabs={[
            {
              value: "sales",
              label: t("labels.dashboard.charts.sales_tab"),
            },
            {
              value: "stock_entries",
              label: t("labels.dashboard.charts.stock_entries_tab"),
            },
            {
              value: "other_expenses",
              label: t("labels.dashboard.charts.other_expenses_tab"),
            },
          ]}
          activeTab={activeTab}
          onChange={(val) => setActiveTab(val)}
        />
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col min-h-0">
        {loading ? (
          <div className="flex-1 flex flex-col justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-10 rounded-xs bg-border/30 animate-pulse w-full"
              />
            ))}
          </div>
        ) : categoriesAmounts.items.length === 0 ? (
          <AppEmptyState
            className="flex-1 w-full border border-border bg-background-2 dark:bg-background rounded-xs my-auto py-6"
            title={t("labels.grid.empty_title")}
            subtitle={t("labels.dashboard.charts.no_data")}
            icon={emptyIcon}
          />
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Rows */}
            <div className="flex-1 flex flex-col gap-1 overflow-y-auto py-1">
              {categoriesAmounts.items.map((item) => {
                const sharePercent =
                  categoriesAmounts.total > 0
                    ? ((item.value / categoriesAmounts.total) * 100).toFixed(1)
                    : "0.0";
                const categoryColor = item.category_color || "var(--primary)";

                return (
                  <Link
                    key={item.category_id}
                    href="/categories"
                    className="group grid grid-cols-[1fr_auto_auto] items-center gap-2 sm:gap-3 px-2 py-2 rounded-xs hover:bg-background-3/60 dark:hover:bg-border/30 transition-colors"
                  >
                    {/* Category Name & Color Bar */}
                    <div className="flex flex-col min-w-0 pr-1 gap-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                          style={{ backgroundColor: categoryColor }}
                        />
                        <span className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {item.category_name}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-xs bg-border/50 overflow-hidden">
                        <div
                          className="h-full rounded-xs transition-all duration-500"
                          style={{
                            width: `${sharePercent}%`,
                            backgroundColor: categoryColor,
                          }}
                        />
                      </div>
                    </div>

                    {/* Share % */}
                    <span className="text-xs text-label text-right shrink-0 tabular-nums">
                      {sharePercent}%
                    </span>

                    {/* Value */}
                    <span className="text-sm font-semibold text-foreground text-right w-24 sm:w-28 shrink-0 tabular-nums">
                      {formatCurrency(item.value)}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Footer Total */}
            <div className="pt-1.5 border-t border-border flex items-center justify-end gap-1.5 text-xs shrink-0">
              <span className="text-label font-medium">
                {t("labels.dashboard.charts.total")}:
              </span>
              <span className="font-semibold text-foreground tabular-nums">
                {formatCurrency(categoriesAmounts.total)}
              </span>
            </div>
          </div>
        )}
      </div>
    </AppCard>
  );
};
