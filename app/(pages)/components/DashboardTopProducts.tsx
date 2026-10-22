"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import AppCard from "../../components/AppCard";
import AppTabs from "../../components/AppTabs";
import AppEmptyState from "../../components/AppEmptyState";
import { useTranslation } from "@/app/utils/i18n";
import { dashboardService } from "@/api/services/DashboardService";
import { TopProductItem } from "@/api/schemas/Dashboard";
import { formatCurrency } from "@/app/utils/formatters/currency";
import {
  LocalMallOutlined,
  SwapVertRounded,
  CheckRounded,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  Cell,
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
  const [sortBy, setSortBy] = useState<"quantity" | "revenue">("quantity");

  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const sortTriggerRef = useRef<HTMLButtonElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateMenuPosition = useCallback(() => {
    if (!sortTriggerRef.current) return;
    const rect = sortTriggerRef.current.getBoundingClientRect();
    const viewportWidth =
      typeof window !== "undefined" ? window.innerWidth : 1000;
    const menuWidth = 190;

    let left = rect.right - menuWidth;
    if (left + menuWidth > viewportWidth - 12) {
      left = viewportWidth - menuWidth - 12;
    }
    if (left < 12) {
      left = 12;
    }

    setMenuCoords({ top: rect.bottom + 6, left });
  }, []);

  const openSortMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    updateMenuPosition();
    setSortMenuOpen(true);
  };

  const closeSortMenuDelayed = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setSortMenuOpen(false);
    }, 150);
  };

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    dashboardService
      .getTopProducts({
        start_date: startDate,
        end_date: endDate,
        limit: 15,
        sort_by: sortBy,
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
  }, [startDate, endDate, sortBy]);

  const maxValue = useMemo(() => {
    if (topProducts.length === 0) return 1;
    if (sortBy === "quantity") {
      return Math.max(...topProducts.map((p) => p.quantity_sold), 1);
    }
    return Math.max(...topProducts.map((p) => p.total_revenue), 1);
  }, [topProducts, sortBy]);

  return (
    <AppCard className="px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:pt-4 lg:pb-4 flex flex-col lg:col-span-5 min-[1580px]:col-span-4 min-h-[320px] lg:min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-2.5">
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
          <span className="font-semibold text-base sm:text-lg text-foreground truncate">
            {t("labels.dashboard.top_products.title")}
          </span>
          <span className="px-2 py-0.5 rounded-xs border border-border text-xs font-medium text-foreground-2 shrink-0">
            {t(`labels.dashboard.periods.${activePeriod}`)}
          </span>
        </div>

        {topProducts.length > 0 && (
          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 shrink-0">
            <button
              ref={sortTriggerRef}
              type="button"
              onMouseEnter={openSortMenu}
              onMouseLeave={closeSortMenuDelayed}
              onClick={() =>
                setSortBy((prev) =>
                  prev === "quantity" ? "revenue" : "quantity",
                )
              }
              className="p-1.5 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 rounded-xs text-label hover:text-foreground transition-colors cursor-pointer"
              aria-label={t("labels.dashboard.top_products.sort_label")}
            >
              <SwapVertRounded fontSize="small" />
            </button>

            {sortMenuOpen &&
              menuCoords &&
              typeof document !== "undefined" &&
              createPortal(
                <div
                  onMouseEnter={openSortMenu}
                  onMouseLeave={closeSortMenuDelayed}
                  style={{
                    top: `${menuCoords.top}px`,
                    left: `${menuCoords.left}px`,
                  }}
                  className="fixed z-50 w-48 bg-background-2 dark:bg-background-3 border border-border rounded-xs shadow-dropdown p-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100"
                >
                  <span className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-label">
                    {t("labels.dashboard.top_products.sort_label")}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("quantity");
                      setSortMenuOpen(false);
                    }}
                    className={`w-full px-2 py-1.5 rounded-xs text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      sortBy === "quantity"
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-background-3 dark:hover:bg-background-2"
                    }`}
                  >
                    <span>
                      {t("labels.dashboard.top_products.sort_quantity_short")}
                    </span>
                    {sortBy === "quantity" && (
                      <CheckRounded style={{ fontSize: 14 }} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("revenue");
                      setSortMenuOpen(false);
                    }}
                    className={`w-full px-2 py-1.5 rounded-xs text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      sortBy === "revenue"
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-background-3 dark:hover:bg-background-2"
                    }`}
                  >
                    <span>
                      {t("labels.dashboard.top_products.sort_revenue_short")}
                    </span>
                    {sortBy === "revenue" && (
                      <CheckRounded style={{ fontSize: 14 }} />
                    )}
                  </button>
                </div>,
                document.body,
              )}

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
          </div>
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
            className="flex-1 w-full border border-border bg-background-2 dark:bg-background rounded-xs my-auto py-6"
            title={t("labels.grid.empty_title")}
            subtitle={t("labels.dashboard.top_products.no_data")}
            icon={<LocalMallOutlined fontSize="medium" />}
          />
        ) : viewMode === "ranking" ? (
          <div className="flex-1 flex flex-col gap-1 overflow-y-auto py-1">
            {topProducts.map((item) => {
              const metricValue =
                sortBy === "quantity"
                  ? item.quantity_sold
                  : item.total_revenue;
              const percentage = Math.round((metricValue / maxValue) * 100);
              const categoryColor = item.category_color || "var(--primary)";

              return (
                <Link
                  key={item.product_id}
                  href="/products"
                  className="group grid grid-cols-[1fr_auto_auto] items-center gap-2 sm:gap-3 px-2 py-2 rounded-xs hover:bg-background-3/60 dark:hover:bg-border/30 transition-colors"
                >
                  {/* Product & Category */}
                  <div className="flex flex-col min-w-0 pr-1 gap-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {item.product_name}
                      </span>
                      <span className="text-xs text-label truncate max-w-28 shrink-0">
                        {item.category_name}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-xs bg-border/50 overflow-hidden">
                      <div
                        className="h-full rounded-xs transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: categoryColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* Quantity */}
                  <span
                    className={`text-right shrink-0 tabular-nums ${
                      sortBy === "quantity"
                        ? "text-xs font-semibold text-foreground"
                        : "text-xs text-label"
                    }`}
                  >
                    {item.quantity_sold} un.
                  </span>

                  {/* Revenue */}
                  <span
                    className={`text-sm text-right w-24 sm:w-28 shrink-0 tabular-nums ${
                      sortBy === "revenue"
                        ? "font-semibold text-foreground"
                        : "font-medium text-foreground-2"
                    }`}
                  >
                    {formatCurrency(item.total_revenue)}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Chart View */
          <div className="flex-1 w-full min-h-[180px]">
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
                  tickFormatter={(v) =>
                    sortBy === "quantity" ? `${v} un.` : formatCurrency(v)
                  }
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
                        <div className="flex items-center gap-1.5 text-label">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                data.category_color || "var(--primary)",
                            }}
                          />
                          <span>{data.category_name}</span>
                        </div>
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
                  dataKey={
                    sortBy === "quantity" ? "quantity_sold" : "total_revenue"
                  }
                  radius={[0, 3, 3, 0]}
                >
                  {topProducts.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.category_color || "var(--primary)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </AppCard>
  );
}
