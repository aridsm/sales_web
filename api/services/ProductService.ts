import BaseService from "@/api/services/BaseService";
import { Product, ProductForm } from "@/api/schemas/Product";

export class ProductService extends BaseService<Product, ProductForm> {
  constructor() {
    super("products");
  }
}

export const productsService = new ProductService();
