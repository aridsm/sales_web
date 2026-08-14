import { useState, useEffect } from "react";
import AppCard from "../../components/AppCard";
import AppTabs from "../../components/AppTabs";
import AppEmptyState from "../../components/AppEmptyState";
import { useTranslation } from "@/app/utils/i18n";
import { categoriesService } from "@/api/services/CategoryService";
import { Category, CategoryAmount } from "@/api/schemas/Category";
import { CategoryType } from "@/enums/CategoryType";
import { EntityType } from "@/enums/EntityType";
import { formatCurrency } from "@/app/utils/formatters/currency";
import {
  ShoppingCartOutlined,
  ReceiptOutlined,
  PieChartOutlined,
} from "@mui/icons-material";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  Sector,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ActiveShapeProps {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
}

const renderActiveShape = (props: ActiveShapeProps) => {
  const { cx, cy, startAngle, endAngle, fill } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={props.innerRadius}
        outerRadius={(props.outerRadius || 0) + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={(props.outerRadius || 0) + 8}
        outerRadius={(props.outerRadius || 0) + 12}
        fill={fill}
        opacity={0.3}
      />
    </g>
  );
};

const CustomPieTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background-2 p-3 rounded-lg shadow-md flex flex-col gap-1">
        {payload.map((entry, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: entry.payload?.category_color || entry.color,
              }}
            />
            <span className="font-medium text-foreground">{entry.name}</span>
            <span className="font-bold ml-auto pl-4 text-foreground">
              {entry.payload?.amount !== undefined
                ? formatCurrency(entry.payload.amount)
                : formatCurrency(entry.value || 0)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardCategoryProfitChart = ({
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
  const [activeTab, setActiveTab] = useState<string>("sales");
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
        type: activeTab as unknown as CategoryType,
      })
      .then((res: CategoryAmount) => setCategoriesAmounts(res));

    const categoryEnum =
      activeTab === "other_expenses"
        ? CategoryType.OTHER_EXPENSE
        : CategoryType.PRODUCT;

    categoriesService
      .getAll({ type: categoryEnum })
      .then((res: { items: Category[] } | Category[]) => {
        setCategories("items" in res ? res.items : res);
      })
      .catch(console.error);
  }, [startDate, endDate, activeTab]);

  return (
    <AppCard className="px-5 pt-4 pb-5 flex flex-col lg:col-span-1 lg:row-span-2 overflow-hidden">
      <div className="flex flex-col gap-3 mb-4">
        <span className="font-semibold text-lg">
          {activeTab === "sales"
            ? t("labels.dashboard.charts.profit_by_category")
            : activeTab === "stock_entries"
              ? "Entradas de Estoque por categoria"
              : t("labels.dashboard.charts.expenses_by_category")}
        </span>
        <AppTabs
          tabs={[
            {
              value: "sales",
              label: "Vendas",
            },
            {
              value: "stock_entries",
              label: "Entrada de Estoque",
            },
            {
              value: "other_expenses",
              label: "Outros Gastos",
            },
          ]}
          activeTab={activeTab}
          onChange={(val) => setActiveTab(val)}
        />
      </div>
      <div className="w-full relative shrink-0 h-52">
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
                } as unknown as object)}
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
            className="w-full h-full border border-border bg-background-2 dark:bg-background rounded-md"
            title={t("labels.grid.empty_title")}
            subtitle={t("labels.dashboard.charts.no_data")}
            icon={<PieChartOutlined fontSize="medium" />}
          />
        )}
      </div>

      <div className="flex-1 mt-6 flex flex-col gap-2 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-lg">
            {t("labels.dashboard.charts.system_categories")}
          </span>
          <Link
            className="text-sm text-primary-3 dark:text-primary hover:underline"
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
            className="flex-1 py-6 border border-border bg-background-2 dark:bg-background rounded-md"
            title={t("labels.grid.empty_title")}
            subtitle={t("labels.dashboard.charts.no_category")}
            icon={
              activeTab === "sales" || activeTab === "stock_entries" ? (
                <ShoppingCartOutlined fontSize="medium" />
              ) : (
                <ReceiptOutlined fontSize="medium" />
              )
            }
          />
        )}
      </div>
    </AppCard>
  );
};
