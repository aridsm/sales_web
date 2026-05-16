import BaseService from "@/api/services/BaseService";
import { Category, CategoryForm } from "@/api/schemas/Category";

export class CategoryService extends BaseService<Category, CategoryForm> {
  constructor() {
    super("categories");
  }
}

export const categoriesService = new CategoryService();
