import BaseService from "@/api/services/BaseService";
import { axiosClient } from "../axiosClient";
import {
  DashboardChart,
  DashboardChartParams,
  DashboardBudgetParams,
} from "../schemas/Dashboard";

export class DashboardService extends BaseService<DashboardChart> {
  constructor() {
    super("dashboard");
  }

  async getChart(data: DashboardChartParams) {
    return (
      await axiosClient.get(`/${this.resource}/chart`, {
        params: data,
      })
    ).data;
  }

  async getBudgets(data: DashboardBudgetParams) {
    return (
      await axiosClient.get(`/${this.resource}/budgets`, {
        params: data,
      })
    ).data;
  }
}

export const dashboardService = new DashboardService();
