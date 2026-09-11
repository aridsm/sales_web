import { useState, useEffect, useMemo } from "react";
import AppCard from "../../components/AppCard";
import AppTabs from "../../components/AppTabs";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useTranslation } from "@/app/utils/i18n";
import { dashboardService } from "@/api/services/DashboardService";
import { DashboardChart } from "@/api/schemas/Dashboard";
import { currencyFormatter } from "@/app/utils/formatters/currency";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background-2 p-3 rounded-lg shadow-md flex flex-col gap-1">
        {label && (
          <span className="font-semibold mb-1 text-label">{label}</span>
        )}
        {payload.map((entry, index: number) => {
          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium text-foreground">{entry.name}</span>
              <span className="font-bold ml-auto pl-4 text-foreground">
                {currencyFormatter.mask(entry.value)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export const DashboardRevenueExpenseChart = ({
  activePeriod,
}: {
  activePeriod: string;
}) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState<"line" | "bar">("bar");
  const [chartData, setChartData] = useState<DashboardChart[]>([]);
  const [previous, setPrevious] = useState(0);

  const frequency = useMemo(() => {
    switch (activePeriod) {
      case "today":
        return "daily";
      case "this_week":
        return "weekly";
      case "this_month":
        return "monthly";
      case "this_year":
        return "yearly";
      default:
        return "daily";
    }
  }, [activePeriod]);

  useEffect(() => {
    dashboardService
      .getChart({
        frequency,
        count: 7,
        previous,
        timezone_offset: new Date().getTimezoneOffset(),
      })
      .then((res: DashboardChart[]) => setChartData(res));
  }, [previous, frequency]);

  return (
    <AppCard className="flex px-4 py-4 sm:px-5 sm:pt-4 sm:pb-5 flex-col lg:col-span-7 min-[1580px]:col-span-8 min-h-[300px] lg:min-h-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="font-semibold text-base sm:text-lg">
            {t("labels.dashboard.charts.revenue_vs_expenses")}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-background-3 border border-border text-xs font-medium text-label">
            {t(`labels.dashboard.frequencies.${activePeriod}`)}
          </span>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPrevious((p) => p + 1)}
              className="p-1 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 rounded-md text-label transition-colors"
            >
              <ChevronLeft fontSize="small" />
            </button>
            <button
              onClick={() => setPrevious((p) => Math.max(0, p - 1))}
              disabled={previous === 0}
              className={`p-1 flex items-center justify-center rounded-md transition-colors ${
                previous === 0
                  ? "text-label/30 cursor-not-allowed"
                  : "text-label hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <ChevronRight fontSize="small" />
            </button>
          </div>
          <AppTabs
            tabs={[
              { value: "line", label: t("labels.dashboard.charts.lines_tab") },
              { value: "bar", label: t("labels.dashboard.charts.bars_tab") },
            ]}
            activeTab={chartType}
            onChange={(val) => setChartType(val as "line" | "bar")}
          />
        </div>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#88888833"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#888888", fontSize: 11 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#888888", fontSize: 11 }}
              />
              <Tooltip
                content={<CustomChartTooltip />}
                cursor={{ fill: "transparent" }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name={t("labels.dashboard.charts.revenue")}
                stroke="var(--primary)"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name={t("labels.dashboard.charts.expenses")}
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#88888833"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#888888", fontSize: 11 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#888888", fontSize: 11 }}
              />
              <Tooltip
                content={<CustomChartTooltip />}
                cursor={{ fill: "transparent" }}
              />
              <Bar
                dataKey="revenue"
                name={t("labels.dashboard.charts.revenue")}
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="expenses"
                name={t("labels.dashboard.charts.expenses")}
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </AppCard>
  );
};
