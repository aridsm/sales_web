"use client";

import AppPage from "../components/AppPage";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  SettingsOutlined,
  ShoppingCartOutlined,
  ReceiptOutlined,
  ChevronLeft,
  ChevronRight,
  PieChartOutlined,
  InboxOutlined,
} from "@mui/icons-material";
import AppCard from "../components/AppCard";
import AppGrid from "../components/AppGrid";
import AppTabs from "../components/AppTabs";
import AppEmptyState from "../components/AppEmptyState";
import { useTokenStore } from "@/stores/tokenStore";
import { useTranslation } from "@/app/utils/i18n";
import { formatDateTime } from "@/app/utils/formatters/date";
import { currencyFormatter } from "@/app/utils/formatters/currency";
import { historyService } from "@/api/services/HistoryService";
import { History } from "@/api/schemas/History";
import { categoriesService } from "@/api/services/Categories";
import { Category, CategoryAmount } from "@/api/schemas/Category";
import { usePagination, type PaginationService } from "../utils/usePagination";
import { ActionType } from "@/enums/ActionType";
import { EntityType } from "@/enums/EntityType";
import { CategoryType } from "@/enums/CategoryType";
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
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";
import Link from "next/link";
import { dashboardService } from "@/api/services/Dashboard";
import { DashboardChart } from "@/api/schemas/Dashboard";

const datePeriods = {
  today: { label: "Hoje" },
  this_week: { label: "Esta semana" },
  this_month: { label: "Este mês" },
  this_year: { label: "Este ano" },
};

const actionConfig: Record<
  ActionType,
  { labelKey: string; color: string; bg: string }
> = {
  [ActionType.CREATE]: {
    labelKey: "labels.history.actions.CREATE",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  [ActionType.UPDATE]: {
    labelKey: "labels.history.actions.UPDATE",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  [ActionType.DELETE]: {
    labelKey: "labels.history.actions.DELETE",
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-500/10",
  },
  [ActionType.CANCEL]: {
    labelKey: "labels.history.actions.CANCEL",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
  },
};

export default function DashboardPage() {
  const token = useTokenStore((state) => state.token);
  const router = useRouter();
  const { t } = useTranslation();

  const [activePeriod, setActivePeriod] = useState("this_week");

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  const entityLabels: Record<number, string> = useMemo(
    () => ({
      [EntityType.PRODUCT]: t("labels.history.entities.PRODUCT"),
      [EntityType.CATEGORY]: t("labels.history.entities.CATEGORY"),
      [EntityType.SALE]: t("labels.history.entities.SALE"),
      [EntityType.OTHER_EXPENSE]: t("labels.history.entities.OTHER_EXPENSE"),
    }),
    [t],
  );

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();

    if (activePeriod === "today") {
      return {
        startDate: new Date(y, m, d, 0, 0, 0).toISOString(),
        endDate: new Date(y, m, d, 23, 59, 59).toISOString(),
      };
    }
    if (activePeriod === "this_week") {
      const dayOfWeek = now.getDay();
      return {
        startDate: new Date(y, m, d - dayOfWeek, 0, 0, 0).toISOString(),
        endDate: new Date(y, m, d - dayOfWeek + 6, 23, 59, 59).toISOString(),
      };
    }
    if (activePeriod === "this_month") {
      return {
        startDate: new Date(y, m, 1, 0, 0, 0).toISOString(),
        endDate: new Date(y, m + 1, 0, 23, 59, 59).toISOString(),
      };
    }
    if (activePeriod === "this_year") {
      return {
        startDate: new Date(y, 0, 1, 0, 0, 0).toISOString(),
        endDate: new Date(y, 11, 31, 23, 59, 59).toISOString(),
      };
    }
    return {
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    };
  }, [activePeriod]);

  if (!token) {
    return null;
  }
  return (
    <AppPage title="Dashboard">
      <div className="flex flex-col flex-1 gap-5 min-h-0">
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <AppTabs
            tabs={Object.entries(datePeriods).map(([key]) => ({
              value: key,
              label: t(`labels.dashboard.periods.${key}`),
            }))}
            activeTab={activePeriod}
            onChange={setActivePeriod}
          />
        </div>

        <DashboardKPIs startDate={startDate} endDate={endDate} />

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-[minmax(250px,320px)_minmax(400px,1fr)] min-h-0 gap-5 flex-1">
          <DashboardRevenueExpenseChart activePeriod={activePeriod} />
          <DashboardCategoryProfitChart
            entityLabels={entityLabels}
            startDate={startDate}
            endDate={endDate}
          />
          <DashboardHistory
            entityLabels={entityLabels}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </div>
    </AppPage>
  );
}

const DashboardKPIs = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) => {
  const { t } = useTranslation();
  const [budget, setBudget] = useState<any>({
    current_balance: 0,
    net_profit: 0,
    revenue: 0,
    expenses: 0,
  });

  useEffect(() => {
    dashboardService
      .getBudgets({
        start_date: startDate,
        end_date: endDate,
      })
      .then((res: any) => {
        setBudget({
          current_balance: res.current_balance,
          net_profit: res.net_profit,
          revenue: res.revenue,
          expenses: res.expenses,
        });
      })
      .catch(console.error);
  }, [startDate, endDate]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 shrink-0">
      {Object.entries(budget).map(([key, value]: any) => (
        <AppCard
          key={key}
          className={`p-4 flex flex-col justify-center gap-1 ${
            key === "current_balance"
              ? "bg-primary! text-white border-transparent"
              : ""
          }`}
        >
          <span
            className={`text-sm ${key === "current_balance" ? "text-white/80" : "text-label"}`}
          >
            {t(`labels.dashboard.kpi.${key}`)}
          </span>
          <span className="text-2xl font-bold tracking-tight">
            {currencyFormatter.mask(value)}
          </span>
        </AppCard>
      ))}
    </div>
  );
};

const DashboardRevenueExpenseChart = ({
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
      .then((res: any) => setChartData(res));
  }, [previous, frequency]);

  return (
    <AppCard className="flex px-5 pt-4 pb-5 flex-col lg:col-span-2 min-h-[250px] overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <span className="font-semibold text-lg">
          {t("labels.dashboard.charts.revenue_vs_expenses")}
        </span>
        <div className="flex items-center gap-3">
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
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
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
                tick={{ fill: "#888888", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#888888", fontSize: 12 }}
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
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
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
                tick={{ fill: "#888888", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#888888", fontSize: 12 }}
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

const DashboardCategoryProfitChart = ({
  entityLabels,
  startDate,
  endDate,
}: {
  entityLabels: Record<number, string>;
  startDate: string;
  endDate: string;
}) => {
  const { t } = useTranslation();
  const [activePieIndex, setActivePieIndex] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState<CategoryType>(
    CategoryType.PRODUCT,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesAmounts, setCategoriesAmounts] = useState<CategoryAmount>({
    items: [],
    total: 0,
  });

  useEffect(() => {
    categoriesService
      .getAmounts({
        start_created_at: startDate,
        end_created_at: endDate,
        type: activeTab,
      })
      .then((res: any) => setCategoriesAmounts(res));
    categoriesService
      .getAll({ type: activeTab })
      .then((res: any) => {
        setCategories(res.items || res);
      })
      .catch(console.error);
  }, [startDate, endDate, activeTab]);

  return (
    <AppCard className="px-5 pt-4 pb-5 flex flex-col lg:col-span-1 lg:row-span-2 overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-lg">
          {activeTab === CategoryType.PRODUCT
            ? t("labels.dashboard.charts.profit_by_category")
            : t("labels.dashboard.charts.expenses_by_category")}
        </span>
        <AppTabs
          tabs={[
            {
              value: String(CategoryType.PRODUCT),
              label: t("labels.dashboard.charts.profit_tab"),
            },
            {
              value: String(CategoryType.OTHER_EXPENSE),
              label: t("labels.dashboard.charts.expenses_tab"),
            },
          ]}
          activeTab={String(activeTab)}
          onChange={(val) => setActiveTab(Number(val) as CategoryType)}
        />
      </div>
      <div className="w-full relative shrink-0 h-52 mt-2">
        {categoriesAmounts.items.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoriesAmounts.items}
                innerRadius="50%"
                outerRadius="80%"
                paddingAngle={5}
                dataKey="value"
                nameKey="category_name"
                stroke="none"
                {...({
                  activeIndex: activePieIndex,
                  activeShape: renderActiveShape,
                } as any)}
                onMouseEnter={(_, index) => setActivePieIndex(index)}
                onMouseLeave={() => setActivePieIndex(undefined)}
              >
                {categoriesAmounts.items.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.category_color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <AppEmptyState
            className="w-full h-full border border-border"
            title={t("labels.grid.empty_title")}
            subtitle={t("labels.dashboard.charts.no_data")}
            icon={<PieChartOutlined fontSize="medium" />}
          />
        )}
      </div>

      {/* Lista de Categorias do Sistema */}
      <div className="flex-1 mt-6 flex flex-col gap-2 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-lg">
            {t("labels.dashboard.charts.system_categories")}
          </span>
          <Link
            className="text-label hover:text-primary text-sm dark:hover:text-yellow-300 hover:underline"
            href="/categories"
          >
            {t("labels.dashboard.charts.view_all")}
          </Link>
        </div>
        {categories.length > 0 ? (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 py-1.5 border-b border-border last:border-0"
            >
              <div
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: cat.color || "#ccc" }}
              />
              <span className="text-sm flex-1 truncate">{cat.name}</span>
              <div
                title={
                  cat.type === CategoryType.PRODUCT
                    ? entityLabels[EntityType.PRODUCT]
                    : entityLabels[EntityType.OTHER_EXPENSE]
                }
                className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors ${
                  cat.type === CategoryType.PRODUCT
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                }`}
              >
                {cat.type === CategoryType.PRODUCT ? (
                  <ShoppingCartOutlined fontSize="small" />
                ) : (
                  <ReceiptOutlined fontSize="small" />
                )}
              </div>
            </div>
          ))
        ) : (
          <AppEmptyState
            className="flex-1 py-6 border border-border"
            title={t("labels.grid.empty_title")}
            subtitle={t("labels.dashboard.charts.no_category")}
          />
        )}
      </div>
    </AppCard>
  );
};

const DashboardHistory = ({
  entityLabels,
  startDate,
  endDate,
}: {
  entityLabels: Record<number, string>;
  startDate: string;
  endDate: string;
}) => {
  const { t } = useTranslation();

  const historyPagination = usePagination<History>(
    historyService as unknown as PaginationService<History>,
    { page_size: 10 },
  );

  useEffect(() => {
    historyPagination.load({
      params: { start_created_at: startDate, end_created_at: endDate },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const historyColumns = useMemo(
    () => [
      {
        column: t("labels.history.action"),
        cell: ({ row }: { row: History }) => {
          const config = actionConfig[Number(row.action_type) as ActionType];
          if (!config) return <span>{row.action_type}</span>;
          return (
            <span
              className={`text-sm font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${config.bg} ${config.color}`}
            >
              {t(config.labelKey)}
            </span>
          );
        },
        size: 140,
      },
      {
        column: t("labels.history.date"),
        cell: ({ row }: { row: History }) => formatDateTime(row.created_at),
        size: 200,
      },
      {
        column: t("labels.history.description"),
        cell: ({ row }: { row: History }) => row.description,
        size: 360,
      },
      {
        column: t("labels.history.entity_type"),
        cell: ({ row }: { row: History }) =>
          entityLabels[Number(row.entity_type)] || row.entity_type,
        size: 180,
      },
    ],
    [t, entityLabels],
  );

  return (
    <AppCard className="flex flex-col lg:col-span-2 p-5 flex-1 overflow-hidden min-h-0">
      <div className="flex justify-between items-center mb-1">
        <span className="font-semibold text-lg">
          {t("labels.dashboard.history.title")}
        </span>

        <Link
          href="/history"
          className="text-label hover:text-primary text-sm dark:hover:text-yellow-300 hover:underline"
        >
          {t("labels.dashboard.history.view_all")}
        </Link>
      </div>
      <AppGrid columns={historyColumns} pagination={historyPagination} />
    </AppCard>
  );
};

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 12}
        fill={fill}
        opacity={0.3}
      />
    </g>
  );
};

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background-2 p-3 rounded-lg shadow-md flex flex-col gap-1">
        {label && (
          <span className="font-semibold mb-1 text-label">{label}</span>
        )}
        {payload.map((entry: any, index: number) => {
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

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background-2 p-3 rounded-lg shadow-md flex flex-col gap-1">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: entry.payload.category_color || entry.color,
              }}
            />
            <span className="font-medium text-foreground">{entry.name}</span>
            <span className="font-bold ml-auto pl-4 text-foreground">
              {currencyFormatter.mask(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
