import BaseService from "@/api/services/BaseService";

export class ProductService extends BaseService {
  constructor() {
    super("products");
  }
}

export const productsService = new ProductService();
