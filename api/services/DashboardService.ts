import BaseService from "@/api/services/BaseService";
import { axiosClient } from "@/api/axiosClient";
import {
  DashboardChart,
  DashboardChartParams,
  DashboardBudgetParams,
  TopProductItem,
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

  async getTopProducts(params?: {
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<TopProductItem[]> {
    return (
      await axiosClient.get(`/${this.resource}/top-products`, {
        params,
      })
    ).data;
  }
}

export const dashboardService = new DashboardService();
