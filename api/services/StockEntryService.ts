import BaseService from "@/api/services/BaseService";
import { StockEntry, StockEntryCreate } from "@/api/schemas/StockEntry";
import { axiosClient } from "@/api/axiosClient";

export class StockEntryService extends BaseService<
  StockEntry,
  StockEntryCreate
> {
  constructor() {
    super("stock_entries");
  }

  async cancel(id: string) {
    return (await axiosClient.post(`/${this.resource}/${id}/cancel`)).data;
  }
}

export const stockEntriesService = new StockEntryService();
