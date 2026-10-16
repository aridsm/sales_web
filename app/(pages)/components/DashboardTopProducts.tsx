"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import AppCard from "../../components/AppCard";
import AppTabs from "../../components/AppTabs";
import AppEmptyState from "../../components/AppEmptyState";
import { useTranslation } from "@/app/utils/i18n";
import { dashboardService } from "@/api/services/DashboardService";
import { TopProductItem } from "@/api/schemas/Dashboard";
import { formatCurrency } from "@/app/utils/formatters/currency";
import { LocalMallOutlined, ChevronRight } from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface DashboardTopProductsProps {
  startDate: string;
  endDate: string;
  activePeriod: string;
}

export function DashboardTopProducts({
  startDate,
  endDate,
  activePeriod,
}: DashboardTopProductsProps) {
  const { t } = useTranslation();
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"ranking" | "chart">("ranking");

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    dashboardService
      .getTopProducts({
        start_date: startDate,
        end_date: endDate,
        limit: 5,
      })
      .then((res) => {
        if (!isCancelled) {
          setTopProducts(Array.isArray(res) ? res : []);
        }
      })
      .catch((err) => {
        console.error("Error loading top products:", err);
        if (!isCancelled) {
          setTopProducts([]);
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
  }, [startDate, endDate]);

  const maxRevenue = useMemo(() => {
    if (topProducts.length === 0) return 1;
    return Math.max(...topProducts.map((p) => p.total_revenue), 1);
  }, [topProducts]);

  return (
    <AppCard className="px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:pt-4 lg:pb-5 flex flex-col lg:col-span-5 min-[1580px]:col-span-4 min-h-[340px] lg:min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-3">
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
          <span className="font-semibold text-base sm:text-lg text-foreground truncate">
            {t("labels.dashboard.top_products.title")}
          </span>
          <span className="px-2 py-0.5 rounded-xs border border-border text-xs font-medium text-foreground-2 shrink-0">
            {t(`labels.dashboard.periods.${activePeriod}`)}
          </span>
        </div>

        {topProducts.length > 0 && (
          <AppTabs
            tabs={[
              {
                value: "ranking",
                label: t("labels.dashboard.top_products.tab_ranking"),
              },
              {
                value: "chart",
                label: t("labels.dashboard.top_products.tab_chart"),
              },
            ]}
            activeTab={viewMode}
            onChange={(val) => setViewMode(val as "ranking" | "chart")}
          />
        )}
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
        ) : topProducts.length === 0 ? (
          <AppEmptyState
            className="flex-1 w-full border border-border bg-background-2 dark:bg-background rounded-xs my-auto py-8"
            title={t("labels.grid.empty_title")}
            subtitle={t("labels.dashboard.top_products.no_data")}
            icon={<LocalMallOutlined fontSize="medium" />}
          />
        ) : viewMode === "ranking" ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Table Header */}
            <div className="grid grid-cols-[24px_1fr_auto_auto] items-center gap-2 sm:gap-3 px-2 pb-1.5 border-b border-border text-[11px] font-semibold text-label uppercase tracking-wider select-none">
              <span className="text-center">
                {t("labels.dashboard.top_products.rank")}
              </span>
              <span>{t("labels.dashboard.top_products.product")}</span>
              <span className="text-right">
                {t("labels.dashboard.top_products.quantity")}
              </span>
              <span className="text-right w-24 sm:w-28">
                {t("labels.dashboard.top_products.revenue")}
              </span>
            </div>

            {/* Rows */}
            <div className="flex-1 flex flex-col gap-1 overflow-y-auto py-1">
              {topProducts.map((item, index) => {
                const percentage = Math.round(
                  (item.total_revenue / maxRevenue) * 100,
                );

                return (
                  <Link
                    key={item.product_id}
                    href="/products"
                    className="relative group grid grid-cols-[24px_1fr_auto_auto] items-center gap-2 sm:gap-3 px-2 py-1.5 rounded-xs border border-transparent hover:border-border hover:bg-background-3/40 transition-colors"
                  >
                    {/* Integrated background bar */}
                    <div
                      className="absolute inset-y-0 left-0 bg-primary/6 dark:bg-primary/10 rounded-xs transition-all duration-500 pointer-events-none"
                      style={{ width: `${percentage}%` }}
                    />

                    {/* Rank */}
                    <span
                      className={`relative z-1 text-xs font-mono text-center select-none ${
                        index === 0
                          ? "font-bold text-primary"
                          : "font-medium text-label"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Product & Category */}
                    <div className="relative z-1 flex flex-col min-w-0 pr-1">
                      <span className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {item.product_name}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-label mt-0.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              item.category_color || "var(--primary)",
                          }}
                        />
                        <span className="truncate">{item.category_name}</span>
                      </div>
                    </div>

                    {/* Quantity */}
                    <span className="relative z-1 text-xs text-label text-right shrink-0 tabular-nums">
                      {item.quantity_sold} un.
                    </span>

                    {/* Revenue */}
                    <span className="relative z-1 text-sm font-semibold text-foreground text-right w-24 sm:w-28 shrink-0 tabular-nums">
                      {formatCurrency(item.total_revenue)}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Footer View all */}
            <div className="pt-2 border-t border-border flex justify-end shrink-0">
              <Link
                href="/products"
                className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-0.5"
              >
                <span>{t("labels.dashboard.top_products.view_all")}</span>
                <ChevronRight style={{ fontSize: 14 }} />
              </Link>
            </div>
          </div>
        ) : (
          /* Chart View */
          <div className="flex-1 w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topProducts}
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#88888833"
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#888888", fontSize: 11 }}
                  tickFormatter={(v) => formatCurrency(v)}
                />
                <YAxis
                  type="category"
                  dataKey="product_name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#888888", fontSize: 11 }}
                  width={110}
                  tickFormatter={(name: string) =>
                    name.length > 13 ? `${name.slice(0, 13)}…` : name
                  }
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload as TopProductItem;
                    return (
                      <div className="bg-background-2 p-2.5 rounded-xs shadow-md border border-border flex flex-col gap-1 text-xs">
                        <span className="font-semibold text-foreground">
                          {data.product_name}
                        </span>
                        <span className="text-label">{data.category_name}</span>
                        <div className="h-px bg-border my-0.5" />
                        <div className="flex justify-between gap-4">
                          <span className="text-label">
                            {t("labels.dashboard.top_products.quantity")}:
                          </span>
                          <span className="font-semibold text-foreground tabular-nums">
                            {data.quantity_sold} un.
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-label">
                            {t("labels.dashboard.top_products.revenue")}:
                          </span>
                          <span className="font-semibold text-foreground tabular-nums">
                            {formatCurrency(data.total_revenue)}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                  cursor={{ fill: "transparent" }}
                />
                <Bar
                  dataKey="total_revenue"
                  fill="var(--primary)"
                  radius={[0, 3, 3, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </AppCard>
  );
}
