import BaseService from "@/services/BaseService";

export class CategoryService extends BaseService {
  constructor() {
    super("categories");
  }
}

export const categoriesService = new CategoryService();
