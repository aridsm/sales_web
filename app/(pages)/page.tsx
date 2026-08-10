"use client";

import AppPage from "../components/AppPage";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import AppTabs from "../components/AppTabs";
import { useTokenStore } from "@/stores/tokenStore";
import { useTranslation } from "@/app/utils/i18n";
import { DashboardKPIs } from "./components/DashboardKPIs";
import { DashboardRevenueExpenseChart } from "./components/DashboardRevenueExpenseChart";
import { DashboardCategoryProfitChart } from "./components/DashboardCategoryProfitChart";
import { DashboardHistory } from "./components/DashboardHistory";
import { EntityType } from "@/enums";

const datePeriods = {
  today: { label: "Hoje" },
  this_week: { label: "Esta semana" },
  this_month: { label: "Este mês" },
  this_year: { label: "Este ano" },
};

export default function DashboardPage() {
  const token = useTokenStore((state) => state.token);
  const router = useRouter();
  const { t } = useTranslation();

  const [activePeriod, setActivePeriod] = useState("this_week");

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
