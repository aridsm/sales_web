import BaseService from "@/api/services/BaseService";
import { StockEntryProduct } from "@/api/schemas/StockEntryProduct";

export class StockEntryProductService extends BaseService<StockEntryProduct, any> {
  constructor() {
    super("stock_entry_products");
  }
}

export const stockEntryProductsService = new StockEntryProductService();
