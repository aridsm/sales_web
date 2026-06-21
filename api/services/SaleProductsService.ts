import BaseService from "@/api/services/BaseService";
import { SaleProduct } from "@/api/schemas/SaleProduct";

export class SaleProductsService extends BaseService<SaleProduct> {
  constructor() {
    super("sale_products");
  }

  async getAll(params?: Record<string, unknown>) {
    const data = await super.getAll(params);
    
    // Se a API retornar uma array pura em vez de um objeto com "items", adaptamos o formato
    if (Array.isArray(data)) {
      return {
        items: data,
        page: 1,
        page_size: data.length,
        total_items: data.length,
        total_pages: 1,
      } as any;
    }
    
    return data as any;
  }
}

export const saleProductsService = new SaleProductsService();
