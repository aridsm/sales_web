import { useState, useEffect } from "react";
import AppCard from "../../components/AppCard";
import { useTranslation } from "@/app/utils/i18n";
import { dashboardService } from "@/api/services/DashboardService";
import { currencyFormatter } from "@/app/utils/formatters/currency";

export const DashboardKPIs = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) => {
  const { t } = useTranslation();
  const [budget, setBudget] = useState<{
    current_balance: number;
    net_profit: number;
    revenue: number;
    expenses: number;
  }>({
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
      .then(
        (res: {
          current_balance: number;
          net_profit: number;
          revenue: number;
          expenses: number;
        }) => {
          setBudget({
            current_balance: res.current_balance,
            net_profit: res.net_profit,
            revenue: res.revenue,
            expenses: res.expenses,
          });
        },
      )
      .catch(console.error);
  }, [startDate, endDate]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3.5 shrink-0">
      {Object.entries(budget).map(([key, value]) => {
        const formattedValue = currencyFormatter.mask(value);
        return (
          <AppCard
            key={key}
            title={formattedValue}
            className="p-2.5 sm:p-3.5 lg:p-4 flex flex-col justify-center gap-0.5 sm:gap-1 min-w-0"
          >
            <span className="text-xs sm:text-sm truncate text-label">
              {t(`labels.dashboard.kpi.${key}`)}
            </span>
            <span className="text-base sm:text-xl font-semibold sm:font-bold tracking-tight truncate text-foreground">
              {formattedValue}
            </span>
          </AppCard>
        );
      })}
    </div>
  );
};
