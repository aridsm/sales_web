import BaseService from "@/services/BaseService";

export class ProductService extends BaseService {
  constructor() {
    super("products");
  }
}

export const productsService = new ProductService();
