import BaseService from "@/api/services/BaseService";
import { SaleProduct } from "@/api/schemas/SaleProduct";

export class SaleProductsService extends BaseService<SaleProduct> {
  constructor() {
    super("sale_products");
  }
}

export const saleProductsService = new SaleProductsService();
