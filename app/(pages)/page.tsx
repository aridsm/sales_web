"use client";

import AppPage from "../components/AppPage";
import { useState, useMemo } from "react";
import AppTabs from "../components/AppTabs";
import { useTranslation } from "@/app/utils/i18n";
import { DashboardKPIs } from "./components/DashboardKPIs";
import { DashboardRevenueExpenseChart } from "./components/DashboardRevenueExpenseChart";
import { DashboardCategoryProfitChart } from "./components/DashboardCategoryProfitChart";
import { DashboardHistory } from "./components/DashboardHistory";
import { DashboardTopProducts } from "./components/DashboardTopProducts";
import { EntityType } from "@/enums";

const datePeriods = {
  today: { label: "Hoje" },
  this_week: { label: "Esta semana" },
  this_month: { label: "Este mês" },
  this_year: { label: "Este ano" },
};

export default function DashboardPage() {
  const { t } = useTranslation();

  const [activePeriod, setActivePeriod] = useState("this_week");

  const entityLabels: Record<number, string> = useMemo(
    () => ({
      [EntityType.PRODUCT]: t("labels.history.entities.PRODUCT"),
      [EntityType.CATEGORY]: t("labels.history.entities.CATEGORY"),
      [EntityType.SALE]: t("labels.history.entities.SALE"),
      [EntityType.OTHER_EXPENSE]: t("labels.history.entities.OTHER_EXPENSE"),
      [EntityType.STOCK_ENTRY]: t("labels.history.entities.STOCK_ENTRY"),
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

  return (
    <AppPage title="Dashboard" scrollable contentClassName="py-3 sm:py-4">
      <div className="flex flex-col gap-2 sm:gap-2.5 lg:gap-3 lg:flex-1">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 shrink-0">
          <AppTabs
            tabs={Object.entries(datePeriods).map(([key]) => ({
              value: key,
              label: t(`labels.dashboard.periods.${key}`),
            }))}
            activeTab={activePeriod}
            onChange={setActivePeriod}
          />
        </div>

        <DashboardKPIs
          startDate={startDate}
          endDate={endDate}
          activePeriod={activePeriod}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[350px_430px] lg:flex-1 gap-2 sm:gap-2.5 lg:gap-3.5">
          <DashboardRevenueExpenseChart activePeriod={activePeriod} />
          <DashboardTopProducts
            startDate={startDate}
            endDate={endDate}
            activePeriod={activePeriod}
          />
          <DashboardHistory
            entityLabels={entityLabels}
            startDate={startDate}
            endDate={endDate}
            activePeriod={activePeriod}
          />
          <DashboardCategoryProfitChart
            startDate={startDate}
            endDate={endDate}
            activePeriod={activePeriod}
          />
        </div>
      </div>
    </AppPage>
  );
}
