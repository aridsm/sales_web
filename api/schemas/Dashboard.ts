export interface DashboardChartParams {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  count: number;
  previous: number;
  timezone_offset: number;
}

export interface DashboardBudgetParams {
  start_date: string;
  end_date: string;
}

export interface DashboardChart {
  name: string;
  revenue: string;
  expenses: string;
}
