import BaseService from "@/api/services/BaseService";
import { Category, CategoryForm, CategoryAmount } from "@/api/schemas/Category";
import { axiosClient } from "@/api/axiosClient";
import { CategoryType } from "@/enums/CategoryType";

export class CategoryService extends BaseService<Category, CategoryForm> {
  constructor() {
    super("categories");
  }

  async getAmounts(
    params: {
      start_created_at?: string;
      end_created_at?: string;
      type?: CategoryType;
    } = {},
  ): Promise<CategoryAmount> {
    return (
      await axiosClient.get(`/${this.resource}/amounts`, {
        params,
      })
    ).data;
  }
}

export const categoriesService = new CategoryService();
