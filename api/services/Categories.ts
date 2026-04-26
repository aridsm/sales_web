import BaseService from "@/api/services/BaseService";

export class CategoryService extends BaseService {
  constructor() {
    super("categories");
  }
}

export const categoriesService = new CategoryService();
