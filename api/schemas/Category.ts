import { CategoryType } from "@/enums/CategoryType";

export interface Category {
  id: string;
  name: string;
  color: string;
  type: CategoryType;
}

export interface CategoryAmount {
  items: CategoryAmountItem[];
  total: number;
}

export interface CategoryAmountItem {
  category_id: string;
  category_name: string;
  category_color: string;
  value: number;
}

export interface CategoryForm extends Omit<Category, "id"> {}
